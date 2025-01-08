const couchbase = require("couchbase");
const logger = require("../configurations/logger"); // Use the Winston logger

// Similarity search for songs based on music_vector with filtering
exports.similaritySearch = async (req, res) => {
  const { songName, language, yearRangeStart, yearRangeEnd } = req.query; // Now accepting language and year range as query parameters

  if (!songName) {
    return res.status(400).json({ error: "Song name is required" });
  }

  try {
    // Connect to the Couchbase cluster
    const cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });

    // Open the specified bucket and scope
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const scope = bucket.scope(process.env.COUCHBASE_SCOPE_DIRECTUS);
    const ftsIndexName = "fts_library"; // Full scoped FTS index name

    // Step 1: FTS Query across all fields to get the document ID (meta().id)
    const ftsResult = await scope.search(
      ftsIndexName,
      couchbase.SearchQuery.match(songName), // Search across all fields
      {
        limit: 1, // We only need 1 document
        fields: ["id"], // Return all document fields
      },
    );

    // Check if any results were found
    if (!ftsResult?.rows?.length) {
      return res
        .status(404)
        .json({ message: `No results found for song: ${songName}` });
    }

    // Extract the document ID from the FTS result
    const documentId = ftsResult.rows[0].id;

    // Step 2: Key-Value Lookup using the document ID to retrieve the music_vector
    const collection = scope.collection(process.env.COUCHBASE_COLLECTION_MUSIC);
    const docResult = await collection.get(documentId);

    if (!docResult?.content) {
      return res
        .status(404)
        .json({ message: `No document found for ID: ${documentId}` });
    }

    const genreVector = docResult.content.music_vector;
    if (!genreVector) {
      return res
        .status(404)
        .json({ message: `No music_vector found in document: ${documentId}` });
    }

    // Step 3: Perform KNN (Vector) Search using the retrieved music_vector with a higher number of candidates
    const knnResult = await scope.search(
      ftsIndexName,
      couchbase.SearchRequest.create(
        couchbase.VectorSearch.fromVectorQuery(
          couchbase.VectorQuery.create(
            "music_vector",
            genreVector,
          ).numCandidates(50), // Increased number of KNN candidates
        ),
      ),
      {
        fields: [
          "artist",
          "album",
          "albumart",
          "song",
          "lyrics",
          "language",
          "year",
        ],
      }, // Include year and language in fields
    );

    if (!knnResult?.rows?.length) {
      return res.status(404).json({ message: "No similar songs found." });
    }

    // Step 4: Filter the KNN results based on language and year range from the query
    const similarSongs = knnResult.rows
      .filter((row) => {
        // Apply language filter if provided
        if (language && row.fields.language !== language) {
          return false;
        }
        // Apply year range filter if provided
        const songYear = row.fields.year;
        if (
          yearRangeStart &&
          yearRangeEnd &&
          (songYear < yearRangeStart || songYear > yearRangeEnd)
        ) {
          return false;
        }
        return true;
      })
      .map((row) => ({
        id: row.id,
        artist: row.fields.artist,
        album: row.fields.album,
        albumart: row.fields.albumart,
        song: row.fields.song,
        lyrics: row.fields.lyrics,
        language: row.fields.language,
        year: row.fields.year,
      }));

    // Return the filtered result as a response
    res.status(200).json({ similarSongs });
  } catch (error) {
    // Log detailed error information
    console.error("Error performing FTS and music_vector search:", error);
    if (error?.cause) {
      console.error("Cause:", error.cause);
    }
    if (error?.context) {
      console.error("Context:", error.context);
    }
    return res.status(500).json({
      message: "Error performing FTS and music_vector search",
      error: error.message,
    });
  }
};

// New function to fetch the music vector data with genres, artist, song, and language
exports.getMusicVectors = async (req, res) => {
  try {
    // Connect to the Couchbase cluster
    const cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });

    // Open the bucket and run the query
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const scope = bucket.scope(process.env.COUCHBASE_SCOPE_DIRECTUS);

    const query = `
      SELECT id, artist, song, \`language\`, genres, music_vector
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_MUSIC}\`
      WHERE music_vector IS NOT NULL AND ARRAY_LENGTH(music_vector) > 0
    `;

    const result = await cluster.query(query);

    // Disable caching by setting Cache-Control to no-store
    res.set("Cache-Control", "no-store");

    // Return the result as a JSON response
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing the query for music vectors:", error);
    return res.status(500).json({
      message: "Error fetching music vectors",
      error: error.message,
    });
  }
};

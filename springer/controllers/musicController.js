// controllers/musicController.js
const { connectToCouchbase } = require("../configurations/couchbaseConnection");
const logger = require("../configurations/logger"); // Use the Winston logger

// Existing function to fetch the next available ID
exports.getNextAvailableId = async (req, res) => {
  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_MUSIC;

    const query = `
      SELECT MAX(m.id) + 1 AS highest_id
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\` m`;

    const result = await cluster.query(query);
    const nextId = result.rows[0]?.highest_id || 1;

    res.json({ nextId });
  } catch (error) {
    logger.error("Error fetching next available ID from Couchbase", error);
    res.status(500).json({ error: "Error fetching next available ID" });
  }
};

// controllers/musicController.js
exports.getGenreSuggestions = async (req, res) => {
  const { prefix } = req.query;

  // Extract only the last term from the comma-separated input
  const lastPrefix = prefix.split(",").pop().trim();

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_VECTORS;

    const query = `
      SELECT ARRAY_AGG(genre) AS suggestions
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\` AS v
      UNNEST v.genres AS genre
      WHERE META(v).id = "2" AND lower(genre) LIKE lower("${lastPrefix}%")`;

    const result = await cluster.query(query);
    const suggestions = result.rows[0]?.suggestions || [];

    res.json({ suggestions });
  } catch (error) {
    logger.error("Error fetching genre suggestions", error);
    res.status(500).json({ error: "Error fetching genre suggestions" });
  }
};

// controllers/musicController.js
exports.getLanguageSuggestions = async (req, res) => {
  const { prefix } = req.query;
  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_VECTORS; // Adjust collection if different

    const query = `
      SELECT ARRAY_AGG(lang) AS suggestions
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\` AS v
      UNNEST v.languages AS lang
      WHERE META(v).id = "2" AND lower(lang) LIKE lower("${prefix}%")`;

    const result = await cluster.query(query);
    const suggestions = result.rows[0]?.suggestions || [];

    res.json({ suggestions });
  } catch (error) {
    logger.error("Error fetching language suggestions", error);
    res.status(500).json({ error: "Error fetching language suggestions" });
  }
};

exports.fetchArtists = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json({ artists: [] });

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scope = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collection = process.env.COUCHBASE_COLLECTION_VECTORS;

    const sqlQuery = `
      SELECT DISTINCT artist
      FROM \`${bucketName}\`.\`${scope}\`.\`${collection}\` AS v
      UNNEST v.artists AS artist
      WHERE LOWER(artist) LIKE LOWER($query || "%")
      ORDER BY artist ASC
      LIMIT 3
    `;
    const result = await cluster.query(sqlQuery, { parameters: { query } });

    const artists = result.rows.map((row) => row.artist);
    res.json({ artists });
  } catch (error) {
    logger.error("Error fetching artist suggestions:", error);
    res.status(500).json({ error: "Error fetching artist suggestions" });
  }
};

// controllers/musicController.js
exports.insertDocument = async (req, res) => {
  const {
    id,
    meta_id,
    album,
    albumart,
    artist,
    language,
    lyrics,
    song,
    type,
    year,
    date_created,
  } = req.body;

  // Format genres as an array if it’s a comma-separated string
  const genres =
    typeof req.body.genres === "string"
      ? req.body.genres.split(",").map((genre) => genre.trim()) // Split by comma and trim whitespace
      : req.body.genres; // Assume it's already an array if not a string

  const dateCreated = date_created || new Date().toISOString(); // Default to current timestamp if not provided

  try {
    const { cluster } = await connectToCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const collection = bucket
      .scope(process.env.COUCHBASE_SCOPE_DIRECTUS)
      .collection(process.env.COUCHBASE_COLLECTION_MUSIC);

    const document = {
      id,
      meta_id,
      album,
      albumart,
      artist,
      genres,
      language,
      lyrics,
      song,
      type,
      year,
      date_created: dateCreated,
    };

    await collection.upsert(`pg_doc_${id}`, document); // Use upsert to insert the document with key pg_doc_<id>

    res.status(201).json({ message: "Document inserted successfully" });
  } catch (error) {
    logger.error("Error inserting document into Couchbase", error);
    res.status(500).json({ error: "Error inserting document" });
  }
};

// Function to fetch music data with pagination
exports.fetchMusicData = async (req, res) => {
  const { page = 1, pageSize = 6 } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_MUSIC;

    const query = `
      SELECT id, artist, album, song, albumart, lyrics
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\` m
      WHERE m.type = 'demo' OR m.type = 'song'
      ORDER BY date_created DESC
      LIMIT ${pageSize}
      OFFSET ${offset}`;

    const result = await cluster.query(query);

    const musicData = result.rows.map((item) => ({
      id: item.id || "N/A",
      artist: item.artist || "Unknown Artist",
      album: item.album || "Unknown Album",
      song: item.song || "Unknown Song",
      albumart: item.albumart || "",
      lyrics: item.lyrics || "",
    }));

    const totalCountQuery = `
      SELECT COUNT(*)
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\``;
    const countResult = await cluster.query(totalCountQuery);
    const totalCount = countResult.rows[0]?.["$1"] || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      musicData,
      currentPage: parseInt(page, 10),
      totalPages: totalPages,
    });
  } catch (error) {
    logger.error("Error fetching music data from Couchbase", error);
    res.status(500).json({ error: "Error fetching music data" });
  }
};

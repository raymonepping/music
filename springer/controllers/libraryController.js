// controllers/libraryController.js
const express = require("express");
const router = express.Router();

const getScope = require("../configurations/getScope");

const logger = require("../configurations/logger"); // Import Winston logger

const { connectToCouchbase } = require("../configurations/couchbaseConnection");
const couchbase = require("couchbase");

// General search across all fields (artist, album, song, lyrics)
router.post("/library-search", async (req, res) => {
  const { artist = "", album = "", song = "", fulltext = "" } = req.body;

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_MUSIC;

    const searchQuery = `
      SELECT META().id AS document_id
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      WHERE LOWER(artist) LIKE "%${artist.toLowerCase()}%"
      OR LOWER(album) LIKE "%${album.toLowerCase()}%"
      OR LOWER(song) LIKE "%${song.toLowerCase()}%"
      OR LOWER(lyrics) LIKE "%${fulltext.toLowerCase()}%"`;

    logger.debug("Running general search query:", searchQuery);
    const queryResult = await cluster.query(searchQuery);
    const documentIds = queryResult.rows.map((row) => row.document_id);

    if (documentIds.length === 0) {
      return res.json({ musicData: [], error: "No matching documents found." });
    }

    const detailQuery = `
      SELECT *
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      USE KEYS ${JSON.stringify(documentIds)}`;

    logger.debug("Running detailed search query:", detailQuery);
    const detailResult = await cluster.query(detailQuery);

    res.json({ musicData: detailResult.rows, error: null });
  } catch (error) {
    console.error("Error performing library search:", error);
    res
      .status(500)
      .json({ error: "Error performing library search. Please try again." });
  }
});

// Full-text search using scoped FTS index
router.post("/fulltext-search", async (req, res) => {
  const { fulltext = "" } = req.body;

  if (!fulltext.trim()) {
    return res
      .status(400)
      .json({ message: "Full-text search query cannot be empty." });
  }

  try {
    // Get the Couchbase cluster and scope
    const { scope, cluster } = await getScope();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const ftsIndexName = `${bucketName}.${scopeDirectus}.fts_library`; // Full scoped FTS index name

    // Build the FTS query using the match query for general search across all fields
    const query = couchbase.SearchQuery.match(fulltext); // General match query
    logger.debug("Constructed FTS query:", query);

    // Execute the FTS search query using the cluster object with fully scoped index name
    const result = await cluster.searchQuery(ftsIndexName, query, {
      limit: 20, // Adjust the limit as needed
      fields: ["*"], // Fetch all fields
      highlight: {},
    });

    logger.debug("Raw FTS result:", result);

    // Check if results exist
    if (result && result.rows.length > 0) {
      // Extract the required fields from the FTS result
      const transformedResult = result.rows.map((row) => {
        const fields = row.fields;

        return {
          id: fields.id || "Unknown",
          artist: fields.artist || "Unknown Artist",
          album: fields.album || "Unknown Album",
          song: fields.song || "Unknown Song",
          albumart: fields.albumart || null,
          date_created: fields.date_created || null,
          lyrics: fields.lyrics || "",
        };
      });

      // Send the transformed result as the response
      res.status(200).json({ musicData: transformedResult });
    } else {
      res.status(404).json({ message: "No music data found." });
    }
  } catch (error) {
    // Log the error and return a 500 status with an error message
    logger.error("Error performing FTS search:", { error });
    res.status(500).json({ message: "Error performing FTS search" });
  }
});

// Search for artists
router.post("/artist-search", async (req, res) => {
  const { artist = "" } = req.body;

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_MUSIC;

    const searchQuery = `
      SELECT META().id AS document_id
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      WHERE LOWER(artist) LIKE "%${artist.toLowerCase()}%"`;

    const queryResult = await cluster.query(searchQuery);
    const documentIds = queryResult.rows.map((row) => row.document_id);

    if (documentIds.length === 0) {
      return res.json({ musicData: [], error: "No matching artists found." });
    }

    const detailQuery = `
      SELECT *
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      USE KEYS ${JSON.stringify(documentIds)}`;

    // Log the result of the detailed query
    const detailResult = await cluster.query(detailQuery);

    res.json({ musicData: detailResult.rows, error: null });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error performing artist search. Please try again." });
  }
});

// Search for albums
router.post("/album-search", async (req, res) => {
  const { album = "" } = req.body;

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_MUSIC;

    const searchQuery = `
      SELECT META().id AS document_id
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      WHERE LOWER(album) LIKE "%${album.toLowerCase()}%"`;

    const queryResult = await cluster.query(searchQuery);
    const documentIds = queryResult.rows.map((row) => row.document_id);

    if (documentIds.length === 0) {
      return res.json({ musicData: [], error: "No matching albums found." });
    }

    // was *
    const detailQuery = `
      SELECT id, artist, album, song, albumart, lyrics
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      USE KEYS ${JSON.stringify(documentIds)}`;

    const detailResult = await cluster.query(detailQuery);

    res.json({ musicData: detailResult.rows, error: null });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error performing album search. Please try again." });
  }
});

// Search for songs
router.post("/song-search", async (req, res) => {
  const { song = "" } = req.body;

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET;
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS;
    const collectionDirectus = process.env.COUCHBASE_COLLECTION_MUSIC;

    const searchQuery = `
      SELECT META().id AS document_id
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      WHERE LOWER(song) LIKE "%${song.toLowerCase()}%"`;

    const queryResult = await cluster.query(searchQuery);
    const documentIds = queryResult.rows.map((row) => row.document_id);

    if (documentIds.length === 0) {
      return res.json({ musicData: [], error: "No matching songs found." });
    }

    // was *
    const detailQuery = `
      SELECT id, artist, album, song, albumart, lyrics
      FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionDirectus}\`
      USE KEYS ${JSON.stringify(documentIds)}`;

    const detailResult = await cluster.query(detailQuery);

    res.json({ musicData: detailResult.rows, error: null });
  } catch (error) {
    console.error("Error performing song search:", error);
    res
      .status(500)
      .json({ error: "Error performing song search. Please try again." });
  }
});

module.exports = router;

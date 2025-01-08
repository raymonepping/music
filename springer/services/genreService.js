const { connectToCouchbase } = require("../configurations/couchbaseConnection");
const logger = require("../configurations/logger");
const { getGenresFromCouchbase } = require("../utilities/getGenresFromCouchbase");

// Function to look up genre based on song, album, or artist
async function lookupGenre(song = null, album = null, artist = null) {
  if (!artist) return null; // Artist is mandatory for meaningful query

  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET || "demo";
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
    const collectionMusic = process.env.COUCHBASE_COLLECTION_MUSIC || "music";
    const collectionAlbums = process.env.COUCHBASE_COLLECTION_ALBUMS || "albums";

    // Construct query based on provided parameters
    let query = "";
    const options = { parameters: {} };

    if (song) {
      query = `
        SELECT genres
        FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionMusic}\`
        WHERE LOWER(song) = $song AND LOWER(artist) = $artist
        LIMIT 1;
      `;
      options.parameters.song = song.toLowerCase();
      options.parameters.artist = artist.toLowerCase();
    } else if (album) {
      query = `
        SELECT genres
        FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionAlbums}\`
        WHERE album = $album AND LOWER(artist) = $artist
        LIMIT 1;
      `;
      options.parameters.album = album;
      options.parameters.artist = artist.toLowerCase();
    }

    const result = await cluster.query(query, options);

    // Return genres if found, or null
    if (result.rows.length > 0 && result.rows[0].genres) {
      return result.rows[0].genres.map((genre) => genre.toLowerCase()); // Normalize genres to lowercase
    }

    return null;
  } catch (error) {
    logger.error("Error looking up genre:", error);
    return null;
  }
}

// Function to extract genre dynamically from a user's message
async function extractGenreFromMessage(message) {
  const genres = await getGenresFromCouchbase(); // Fetch genres dynamically from Couchbase

  // Match genre from the message using case-insensitive comparison
  const genreRegex = new RegExp(`\\b(${genres.join("|")})\\b`, "i");
  const genreMatch = message.match(genreRegex);

  if (genreMatch) {
    return genreMatch[1].toLowerCase(); // Return matched genre in lowercase
  }
  return ""; // Return empty string if no match found
}

module.exports = { lookupGenre, extractGenreFromMessage };

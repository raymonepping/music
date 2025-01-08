// getGenresFromCouchbase.js

const { connectToCouchbase } = require("../configurations/couchbaseConnection");
const logger = require("../configurations/logger");

async function getGenresFromCouchbase() {
  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET || "demo";
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
    const collectionVectors =
      process.env.COUCHBASE_COLLECTION_VECTORS || "vectors";

    // Fetch the document containing genres
    const query = `
            SELECT OBJECT_NAMES(v.genres) AS genreNames
            FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionVectors}\` v
            WHERE v.meta_id = "1"`;

    logger.debug(`Executing query: ${query}`);

    const result = await cluster.query(query);

    logger.debug(`Query result: ${JSON.stringify(result.rows)}`);

    if (result.rows.length > 0) {
      const genreNames = result.rows[0].genreNames;
      const genresList = genreNames.map((genre) => genre.toLowerCase());
      logger.debug(`Fetched genres: ${JSON.stringify(genresList)}`);
      return genresList; // Return list of genres in lowercase
    } else {
      logger.error("No genres found in Couchbase document.");
      return [];
    }
  } catch (error) {
    logger.error("Error fetching genres from Couchbase:", error);
    return [];
  }
}

// Add this line to export the function
module.exports = { getGenresFromCouchbase };

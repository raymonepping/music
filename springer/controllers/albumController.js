const { getClusterCollection } = require("../configurations/couchbasePool");
const logger = require("../configurations/logger"); // Use the Winston logger

// Function to fetch album data with pagination
exports.fetchAlbumData = async (req, res) => {
  const { page = 1, pageSize = 6 } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    // Get the collection from the pool
    const collection = await getClusterCollection(
      process.env.COUCHBASE_COLLECTION_ALBUMS,
      process.env.COUCHBASE_SCOPE_DIRECTUS
    );

    // Query to fetch album data with pagination
    const query = `
      SELECT META().id, artist, album, year, release_date, albumart
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_ALBUMS}\`
      WHERE type = 'album'
      ORDER BY artist ASC
      LIMIT ${pageSize}
      OFFSET ${offset}`;

    const result = await collection.cluster.query(query);

    // Log the result to see the data being returned
    logger.debug(`Album data fetched: ${JSON.stringify(result.rows)}`);

    // Query to get the total count of documents
    const totalCountQuery = `
      SELECT COUNT(*)
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_ALBUMS}\``;
    const countResult = await collection.cluster.query(totalCountQuery);
    const totalCount = countResult.rows[0]["$1"];
    const totalPages = Math.ceil(totalCount / pageSize);

    // Respond with the album data and pagination info
    res.json({
      albumData: result.rows,
      currentPage: parseInt(page, 10),
      totalPages: totalPages,
    });
  } catch (error) {
    logger.error("Error fetching album data from Couchbase:", error);
    res.status(500).json({ error: "Error fetching album data from Couchbase" });
  }
};

// Function to update album data by document key (id)
exports.updateAlbumById = async (req, res) => {
  const albumId = req.params.id; // Use the document key to identify the album
  const { year, release_date, albumart } = req.body;

  try {
    // Get the collection from the pool
    const collection = await getClusterCollection(
      process.env.COUCHBASE_COLLECTION_ALBUMS,
      process.env.COUCHBASE_SCOPE_DIRECTUS
    );

    // Fetch the existing document
    const getResult = await collection.get(albumId); // Use the document key
    const albumData = getResult.content;

    // Update the fields
    albumData.year = year;
    albumData.release_date = release_date;
    albumData.albumart = albumart;

    // Replace the document with updated data
    await collection.replace(albumId, albumData);

    res.json({ success: true });
  } catch (error) {
    logger.error("Error updating album data in Couchbase:", error);
    res.status(500).json({ error: "Error updating album data in Couchbase" });
  }
};

const { getClusterCollection } = require("../configurations/couchbasePool");
const logger = require("../configurations/logger");

exports.getMusicAggregations = async (req, res) => {
  try {
    logger.info("Fetching Couchbase collection for music aggregations...");
    const collection = await getClusterCollection(
      process.env.COUCHBASE_COLLECTION_ANALYTICS
    );

    const query = `
      SELECT m.*
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_ANALYTICS}\` AS i
      UNNEST i.stats.music_aggregations AS m
    `;

    logger.debug("Executing query:", query);

    const result = await collection.cluster.query(query); // Use the cluster.query method

    logger.info(
      `Query executed successfully. Number of rows fetched: ${result.rows.length}`
    );

    if (result.rows.length === 0) {
      logger.warn("No music aggregations found in the analytics data.");
      return res.status(404).json({ error: "No music aggregations found" });
    }

    logger.info("Music aggregations found, sending response...");
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching music aggregations:", error);

    if (error.context) {
      logger.error("Query Error Context:", error.context);
    }

    res.status(500).json({ error: "Failed to fetch music aggregations" });
  }
};

exports.getMusicAnalytics = async (req, res) => {
  try {
    logger.info("Fetching Couchbase collection for music analytics...");
    const collection = await getClusterCollection(
      process.env.COUCHBASE_COLLECTION_ANALYTICS
    );

    const query = `
      SELECT *
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_ANALYTICS}\`
      WHERE type = "music_and_albums"
      ORDER BY date DESC
      LIMIT 1
    `;

    logger.debug("Executing query:", query);

    const result = await collection.cluster.query(query); // Use the cluster.query method

    logger.info(
      `Query executed successfully. Number of rows fetched: ${result.rows.length}`
    );

    if (result.rows.length === 0) {
      logger.warn("No analytics data found in the collection.");
      return res.status(404).json({ error: "No analytics data found" });
    }

    logger.info("Analytics data found, sending response...");
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error fetching analytics data:", error);

    if (error.context) {
      logger.error("Query Error Context:", error.context);
    }

    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

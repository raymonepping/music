const { getClusterCollection } = require("../configurations/couchbasePool");
const logger = require("../configurations/logger");

exports.getContainerSuggestions = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.json({ containers: [] });
  }

  try {
    const collection = await getClusterCollection(
      process.env.COUCHBASE_COLLECTION_VECTORS
    );

    const queryString = `
      SELECT ARRAY_AGG({
        "container_name": c.container_name,
        "description": c.description
      }) AS containers
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_VECTORS}\` AS v
      UNNEST v.containers AS c
      WHERE LOWER(c.container_name) LIKE LOWER("${query}%")`;

    const result = await collection.cluster.query(queryString); // `cluster.query` executes the N1QL query
    const containers = result.rows[0]?.containers || [];

    res.json({ containers });
  } catch (error) {
    logger.error("Error fetching container suggestions:", error);
    res.status(500).json({ error: "Error fetching container suggestions." });
  }
};

exports.getLogs = async (req, res) => {
  const { container_name, limit = 10 } = req.query;

  if (!container_name) {
    return res.status(400).json({ error: "Container name is required." });
  }

  try {
    const collection = await getClusterCollection(
      process.env.COUCHBASE_COLLECTION_LOGGING
    );

    const queryString = `
      SELECT \`timestamp\`, \`level\`, meta.containerName, message
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_LOGGING}\`
      WHERE LOWER(meta.containerName) = LOWER("${container_name}")
      ORDER BY \`timestamp\` DESC
      LIMIT ${parseInt(limit, 10)}`;

    const result = await collection.cluster.query(queryString); // `cluster.query` executes the N1QL query
    const logs = result.rows || [];

    res.json(logs);
  } catch (error) {
    logger.error("Error fetching logs for container:", error);
    res.status(500).json({ error: "Error fetching logs." });
  }
};

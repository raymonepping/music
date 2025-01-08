const couchbase = require("couchbase");
const logger = require("./logger");

const getScope = async () => {
  try {
    // Log the start of getScope function
    logger.debug("Starting getScope function");

    // Connect to Couchbase Cluster using Winston logger
    logger.info("Attempting to FOO connect to Couchbase Cluster", {
      url: process.env.COUCHBASE_URL,
    });
    const cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });
    logger.info("Connected to Couchbase Cluster successfully.");

    // Open the specified bucket
    logger.info("Opening bucket", { bucket: process.env.COUCHBASE_BUCKET });
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    logger.info("Bucket opened successfully.");

    // Return the specified scope
    logger.info("Getting scope", {
      scope: process.env.COUCHBASE_SCOPE_DIRECTUS,
    });
    const scope = bucket.scope(process.env.COUCHBASE_SCOPE_DIRECTUS);
    logger.info("Scope obtained successfully.");

    // Log successful return of scope and cluster
    logger.debug("Returning scope and cluster from getScope function");
    return { scope, cluster };
  } catch (error) {
    // Log error with Winston
    logger.error("Error getting scope from Couchbase", { error });
    throw error;
  }
};

module.exports = getScope;

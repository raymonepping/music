// configurations/pool.js
const couchbase = require("couchbase");
const config = require("./couchbaseConfig");
const logger = require("./logger");

let cluster, bucket;

// Connect to Couchbase and set up bucket and scope
async function connectToCouchbase() {
  if (!cluster) {
    try {
      cluster = await couchbase.connect(config.connectionString, {
        username: config.username,
        password: config.password,
        configProfile: config.configProfile,
      });
      bucket = cluster.bucket(config.bucketName);
      logger.info("Connected to Couchbase successfully.");
    } catch (error) {
      logger.error("Failed to connect to Couchbase:", error);
      throw error;
    }
  }
  return { cluster, bucket };
}

// Helper function to get a specific collection by name
const getClusterCollection = async (collectionName = config.collectionName) => {
  const { bucket } = await connectToCouchbase();
  const collection = bucket.scope(config.scopeName).collection(collectionName);
  return collection;
};

module.exports = {
  connectToCouchbase,
  getClusterCollection,
};

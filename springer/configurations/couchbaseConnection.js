// database/couchbaseConnection.js
const couchbase = require("couchbase");
const logger = require("./logger");

let cluster, bucket;

const connectToCouchbase = async () => {
  if (cluster && bucket) {
    // Return existing connection if already established
    // logger.info(`Reusing existing Couchbase connection for bucket: ${process.env.COUCHBASE_BUCKET}, cluster: ${process.env.COUCHBASE_URL}`);
    return { cluster, bucket };
  }

  try {
    logger.info(
      `Attempting to connect to Couchbase at ${process.env.COUCHBASE_URL}, bucket: ${process.env.COUCHBASE_BUCKET}`,
    );
    cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
      configProfile: "wanDevelopment",
    });
    bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);

    logger.info(
      `Connected to Couchbase successfully, bucket: ${process.env.COUCHBASE_BUCKET}, scope: ${process.env.COUCHBASE_SCOPE}`,
    );

    return { cluster, bucket };
  } catch (err) {
    logger.error("Failed to connect to Couchbase", { error: err });
    throw err;
  }
};

module.exports = {
  connectToCouchbase,
};

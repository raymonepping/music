// configurations/couchbaseConfig.js
require("dotenv").config();

module.exports = {
  connectionString: process.env.COUCHBASE_URL || "couchbases://cb.host.cloud.couchbase.com",
  username: process.env.COUCHBASE_USERNAME || "couchbase_user",
  password: process.env.COUCHBASE_PASSWORD || "couchbase_password",
  bucketName: process.env.COUCHBASE_BUCKET || "couchbase_bucket",
  scopeName: process.env.COUCHBASE_SCOPE || "couchbase_scope",
  collectionName: process.env.COUCHBASE_COLLECTION || "couchbase_collection",
  configProfile: process.env.COUCHBASE_CONFIG_PROFILE || "wanDevelopment",
};

const couchbase = require("couchbase");
const logger = require("./logger");

class CouchbasePool {
  constructor() {
    this.cluster = null;
    this.buckets = {};
    this.scopes = {};
    this.collections = {};
    this.preloadCollections = [
      { scope: process.env.COUCHBASE_SCOPE_DIRECTUS, collection: process.env.COUCHBASE_COLLECTION_USERS },
      { scope: process.env.COUCHBASE_SCOPE_DIRECTUS, collection: process.env.COUCHBASE_COLLECTION_MUSIC },
      { scope: process.env.COUCHBASE_SCOPE_DIRECTUS, collection: process.env.COUCHBASE_COLLECTION_ALBUMS },
    ];
  }

  async connect() {
    if (!this.cluster) {
      logger.info("Initializing Couchbase cluster connection...");
      this.cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
        username: process.env.COUCHBASE_USERNAME,
        password: process.env.COUCHBASE_PASSWORD,
        configProfile: process.env.COUCHBASE_CONFIG_PROFILE,
      });
      logger.debug("Couchbase cluster connection established successfully.");
    } else {
      logger.debug("Reusing existing Couchbase cluster connection.");
    }
    return this.cluster;
  }

  async getBucket(bucketName) {
    if (!this.buckets[bucketName]) {
      logger.debug(`Fetching bucket: ${bucketName}`);
      const cluster = await this.connect();
      this.buckets[bucketName] = cluster.bucket(bucketName);
      logger.debug(`Bucket initialized: ${bucketName}`);
    } else {
      logger.debug(`Reusing existing bucket: ${bucketName}`);
    }
    return this.buckets[bucketName];
  }

  async getScope(bucketName, scopeName) {
    const bucket = await this.getBucket(bucketName);
    const scopeKey = `${bucketName}.${scopeName}`;
    if (!this.scopes[scopeKey]) {
      logger.debug(`Fetching scope: ${scopeName} in bucket: ${bucketName}`);
      this.scopes[scopeKey] = bucket.scope(scopeName);
      logger.debug(`Scope initialized: ${scopeName} in bucket: ${bucketName}`);
    } else {
      logger.debug(`Reusing existing scope: ${scopeName} in bucket: ${bucketName}`);
    }
    return this.scopes[scopeKey];
  }

  async getCollection(bucketName, scopeName, collectionName) {
    const scope = await this.getScope(bucketName, scopeName);
    const collectionKey = `${bucketName}.${scopeName}.${collectionName}`;
    if (!this.collections[collectionKey]) {
      logger.debug(
        `Fetching collection: ${collectionName} in scope: ${scopeName} of bucket: ${bucketName}`
      );
      this.collections[collectionKey] = scope.collection(collectionName);
      logger.debug(
        `Collection initialized: ${collectionName} in scope: ${scopeName} of bucket: ${bucketName}`
      );
    } else {
      logger.debug(
        `Reusing existing collection: ${collectionName} in scope: ${scopeName} of bucket: ${bucketName}`
      );
    }
    return this.collections[collectionKey];
  }

  async preloadResources() {
    logger.info("Preloading frequently accessed Couchbase collections...");
    for (const { scope, collection } of this.preloadCollections) {
      try {
        logger.debug(`Preloading collection: ${collection} in scope: ${scope}`);
        await this.getCollection(process.env.COUCHBASE_BUCKET, scope, collection);
        logger.debug(`Successfully preloaded collection: ${collection} in scope: ${scope}`);
      } catch (error) {
        logger.warn(
          `Failed to preload collection: ${collection} in scope: ${scope}`,
          { error }
        );
      }
    }
    logger.info("Finished preloading Couchbase collections.");
  }
}

const couchbasePool = new CouchbasePool();
couchbasePool.preloadResources(); // Preload frequently accessed collections

module.exports = {
  ...couchbasePool, // Expose the instance methods
  async getClusterCollection(collectionName, scopeName) {
    return await couchbasePool.getCollection(
      process.env.COUCHBASE_BUCKET,
      scopeName || process.env.COUCHBASE_SCOPE_DIRECTUS,
      collectionName
    );
  },
};

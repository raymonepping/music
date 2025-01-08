const Transport = require("winston-transport");
const { Cluster } = require("couchbase");

const { v4: uuidv4 } = require("uuid");

class CouchbaseTransport extends Transport {
  constructor(opts) {
    super(opts);

    const {
      cluster: clusterUrl,
      username,
      password,
      bucket,
      scope = "logs",
      collection = "entries",
      batchSize = 10,
      batchInterval = 1000,
      maxRetries = 3, // Max retry attempts for initialization and logging
    } = opts;

    this.clusterUrl = clusterUrl;
    this.username = username;
    this.password = password;
    this.bucketName = bucket;
    this.scopeName = scope;
    this.collectionName = collection;
    this.batchSize = batchSize;
    this.batchInterval = batchInterval;
    this.maxRetries = maxRetries;
    this.queue = [];
    this.timer = null;
    this.isReady = false;
    this.retryCount = 0;

    // Initiate connection
    this.init();
  }

  async init() {
    try {
      // console.debug("Connecting to Couchbase cluster...");
      this.cluster = await Cluster.connect(this.clusterUrl, {
        username: this.username,
        password: this.password,
      });
      // console.debug(`Connected to Couchbase cluster at ${this.clusterUrl}.`);
  
      // console.debug(`Opening bucket: ${this.bucketName}`);
      this.bucket = this.cluster.bucket(this.bucketName);
  
      // console.debug(`Accessing scope: ${this.scopeName}`);
      this.scope = this.bucket.scope(this.scopeName);
  
      // console.debug(`Accessing collection: ${this.collectionName}`);
      this.collection = this.scope.collection(this.collectionName);
  
      this.isReady = true;
      this.retryCount = 0;
      // console.info("CouchbaseTransport initialized successfully.");
      this.emit("ready");
      this.flush();
    } catch (error) {
      this.retryCount += 1;
      console.error(
        `Error initializing CouchbaseTransport: ${error.message}. Retrying (${this.retryCount}/${this.maxRetries})...`
      );
  
      if (this.retryCount <= this.maxRetries) {
        setTimeout(() => this.init(), 2000); // Retry after 2 seconds
      } else {
        console.error(
          `Failed to initialize CouchbaseTransport after ${this.maxRetries} attempts.`
        );
        this.emit("error", error);
      }
    }
  }

  log(info, callback) {
    // Add log entry to queue
    this.queue.push(info);

    // Start flush timer if not already set
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchInterval);
    }

    // Call the callback to inform Winston that logging is complete
    callback();
  }

  async flush() {
    // console.debug("Starting flush...");
    if (!this.isReady || this.queue.length === 0) {
      // console.debug("Flush skipped: Transport not ready or queue empty.");
      this.timer = null;
      return;
    }
  
    const batch = this.queue.splice(0, this.batchSize);
    this.timer = null;
  
    // console.debug(`Flushing batch of size: ${batch.length}`);
  
    try {
      const operations = batch.map((info) => {
        const logEntry = {
          level: info.level,
          message: info.message,
          timestamp: info.timestamp || new Date().toISOString(),
          meta: info.meta || {},
        };
  
        const logKey = uuidv4();
        // console.debug(`Upserting log entry with key: ${logKey}`);
        return this.collection.upsert(logKey, logEntry);
      });
  
      await Promise.all(operations);
      // console.debug("Batch flushed successfully.");
    } catch (error) {
      this.retryCount += 1;
      console.error(
        `Error writing logs to Couchbase: ${error.message}. Retrying (${this.retryCount}/${this.maxRetries})...`
      );
  
      if (this.retryCount <= this.maxRetries) {
        setTimeout(() => this.flush(), 2000); // Retry after 2 seconds
      } else {
        console.error(
          `Failed to write logs after ${this.maxRetries} attempts. Stopping retries.`
        );
        this.emit("error", error);
      }
    }
  
    if (this.queue.length > 0 && !this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchInterval);
    }
  }

  async close() {
    try {
      await this.cluster.close();
      this.isReady = false;
      this.emit("close");
    } catch (error) {
      this.emit("error", error);
    }
  }
}

module.exports = CouchbaseTransport;

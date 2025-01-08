// configurations/logger.js

const winston = require("winston");
const dotenv = require("dotenv");
const CouchbaseTransport = require("./CouchbaseTransport");

// Load environment variables from the .env file
dotenv.config();

// Destructure necessary environment variables
const {
  LOG_LEVEL = "info",
  COUCHBASE_URL,
  COUCHBASE_USERNAME,
  COUCHBASE_PASSWORD,
  COUCHBASE_BUCKET,
  COUCHBASE_SCOPE_DIRECTUS = "directus",
  COUCHBASE_COLLECTION_LOGGING = "logging",
  CONTAINER_NAME = "Springer", 
} = process.env;

// Validate required Couchbase environment variables
if (
  !COUCHBASE_URL ||
  !COUCHBASE_USERNAME ||
  !COUCHBASE_PASSWORD ||
  !COUCHBASE_BUCKET
) {
  throw new Error("Missing required Couchbase environment variables.");
}

// Function to add containerName to meta
const addContainerNameToMeta = winston.format((info) => {
  if (!info.meta) {
    info.meta = {};
  }
  info.meta.containerName = CONTAINER_NAME;
  return info;
});

// Console transport with a clear timestamp format and container name
const consoleTransport = new winston.transports.Console({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Explicit timestamp format
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      let logMessage = `${timestamp} [${level.toUpperCase()}] [${CONTAINER_NAME}]: ${message}`;
      if (Object.keys(metadata).length > 0) {
        logMessage += ` ${JSON.stringify(metadata)}`;
      }
      return logMessage;
    }),
  ),
});

// CouchbaseTransport to store logs in Couchbase with the container name in meta
const couchbaseTransport = new CouchbaseTransport({
  cluster: COUCHBASE_URL,
  username: COUCHBASE_USERNAME,
  password: COUCHBASE_PASSWORD,
  bucket: COUCHBASE_BUCKET,
  scope: COUCHBASE_SCOPE_DIRECTUS,
  collection: COUCHBASE_COLLECTION_LOGGING,
  batchSize: 20,
  batchInterval: 2000,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    addContainerNameToMeta(), // Add containerName to meta
    winston.format.json(),
  ),
});

const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports: [
    consoleTransport, // Keep the console transport for logs
    couchbaseTransport, // Comment this out to temporarily disable CouchbaseTransport
  ],
  exitOnError: false,
});

// Debug message to confirm log level and container name
logger.debug(
  `Current log level is set to: ${LOG_LEVEL}, running in container: ${CONTAINER_NAME}`,
);

logger.debug(
  "Initializing logger with CouchbaseTransport and console transport."
);

// Verify if CouchbaseTransport is active
logger.debug(
  `CouchbaseTransport enabled with batch size: ${couchbaseTransport.batchSize} and interval: ${couchbaseTransport.batchInterval}ms.`
);

// Graceful shutdown handling for SIGTERM and SIGINT
const handleShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`, {
    containerName: CONTAINER_NAME,
  });
  for (const transport of logger.transports) {
    if (transport instanceof CouchbaseTransport) {
      await transport.close();
      logger.info("Closed CouchbaseTransport connection.", {
        containerName: CONTAINER_NAME,
      });
    }
  }
  process.exit(0);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// Export logger
module.exports = logger;

const express = require("express");
const router = express.Router();
const couchbase = require("couchbase");

// Import the controllers
const albumRoutes = require("./routes/albumRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const gameRoutes = require("./routes/gameRoutes");
const libraryController = require("./controllers/libraryController");
const logsRoutes = require("./routes/logsRoutes");
const musicRoutes = require("./routes/musicRoutes");
const userRoutes = require("./routes/userRoutes");
const vectorRoutes = require("./routes/vectorRoutes");

require("dotenv").config();

const httpLogger = require("./configurations/morganLogger");
const logger = require("./configurations/logger"); // Import Winston logger

// Couchbase connection details
const clusterConnStr = process.env.COUCHBASE_URL;
const username = process.env.COUCHBASE_USERNAME;
const password = process.env.COUCHBASE_PASSWORD;
const bucketName = process.env.COUCHBASE_BUCKET;
const scopeName = process.env.COUCHBASE_SCOPE;
const collectionName = process.env.COUCHBASE_COLLECTION;

let cluster, bucket, collection;

/**
 * Initialize Couchbase connection using credentials from .env file.
 */
(async () => {
  try {
    logger.info("Attempting to connect to Couchbase using .env settings...");
    cluster = await couchbase.connect(clusterConnStr, {
      username: username,
      password: password,
      configProfile: "wanDevelopment", // Configuration profile for WAN connections
    });

    bucket = cluster.bucket(bucketName);
    collection = bucket.scope(scopeName).collection(collectionName);

    logger.info("Connected to Couchbase successfully.");
  } catch (err) {
    logger.error("Failed to connect to Couchbase:", err);
  }
})();

// Route to handle album-related operations (e.g., fetch, add, update albums)
router.use("/albums", albumRoutes);

// Route to handle analytics-related operations
router.use("/analytics", analyticsRoutes);

// Route for handling chatbot functionality (e.g., conversational AI queries)
router.use("/chatbot", chatbotRoutes);

// Route for game-related endpoints, such as initiating games and handling game data
router.use("/game", gameRoutes);

// Route to manage the library, including search and retrieval of music data
router.use("/library", libraryController);

router.use("/logs", logsRoutes);

// Route for music-specific actions, such as fetching songs, lyrics, and artist info
router.use("/music", musicRoutes);

// Route for user-specific actions, such as creating and validating users
router.use("/users", userRoutes);

// Routes for vector similarity calculations, specifically for finding similar items
router.use("/similarity", vectorRoutes);

// Routes for direct vector operations (e.g., adding, retrieving, updating vectors)
router.use("/vectors", vectorRoutes);

module.exports = router;

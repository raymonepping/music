// routes/index.js
const express = require("express");
const router = express.Router();

// Import different route modules
const albumRoutes = require("./albumRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const chatRoutes = require("./chatbotRoutes");
const gameRoutes = require("./gameRoutes");
const libraryRoutes = require("./libraryRoutes");
const logsRoutes = require("./logsRoutes");
const musicRoutes = require("./musicRoutes");
const userRoutes = require("./userRoutes");
const vectorRoutes = require("./vectorRoutes");

// Use the routes
router.use("/albums", albumRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/chatbot", chatRoutes);
router.use("/game", gameRoutes);
router.use("/library", libraryRoutes);
router.use("/logs", logsRoutes);
router.use("/music", musicRoutes);
router.use("/users", userRoutes);
router.use("/similarity", vectorRoutes);

module.exports = router;

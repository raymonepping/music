// routes/logsRoutes.js
const express = require("express");
const router = express.Router();
const logsController = require("../controllers/logsController");

// Route to get container suggestions for auto-complete
router.get("/containers", logsController.getContainerSuggestions);
router.get("/autocomplete", logsController.getContainerSuggestions);

// Route to fetch logs for a specific container
router.get("/", logsController.getLogs);

module.exports = router;

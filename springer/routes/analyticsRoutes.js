const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Define the route at the root path
router.get("/", analyticsController.getMusicAnalytics);

router.get("/music-aggregations", analyticsController.getMusicAggregations);

module.exports = router;

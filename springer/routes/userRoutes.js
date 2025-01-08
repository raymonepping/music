// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Route to create a user with a unique username
router.post("/create-user", userController.createOrFindUsername);

// User login route
router.post("/login", userController.loginUser);

module.exports = router;

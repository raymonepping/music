// routes/chatbotRoutes.js
const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Chatbot interactions and chat storage
 */

/**
 * @swagger
 * /api/chatbot/store:
 *   post:
 *     summary: Store chatbot interactions
 *     description: Stores user interactions with the chatbot.
 *     tags: [Chatbot]
 *     requestBody:
 *       description: Chat interaction data to store
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user interacting with the chatbot
 *               message:
 *                 type: string
 *                 description: Message sent by the user
 *               response:
 *                 type: string
 *                 description: Response from the chatbot
 *     responses:
 *       200:
 *         description: Chat stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/store", chatbotController.handleChat);

module.exports = router;

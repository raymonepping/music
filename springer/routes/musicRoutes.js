const express = require("express");
const router = express.Router();
const musicController = require("../controllers/musicController");

/**
 * @swagger
 * tags:
 *   name: Music
 *   description: Music data management and retrieval
 */

/**
 * @swagger
 * /api/music:
 *   get:
 *     summary: Fetch music data with pagination
 *     description: Retrieves paginated music data.
 *     tags: [Music]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully fetched music data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   album:
 *                     type: string
 *                   genre:
 *                     type: string
 */
router.get("/", musicController.fetchMusicData);

/**
 * @swagger
 * /api/music/next-id:
 *   get:
 *     summary: Fetch the next available ID
 *     description: Retrieves the next available ID for a new music entry.
 *     tags: [Music]
 *     responses:
 *       200:
 *         description: Next available ID fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nextId:
 *                   type: string
 *                   description: The next available ID
 */
router.get("/next-id", musicController.getNextAvailableId);

// routes/musicRoutes.js
router.get("/genre-suggestions", musicController.getGenreSuggestions);

router.get("/artists", musicController.fetchArtists);

/**
 * @swagger
 * /api/music/language-suggestions:
 *   get:
 *     summary: Fetch language suggestions based on a prefix
 *     description: Retrieves a list of languages matching the given prefix for auto-complete purposes in the editor.
 *     tags: [Music]
 *     parameters:
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *         required: true
 *         description: The prefix to search for matching languages (e.g., "Eng" for "English").
 *     responses:
 *       200:
 *         description: Language suggestions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of matching language suggestions
 *       400:
 *         description: Bad request, invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get("/language-suggestions", musicController.getLanguageSuggestions);

/**
 * @swagger
 * /api/music:
 *   post:
 *     summary: Insert a new music document
 *     description: Inserts a new document into the music collection.
 *     tags: [Music]
 *     requestBody:
 *       description: Music document to insert
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               album:
 *                 type: string
 *               genre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Music document inserted successfully
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
router.post("/", musicController.insertDocument);

module.exports = router;

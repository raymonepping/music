const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Game management and interactions
 */

/**
 * @swagger
 * /api/game/start:
 *   post:
 *     summary: Start a new game
 *     description: Initializes a new game session.
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Game started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameId:
 *                   type: string
 *                   description: ID of the newly started game
 */
router.post("/start", gameController.startGame);

/**
 * @swagger
 * /api/game/{gameId}/random-songs:
 *   get:
 *     summary: Fetch random songs for the game
 *     description: Retrieves random songs for the specified game session.
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: ID of the game session
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Random songs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   songId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 */
router.get("/:gameId/random-songs", gameController.fetchRandomSongs);

/**
 * @swagger
 * /api/game/progress:
 *   post:
 *     summary: Update game progress
 *     description: Updates the progress of an ongoing game session.
 *     tags: [Games]
 *     requestBody:
 *       description: Data required to update game progress
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *               currentRound:
 *                 type: integer
 *               selectedSongId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Game progress updated successfully
 */
router.post("/progress", gameController.updateGameProgress);

/**
 * @swagger
 * /api/game/top-songs:
 *   get:
 *     summary: Fetch top 5 most picked songs
 *     description: Retrieves the top 5 most selected songs across all games.
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Top 5 songs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   songId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   pickCount:
 *                     type: integer
 */
router.get("/top-songs", gameController.getTop5Songs);

/**
 * @swagger
 * /api/game/leaderboard:
 *   get:
 *     summary: Fetch the top 5 leaderboard
 *     description: Retrieves the top 5 players on the leaderboard.
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Top 5 leaderboard fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: string
 *                   playerName:
 *                     type: string
 *                   score:
 *                     type: integer
 */
router.get("/leaderboard", gameController.getTop5Songs);

module.exports = router;

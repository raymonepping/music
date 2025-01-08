const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/libraryController");

/**
 * @swagger
 * tags:
 *   name: Library
 *   description: Library search and filtering
 */

/**
 * @swagger
 * /api/library/library-search:
 *   post:
 *     summary: General library search
 *     description: Searches across artists, albums, songs, and lyrics.
 *     tags: [Library]
 *     requestBody:
 *       description: Search parameters
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Search term to query across all fields
 *     responses:
 *       200:
 *         description: Library search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   artist:
 *                     type: string
 *                   album:
 *                     type: string
 *                   song:
 *                     type: string
 *                   lyrics:
 *                     type: string
 */
router.post("/library-search", libraryController.librarySearch);

/**
 * @swagger
 * /api/library/artist-search:
 *   post:
 *     summary: Artist-specific search
 *     description: Searches for results specific to the artist field.
 *     tags: [Library]
 *     requestBody:
 *       description: Artist search parameters
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               artist:
 *                 type: string
 *                 description: Name of the artist to search for
 *     responses:
 *       200:
 *         description: Artist search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   album:
 *                     type: string
 *                   song:
 *                     type: string
 */
router.post("/artist-search", libraryController.artistSearch);

/**
 * @swagger
 * /api/library/album-search:
 *   post:
 *     summary: Album-specific search
 *     description: Searches for results specific to the album field.
 *     tags: [Library]
 *     requestBody:
 *       description: Album search parameters
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               album:
 *                 type: string
 *                 description: Name of the album to search for
 *     responses:
 *       200:
 *         description: Album search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   artist:
 *                     type: string
 *                   song:
 *                     type: string
 */
router.post("/album-search", libraryController.albumSearch);

/**
 * @swagger
 * /api/library/song-search:
 *   post:
 *     summary: Song-specific search
 *     description: Searches for results specific to the song field.
 *     tags: [Library]
 *     requestBody:
 *       description: Song search parameters
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               song:
 *                 type: string
 *                 description: Name of the song to search for
 *     responses:
 *       200:
 *         description: Song search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   artist:
 *                     type: string
 *                   album:
 *                     type: string
 */
router.post("/song-search", libraryController.songSearch);

module.exports = router;

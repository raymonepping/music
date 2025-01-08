const express = require("express");
const router = express.Router();
const albumController = require("../controllers/albumController");

/**
 * @swagger
 * tags:
 *   name: Albums
 *   description: Album management
 */

/**
 * @swagger
 * /api/albums:
 *   get:
 *     summary: Fetch album data with pagination
 *     description: Retrieves paginated album data.
 *     tags: [Albums]
 *     responses:
 *       200:
 *         description: Successfully fetched album data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   albumName:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   year:
 *                     type: integer
 */
router.get("/", albumController.fetchAlbumData);

/**
 * @swagger
 * /api/albums/{id}:
 *   put:
 *     summary: Update album data by document key (id)
 *     description: Updates album data based on the document key.
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the album to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Album data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               albumName:
 *                 type: string
 *               artist:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Album data updated successfully
 */
router.put("/:id", albumController.updateAlbumById);

module.exports = router;

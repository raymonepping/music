const express = require("express");
const router = express.Router();
const {
  similaritySearch,
  getMusicVectors,
} = require("../controllers/vectorController");

/**
 * @swagger
 * tags:
 *   name: Vectors
 *   description: Vector operations including similarity searches and vector retrieval
 */

/**
 * @swagger
 * /api/vectors:
 *   get:
 *     summary: Perform a similarity search
 *     description: Conducts a similarity search based on input vector data.
 *     tags: [Vectors]
 *     parameters:
 *       - in: query
 *         name: queryVector
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: number
 *         description: Array representing the query vector for similarity comparison
 *     responses:
 *       200:
 *         description: Similarity search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   similarityScore:
 *                     type: number
 */
router.get("/", similaritySearch);

/**
 * @swagger
 * /api/vectors/music-vectors:
 *   get:
 *     summary: Fetch music vectors
 *     description: Retrieves all stored music vectors.
 *     tags: [Vectors]
 *     responses:
 *       200:
 *         description: Music vectors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   vector:
 *                     type: array
 *                     items:
 *                       type: number
 */
router.get("/music-vectors", getMusicVectors);

module.exports = router;

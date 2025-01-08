const couchbase = require("couchbase");

const logger = require("../configurations/logger");
const config = require("../configurations/config");

// Cosine similarity function
function cosineSimilarity(vector1, vector2) {
  const dotProduct = vector1.reduce(
    (acc, val, idx) => acc + val * vector2[idx],
    0,
  );
  const magnitude1 = Math.sqrt(
    vector1.reduce((acc, val) => acc + val * val, 0),
  );
  const magnitude2 = Math.sqrt(
    vector2.reduce((acc, val) => acc + val * val, 0),
  );
  return dotProduct / (magnitude1 * magnitude2);
}

// Function to get song vector by song ID from Couchbase
async function getSongVector(cluster, songId) {
  const query = `
      SELECT music.music_vector
      FROM \`${config.couchbaseBucket}\`.\`${config.couchbaseScopeDirectus}\`.\`${config.couchbaseCollectionDirectus}\` AS music
      WHERE META(music).id = $songId
      LIMIT 1`;

  const options = { parameters: { songId } };
  const result = await cluster.query(query, options);

  if (result.rows.length === 0) {
    logger.warn(`Song vector not found for song ID: ${songId}.`, {
      songId,
      ...context,
    });
    throw new Error(`Song vector not found for song ID: ${songId}`);
  }

  return result.rows[0].music_vector;
}

// Main prediction function
async function predictSong(cluster, song1Id, song2Id, userVector) {
  // console.debug("Predicting song for IDs:", { song1Id, song2Id });

  // Fetch the song vectors
  const song1Vector = await getSongVector(cluster, song1Id);
  const song2Vector = await getSongVector(cluster, song2Id);

  // console.debug("Retrieved song vectors:", { song1Vector, song2Vector });

  // Calculate cosine similarities
  const similarity1 = cosineSimilarity(song1Vector, userVector);
  const similarity2 = cosineSimilarity(song2Vector, userVector);

  // console.debug("Similarity with Song 1:", similarity1, "Similarity with Song 2:", similarity2);

  // Return the song with the highest similarity
  return similarity1 > similarity2 ? song1Id : song2Id;
}

module.exports = { predictSong };

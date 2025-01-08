/**
 * moodUtils.js
 * Utility functions to handle mood-related operations in the game.
 */

// Mapping of each mood to a vector representation. Adjust values as needed.
const moodMap = {
  Happy: [0.6, 0.7, 0.4],
  Energetic: [0.8, 0.2, -0.3],
  Melancholy: [-0.4, -0.7, 0.5],
  Anxious: [0.5, -0.7, 0.3],
  Dark: [0.6, -0.8, 0.2],
  Calm: [0.1, 0.6, -0.4],
  Uplifting: [0.8, 0.6, 0.5],
  Optimistic: [0.7, 0.8, 0.6],
  Reflective: [-0.3, -0.6, 0.4],
  Nervous: [0.4, -0.6, 0.1],
  Playful: [0.7, 0.5, -0.3],
  Excited: [0.9, 0.4, -0.2],
  Curious: [0.8, 0.5, -0.1],
  Tender: [0.5, 0.7, 0.4],
  Romantic: [0.5, 0.7, 0.2],
  Intense: [0.7, 0.3, -0.2],
  Somber: [-0.2, -0.8, 0.5],
  Bittersweet: [-0.3, -0.5, 0.6],
  Warm: [0.6, 0.6, 0.3],
  Discontent: [-0.5, -0.6, 0.3],
  Cynical: [-0.6, -0.5, 0.2],
  Affectionate: [0.4, 0.8, 0.3],
  Comforting: [0.3, 0.5, 0.6],
  Steady: [0.3, 0.6, 0.5],
  Yearning: [0.4, 0.7, 0.4],
  Fiery: [0.9, 0.4, -0.1],
  Reassuring: [0.4, 0.5, 0.7],
  Unpleasant: [-0.7, -0.4, 0.1],
};

/**
 * Calculates a single vector representation for an array of mood strings.
 * Each mood string is mapped to a vector, and the average vector is returned.
 * @param {Array} moodArray - Array of mood strings (e.g., ["Happy", "Energetic"])
 * @returns {Array} - Averaged vector representation of the moods.
 */
function calculateMoodVector(moodArray) {
  if (!Array.isArray(moodArray) || moodArray.length === 0) {
    // Default to neutral vector if no moods are provided
    return [0, 0, 0];
  }

  // Aggregate mood vectors and calculate the average
  const aggregatedVector = moodArray.reduce(
    (acc, mood) => {
      const moodVector = moodMap[mood] || [0, 0, 0]; // Default to [0, 0, 0] if mood not found
      return acc.map((val, index) => val + moodVector[index]);
    },
    [0, 0, 0],
  );

  return aggregatedVector.map((val) => val / moodArray.length); // Average vector
}

/**
 * Recalculates the final mood vector with weighted averaging for the last round.
 * @param {Array} moodHistoryArray - Array of mood entries with weights.
 * @returns {Array} - Weighted average vector representation of all rounds.
 */
function calculateFinalMoodVector(moodHistoryArray) {
  if (!Array.isArray(moodHistoryArray) || moodHistoryArray.length === 0) {
    return [0, 0, 0];
  }

  let weightedVector = [0, 0, 0];
  let totalWeight = 0;

  moodHistoryArray.forEach((entry, idx) => {
    const weight = idx + 1;
    totalWeight += weight;
    const moodVector = calculateMoodVector(entry.mood);

    weightedVector = weightedVector.map(
      (val, index) => val + moodVector[index] * weight,
    );
  });

  return weightedVector.map((val) => val / totalWeight);
}

module.exports = {
  calculateMoodVector,
  calculateFinalMoodVector,
};

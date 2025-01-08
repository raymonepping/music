// utilities/UserProfile.js
const logger = require("../configurations/logger");

const updateUserProfile = (userProfile, selectedSong) => {
  logger.debug("Updating user profile with selected song:", { selectedSong });

  // Initialize the userProfile if it's not already initialized
  userProfile.preferredGenres = userProfile.preferredGenres || {};
  userProfile.preferredArtists = userProfile.preferredArtists || {};
  userProfile.preferredYears = userProfile.preferredYears || {};
  userProfile.cumulativeVector = userProfile.cumulativeVector || [];

  // Update genre preferences
  if (selectedSong.genres && Array.isArray(selectedSong.genres)) {
    selectedSong.genres.forEach((genre) => {
      userProfile.preferredGenres[genre] =
        (userProfile.preferredGenres[genre] || 0) + 1;
    });
  }

  // Update artist preferences
  if (selectedSong.artist) {
    const artist = selectedSong.artist;
    userProfile.preferredArtists[artist] =
      (userProfile.preferredArtists[artist] || 0) + 1;
  }

  // Update year preferences
  if (selectedSong.year) {
    const year = selectedSong.year.toString();
    userProfile.preferredYears[year] =
      (userProfile.preferredYears[year] || 0) + 1;
  }

  // Update cumulative vector
  if (
    Array.isArray(selectedSong.music_vector) &&
    selectedSong.music_vector.length > 0
  ) {
    logger.debug("Selected song music vector:", {
      music_vector: selectedSong.music_vector,
    });

    // If the cumulative vector is empty, initialize it with the selected song's vector
    if (userProfile.cumulativeVector.length === 0) {
      userProfile.cumulativeVector = [...selectedSong.music_vector]; // Initialize
      logger.debug("Initialized cumulative vector:", {
        cumulativeVector: userProfile.cumulativeVector,
      });
    } else {
      // Otherwise, add the selected song's vector to the cumulative vector
      userProfile.cumulativeVector = userProfile.cumulativeVector.map(
        (value, index) => value + (selectedSong.music_vector[index] || 0),
      );
      logger.debug("Updated cumulative vector:", {
        cumulativeVector: userProfile.cumulativeVector,
      });
    }
  } else {
    logger.warn(
      `Selected song ${selectedSong.id} does not have a valid music_vector.`,
    );
  }

  // Increment total selections
  userProfile.totalSelections = (userProfile.totalSelections || 0) + 1;

  logger.debug("Updated userProfile:", { userProfile });

  return userProfile;
};

module.exports = {
  updateUserProfile,
};

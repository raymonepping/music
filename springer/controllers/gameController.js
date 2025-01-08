// controller.js

const { connectToCouchbase } = require("../configurations/couchbaseConnection");
const couchbase = require("couchbase"); 

const logger = require("../configurations/logger"); // Use the Winston logger
const config = require("../configurations/config"); // Import configuration module

const { format } = require("date-fns"); // For date formatting

const { updateUserProfile } = require("../utilities/UserProfile");
const GamePredictor = require("../utilities/GamePredictor");

const {
  calculateMoodVector,
  calculateFinalMoodVector,
} = require("../utilities/moodUtils"); // Import mood utilities

// Store reusable Couchbase collections
let bucket, scopeDirectus, collectionGame, collectionDirectus;

// Initialize Couchbase connection and collections
(async () => {
  try {
    const { cluster } = await connectToCouchbase();
    bucket = cluster.bucket(config.couchbaseBucket);
    scopeDirectus = bucket.scope(config.couchbaseScopeDirectus);
    collectionGame = scopeDirectus.collection("game");
    collectionDirectus = scopeDirectus.collection(
      config.couchbaseCollectionDirectus,
    );
    logger.info("Couchbase collections initialized successfully.");
  } catch (error) {
    logger.error("Error initializing Couchbase collections", { error });
  }
})();

/**
 * Starts a new game or resets an existing one.
 * @param {Object} req - Express request object containing the username in the body.
 * @param {Object} res - Express response object.
 */
exports.startGame = async (req, res) => {
  const { username } = req.body;

  try {
    // Ensure collections are initialized
    if (!collectionGame) {
      logger.error("Couchbase collection not initialized.");
      return res
        .status(500)
        .json({ error: "Couchbase collection not initialized" });
    }

    // Fetch the existing game document by username to preserve the lastFavorite and historicalFavorite
    let existingGame;
    try {
      existingGame = await collectionGame.get(username);
    } catch (error) {
      existingGame = null; // No previous game, this is a new user
    }

    const lastFavorite = existingGame
      ? existingGame.content.lastFavorite
      : null;
    const historicalFavorite = existingGame
      ? existingGame.content.historicalFavorite || []
      : [];

    const mood_vector = existingGame
      ? existingGame.content.mood_vector || [0, 0, 0]
      : [0, 0, 0];
    const mood_history = existingGame
      ? existingGame.content.mood_history || []
      : [];
    const moodHistoryArray = existingGame
      ? existingGame.content.moodHistoryArray || []
      : [];

    const gameData = {
      username,
      type: "game",
      songsPlayed: [],
      songsPresented: [], // Initialize presented songs array
      progress: 0,
      lastFavorite, // Preserve the lastFavorite from the previous game
      historicalFavorite, // Preserve the historicalFavorite list
      mood_history, // Preserve mood_history
      mood_vector, // Preserve mood_vector
      moodHistoryArray, // Preserve moodHistoryArray
    };

    logger.debug(
      `Game data reset for user ${username}, preserving mood_history.`,
    );

    // Insert or update the game document, using username as the document key
    await collectionGame.upsert(username, gameData);

    logger.info(`New game started with username: ${username}`); // Log with Winston
    res.json({ gameId: username }); // Use username as the game ID for consistency
  } catch (error) {
    logger.error("Error starting game:", error); // Log error
    res.status(500).json({ error: "Error starting game" });
  }
};

/**
 * Fetches two random songs that have not been presented yet, applying a dynamic weighting system.
 * @param {Object} req - Express request object containing the gameId in the params.
 * @param {Object} res - Express response object.
 */
exports.fetchRandomSongs = async (req, res) => {
  const { gameId } = req.params;

  try {
    // Ensure collections are initialized
    if (!collectionGame || !collectionDirectus) {
      logger.error("Couchbase collections not initialized.");
      return res
        .status(500)
        .json({ error: "Couchbase collections not initialized" });
    }

    // Fetch the game data using the gameId (which is based on the username)
    const gameResult = await collectionGame.get(gameId);
    const gameData = gameResult.content;
    const presentedSongs = gameData.songsPresented || [];
    const progress = gameData.progress;

    logger.debug(
      `Fetching random songs for user: ${gameId}, Progress: ${progress}`,
    );
    logger.debug(`Songs presented so far: ${JSON.stringify(presentedSongs)}`);

    // Compute gamma value for dynamic weighting
    const totalProgress = config.totalGameRounds;
    const maxGamma = 0.7;
    const gamma = Math.min(progress / totalProgress, maxGamma);

    // Prepare the query with a dynamic weighting function
    const query = `
      SELECT META(music).id, music.artist, music.album, music.song, music.albumart, music.pickCount, music.music_vector
      FROM \`${config.couchbaseBucket}\`.\`${config.couchbaseScopeDirectus}\`.\`${
        config.couchbaseCollectionDirectus
      }\` AS music
      WHERE META(music).id NOT IN $presentedSongs
      AND music.\`language\` = "English"
      ORDER BY RANDOM() * EXP(-$gamma * IFNULL(music.pickCount, 0)) DESC
      LIMIT 2`;

    const options = {
      parameters: {
        presentedSongs: presentedSongs,
        gamma: gamma,
      },
    };

    logger.debug(
      `Running query for random songs with gamma ${gamma}: ${query}`,
    );
    const result = await bucket.cluster.query(query, options);

    // Ensure at least 2 songs are returned
    if (result.rows.length < 2) {
      logger.info(`All songs have been presented to user: ${gameId}`);
      return res.json({
        message:
          "You've seen all the songs! Would you like to restart the game?",
        completed: true,
      });
    }

    const fetchedSongIds = result.rows.map((row) => row.id);

    // Update the game data with the newly presented song IDs
    const updatedGameData = {
      ...gameData,
      songsPresented: [...presentedSongs, ...fetchedSongIds],
    };

    // Use CAS to ensure atomic update
    try {
      await collectionGame.replace(gameId, updatedGameData, {
        cas: gameResult.cas,
      });
      logger.debug(
        `Updated songsPresented for user: ${gameId}, songsPresented: ${JSON.stringify(
          updatedGameData.songsPresented,
        )}`,
      );
    } catch (err) {
      if (err instanceof couchbase.errors.CasMismatchError) {
        logger.error(
          `CAS mismatch when updating game data for user: ${gameId}`,
        );
        return res
          .status(409)
          .json({ error: "Conflict in updating game data, please retry" });
      } else {
        throw err;
      }
    }

    res.json({ songs: result.rows });
  } catch (error) {
    logger.error("Error fetching random songs:", error);
    res.status(500).json({ error: "Error fetching random songs" });
  }
};

/**
 * Updates game progress when a song is selected, manages favorites, mood tracking, and prediction.
 * @param {Object} req - Express request object containing the gameId and selectedSongId in the body.
 * @param {Object} res - Express response object.
 */
exports.updateGameProgress = async (req, res) => {
  const { gameId, selectedSongId } = req.body;

  try {
    // Ensure collections are initialized
    if (!collectionGame || !collectionDirectus) {
      logger.error("Couchbase collections not initialized.");
      return res
        .status(500)
        .json({ error: "Couchbase collections not initialized" });
    }

    // Fetch game data
    const gameResult = await collectionGame.get(gameId);
    const gameData = gameResult.content;

    const updatedSongsPlayed = [...gameData.songsPlayed, selectedSongId];
    const presentedSongs = gameData.songsPresented || [];
    const newProgress = gameData.progress + 1;

    // Fetch selected song data and mood
    const selectedSong = await collectionDirectus.get(selectedSongId);
    const selectedSongContent = selectedSong.content;
    const selectedSongMood = selectedSongContent.song_mood;
    const previousMoodVector = gameData.mood_vector || [0, 0, 0];

    // Track history of moods played
    const moodHistoryArray = gameData.moodHistoryArray || [];
    if (selectedSongMood && selectedSongMood.length > 0) {
      moodHistoryArray.push({ round: newProgress, mood: selectedSongMood });
    }

    // Calculate incremental mood vector for each round
    const newMoodVector = calculateMoodVector(selectedSongMood);
    let updatedMoodVector = previousMoodVector.map(
      (value, index) =>
        (value * (newProgress - 1) + newMoodVector[index]) / newProgress,
    );

    const isFinalRound = updatedSongsPlayed.length >= config.totalGameRounds;
    if (isFinalRound) {
      updatedMoodVector = calculateFinalMoodVector(moodHistoryArray);
    }

    // Define favoriteSong
    const favoriteSong = {
      song: selectedSongContent.song,
      artist: selectedSongContent.artist,
      album: selectedSongContent.album,
      albumart: selectedSongContent.albumart,
      id: selectedSongId,
    };

    // Update pick count
    const updatedPickCount = (selectedSongContent.pickCount || 0) + 1;
    await collectionDirectus.upsert(selectedSongId, {
      ...selectedSongContent,
      pickCount: updatedPickCount,
    });

    logger.debug(
      `Updated pickCount for song ${selectedSongId}: ${updatedPickCount}`,
    );

    // Update the user's profile with the selected song
    const updatedUserProfile = updateUserProfile(
      gameData.userProfile || {},
      selectedSongContent,
    );

    logger.debug(`Updated user profile for user ${gameId}`);

    // Game completion logic
    if (isFinalRound) {
      logger.debug(`Game completed for user ${gameId}`);

      // Prepare historical favorites
      let historicalFavorites = gameData.historicalFavorite || [];
      if (gameData.lastFavorite) {
        historicalFavorites.push({
          ...gameData.lastFavorite,
          date_added: new Date().toISOString(),
        });
      }

      // Get the current timestamp including hour and minute
      const currentDateTime = format(new Date(), "yyyy-MM-dd HH:mm");

      // Retrieve the existing mood_history and ensure it's initialized
      const existingMoodHistory = gameData.mood_history || {};

      // Log the existing mood_history for debugging
      logger.debug(
        `Existing mood_history before update: ${JSON.stringify(existingMoodHistory)}`,
      );

      // Clone the existing mood_history to avoid mutating the original object
      const updatedMoodHistory = { ...existingMoodHistory };

      updatedMoodHistory[currentDateTime] = updatedMoodVector;

      // Log the updated mood_history for debugging
      logger.debug(
        `Updated mood_history after adding new entry: ${JSON.stringify(updatedMoodHistory)}`,
      );

      // Construct updated game data
      const updatedGameData = {
        ...gameData,
        songsPlayed: updatedSongsPlayed,
        progress: newProgress,
        lastFavorite: favoriteSong,
        userProfile: updatedUserProfile,
        mood_vector: updatedMoodVector,
        moodHistoryArray,
        mood_history: updatedMoodHistory,
        historicalFavorite: historicalFavorites,
      };

      // Update Couchbase with final game data
      try {
        await collectionGame.replace(gameId, updatedGameData, {
          cas: gameResult.cas,
        });
      } catch (err) {
        if (err instanceof couchbase.errors.CasMismatchError) {
          logger.error(
            `CAS mismatch while updating game data for user ${gameId}`,
          );
          return res
            .status(409)
            .json({ error: "Conflict in updating game data, please retry" });
        } else {
          throw err;
        }
      }

      // Fetch top 5 most picked songs
      const top5Query = `
        SELECT META(music).id, music.song, music.artist, music.album, music.pickCount
        FROM \`${config.couchbaseBucket}\`.\`${config.couchbaseScopeDirectus}\`.\`${
          config.couchbaseCollectionDirectus
        }\` AS music
        WHERE music.\`language\` = "English" AND music.pickCount IS NOT MISSING
        ORDER BY music.pickCount DESC
        LIMIT 5`;

      const topSongsResult = await bucket.cluster.query(top5Query);

      const secondLastFavorite =
        historicalFavorites.length >= 2
          ? historicalFavorites[historicalFavorites.length - 2]
          : null;

      const leaderboardResponse = {
        completed: true,
        favoriteSong,
        topSongs: topSongsResult.rows,
        secondLastFavorite,
      };

      logger.debug(
        `Sending leaderboard response for user ${gameId}: ${JSON.stringify(leaderboardResponse)}`,
      );
      return res.json(leaderboardResponse);
    } else {
      // Continue game logic if not final round
      const query = `
        SELECT META(music).id, music.artist, music.album, music.song, music.albumart, music.music_vector
        FROM \`${config.couchbaseBucket}\`.\`${config.couchbaseScopeDirectus}\`.\`${
          config.couchbaseCollectionDirectus
        }\` AS music
        WHERE META(music).id NOT IN $presentedSongs
        AND music.\`language\` = "English"
        ORDER BY RANDOM()
        LIMIT 1`;
      const options = { parameters: { presentedSongs } };

      logger.debug(
        `Running query to fetch new song for game: ${gameId}, Query: ${query}`,
      );
      const result = await bucket.cluster.query(query, options);
      const newSong = result.rows[0];

      if (!newSong) {
        logger.info(`All songs have been presented to user ${gameId}`);
        return res.json({
          message:
            "You've seen all the songs! Would you like to restart the game?",
          completed: true,
        });
      }

      // Prediction Logic Starts Here

      // Grab the last picked song
      const lastPickedSong = updatedSongsPlayed[updatedSongsPlayed.length - 1];

      let strippedPredictedSong = null;
      try {
        const predictedSongId = await GamePredictor.predictSong(
          bucket.cluster,
          newSong.id,
          lastPickedSong,
          updatedUserProfile.cumulativeVector,
        );
        logger.debug(`Prediction result: Predicted song is ${predictedSongId}`);

        // Fetch the predicted song details from Couchbase
        const predictedSongResult =
          await collectionDirectus.get(predictedSongId);

        // Extract only the required details for the predicted song
        strippedPredictedSong = {
          artist: predictedSongResult.content.artist,
          album: predictedSongResult.content.album,
          albumart: predictedSongResult.content.albumart,
          song: predictedSongResult.content.song,
        };
      } catch (error) {
        logger.error(`Error during prediction: ${error}`);
      }

      // Prediction Logic Ends Here

      // Update non-final game progress
      const updatedGameData = {
        ...gameData,
        songsPlayed: updatedSongsPlayed,
        songsPresented: [...presentedSongs, newSong.id],
        progress: newProgress,
        lastFavorite: favoriteSong,
        userProfile: updatedUserProfile,
      };

      try {
        await collectionGame.replace(gameId, updatedGameData, {
          cas: gameResult.cas,
        });
      } catch (err) {
        if (err instanceof couchbase.errors.CasMismatchError) {
          logger.error(
            `CAS mismatch while updating game data for user ${gameId}`,
          );
          return res
            .status(409)
            .json({ error: "Conflict in updating game data, please retry" });
        } else {
          throw err;
        }
      }

      // Prepare response including the predicted song
      const responseJson = {
        newSong,
        completed: false,
        predictedSong: strippedPredictedSong,
      };

      // Log the final JSON response before sending it to the frontend
      logger.debug(
        `Final JSON response to be sent: ${JSON.stringify(responseJson)}`,
      );

      // Send the response to the frontend
      res.json(responseJson);
    }
  } catch (error) {
    logger.error(`Error updating game progress for user ${gameId}: ${error}`);
    res.status(500).json({ error: "Error updating game progress" });
  }
};

/**
 * Fetches the top 5 most picked songs.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getTop5Songs = async (req, res) => {
  try {
    // Ensure collections are initialized
    if (!bucket || !scopeDirectus || !collectionDirectus) {
      logger.error("Couchbase collections not initialized.");
      return res
        .status(500)
        .json({ error: "Couchbase collections not initialized" });
    }

    // Set cache control headers to prevent caching
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );

    // Query to fetch top 5 most picked songs
    const query = `
      SELECT META(music).id, music.song, music.artist, music.album, music.pickCount
      FROM \`${config.couchbaseBucket}\`.\`${config.couchbaseScopeDirectus}\`.\`${
        config.couchbaseCollectionDirectus
      }\` AS music
      WHERE music.\`language\` = "English" AND music.pickCount IS NOT MISSING
      ORDER BY music.pickCount DESC
      LIMIT 5`;

    logger.debug(`Running query for top 5 songs: ${query}`); // Log the query
    const result = await bucket.cluster.query(query);
    res.json({ topSongs: result.rows });

    logger.debug(`Fetched top 5 songs: ${JSON.stringify(result.rows)}`); // Log the fetched top 5 songs
  } catch (error) {
    logger.error("Error fetching top 5 songs:", error); // Log error
    res.status(500).json({ error: "Error fetching top 5 songs" });
  }
};

/**
 * Retrieves the historical favorite list of songs for a game.
 * @param {Object} req - Express request object containing the gameId in the params.
 * @param {Object} res - Express response object.
 */
exports.getHistoricalFavorites = async (req, res) => {
  const { gameId } = req.params;

  try {
    // Ensure collections are initialized
    if (!collectionGame) {
      logger.error("Couchbase collections not initialized.");
      return res
        .status(500)
        .json({ error: "Couchbase collections not initialized" });
    }

    // Fetch game data to retrieve historical favorites
    const gameData = await collectionGame.get(gameId);
    const historicalFavorites = gameData.content.historicalFavorite || [];

    logger.debug(
      `Fetched historical favorites for game: ${gameId}, Result: ${JSON.stringify(
        historicalFavorites,
      )}`,
    );
    res.json({ historicalFavorites });
  } catch (error) {
    logger.error(
      `Error fetching historical favorites for game: ${gameId}`,
      error,
    ); // Log error
    res.status(500).json({ error: "Error fetching historical favorites" });
  }
};

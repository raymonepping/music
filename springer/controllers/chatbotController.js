// chatBotController.js

const config = require("../configurations/config"); // Import configuration module
const { connectToCouchbase } = require("../configurations/couchbaseConnection");
const couchbase = require("couchbase");
const { SearchRequest, VectorSearch, VectorQuery } = couchbase;

const logger = require("../configurations/logger");

const personalityTraits = require("../utilities/personalityTraits");

const {
  getGenresFromCouchbase,
} = require("../utilities/getGenresFromCouchbase");

const {
  detectIntent,
  analyzeSentiment,
  extractContext,
} = require("../utilities/messageProcessing");

const apologyResponses = require("../intelligence/apologyResponses");
const artistRecommendationResponses = require("../intelligence/artistRecommendationResponses");
const emotionResponses = require("../intelligence/emotionResponses");
const exampleQuestions = require("../intelligence/questionsHandling");
const genreRecommendationResponses = require("../intelligence/genreRecommendationResponses");
const greetingResponses = require("../intelligence/greetingResponses");
const howAreYouResponses = require("../intelligence/howAreYouResponses");
const thankYouResponses = require("../intelligence/thankYouResponses");
const {
  lyricallySimilarResponses,
  musicallySimilarResponses,
  moodBasedResponses,
} = require("../intelligence/recommendationResponses");

const { getSession, updateSession } = require("../intelligence/session");

const nlp = require("compromise");
const natural = require("natural");
const WordNet = new natural.WordNet();

const Sentiment = require("sentiment");
const sentiment = new Sentiment();

const jwt = require("jsonwebtoken");

let bucket, collectionGame, collectionDirectus, collectionVectors;

// Initialize Couchbase connection and collections
(async () => {
  try {
    const { cluster } = await connectToCouchbase();
    bucket = cluster.bucket(config.couchbaseBucket);
    const scopeDirectus = bucket.scope(config.couchbaseScopeDirectus);
    collectionGame = scopeDirectus.collection("game");
    collectionDirectus = scopeDirectus.collection(
      config.couchbaseCollectionDirectus,
    );
    collectionVectors = scopeDirectus.collection("vectors"); // Assuming vectors are stored here
    logger.info("Couchbase collections initialized successfully.");
  } catch (error) {
    logger.error("Error initializing Couchbase collections", { error });
  }
})();

async function findProfileMatches(username) {
  try {
    const { cluster } = await connectToCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET || "demo");
    const scopeDirectus = bucket.scope(process.env.COUCHBASE_SCOPE_DIRECTUS || "directus");
    const collectionGame = scopeDirectus.collection("game");

    // Step 1: Retrieve the cumulative vector from the user's profile
    const userDoc = await collectionGame.get(username);
    const userProfile = userDoc.content.userProfile;

    if (!userProfile || !userProfile.cumulativeVector) {
      return "Your profile does not have a cumulative vector for matching.";
    }

    const cumulativeVector = userProfile.cumulativeVector;

    // Step 2: Perform a vector search
    const query = {
      query: { match_none: {} },
      fields: ["username", "lastFavorite.artist", "lastFavorite.album", "lastFavorite.song"],
      knn: [
        {
          k: 2,
          field: "userProfile.cumulativeVector",
          vector: cumulativeVector,
        },
      ],
    };

    const searchResult = await scopeDirectus.search("fts_game", query);

    if (!searchResult.rows || searchResult.rows.length === 0) {
      return "No matching profiles found.";
    }

    // Format and return the results
    const matches = searchResult.rows.map((row) => ({
      username: row.fields.username,
      artist: row.fields["lastFavorite.artist"],
      album: row.fields["lastFavorite.album"],
      song: row.fields["lastFavorite.song"],
    }));

    return matches.length
      ? `Here are profiles matching your preferences:\n${matches
          .map(
            (match, index) =>
              `${index + 1}. Username: ${match.username}, Favorite: "${match.song}" by ${match.artist} from the album "${match.album}"`
          )
          .join("\n")}`
      : "No matching profiles found.";
  } catch (error) {
    logger.error("Error finding profile matches:", error);
    return "An error occurred while searching for matching profiles.";
  }
}

async function getUserPersonalityDescription(username) {
  try {
    // Fetch user game data
    const gameResult = await collectionGame.get(username);
    const gameData = gameResult.content;

    // Get user's mood vector
    const userMoodVector = gameData.mood_vector;
    if (!userMoodVector || userMoodVector.length === 0) {
      return "Mood vector not available for your profile.";
    } 

    // Fetch the vector document
    const vectorResult = await collectionVectors.get("1"); // Assuming meta_id is "1"
    const vectorDoc = vectorResult.content;
    const moodVectors = vectorDoc.moods;
    const genreVectors = vectorDoc.genres;

    // Find closest moods and genres
    const closestMoods = personalityTraits.detectClosestVectors(
      userMoodVector,
      moodVectors,
    );
    const userGenreVector = gameData.userProfile.cumulativeVector;
    const closestGenres = personalityTraits.detectClosestVectors(
      userGenreVector,
      genreVectors,
    );

    // Generate personality description
    const personalityDescription =
      personalityTraits.generatePersonalityDescription(
        closestMoods,
        closestGenres,
      );

    // Check for previous mood vector
    const moodHistoryKeys = Object.keys(gameData.mood_history);
    let personalityChangeDescription = null;
    if (moodHistoryKeys.length >= 2) {
      // Get the last two mood vectors
      const sortedKeys = moodHistoryKeys.sort();
      const previousVectorKey = sortedKeys[sortedKeys.length - 2];
      const previousMoodVector = gameData.mood_history[previousVectorKey];

      personalityChangeDescription = personalityTraits.detectPersonalityChange(
        previousMoodVector,
        userMoodVector,
      );
    }

    // Combine the descriptions
    let fullDescription = personalityDescription;
    if (personalityChangeDescription) {
      fullDescription += `\n\nPersonality Change: ${personalityChangeDescription}`;
    }

    return fullDescription;
  } catch (error) {
    logger.error("Error generating personality description:", error);
    return "An error occurred while generating your personality description.";
  }
}

// Function to retrieve user's historical favorite songs
async function getFavoriteSongs(username) {
  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET || "demo";
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
    const collectionGame = process.env.COUCHBASE_COLLECTION_GAME || "game";

    // Query for distinct historical favorites
    const query = `
            SELECT DISTINCT h.album, h.albumart, h.artist, h.song
            FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionGame}\` AS g
            UNNEST g.historicalFavorite AS h
            WHERE g.username = $username
            ORDER BY h.date_added DESC;
        `;
    const options = {
      parameters: {
        username: username,
      },
    };
    const result = await cluster.query(query, options);

    // Check if results exist
    if (result.rows.length === 0) {
      return "I couldn't find any favorite songs for you.";
    }

    // Format the results into a list for response
    const favoriteSongs = result.rows.slice(0, 5); // Limit to top 5 favorites for brevity
    let botResponse = `Here are some of your recent favorite songs:\n\n`;
    favoriteSongs.forEach((song, index) => {
      botResponse += `${index + 1}. "${song.song}" by ${song.artist} from the album "${song.album}"\n`;
    });
    return botResponse;
  } catch (error) {
    logger.error("Error fetching favorite songs:", error);
    return "An error occurred while retrieving your favorite songs.";
  }
}

// Function to find lyrically similar songs
async function findLyricallySimilarSongs(songName, artistName) {
  try {
    const { cluster } = await connectToCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const scope = bucket.scope(process.env.COUCHBASE_SCOPE_DIRECTUS);
    const ftsIndexName = "fts_library";

    // Step 1: Retrieve the lyrics_embedding of the specified song
    const query = `
            SELECT meta().id, lyrics_embedding
            FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_MUSIC}\`
            WHERE LOWER(song) = $songName AND LOWER(artist) = $artistName
            LIMIT 1;
        `;
    const options = {
      parameters: {
        songName: songName.toLowerCase(),
        artistName: artistName.toLowerCase(),
      },
    };
    const result = await cluster.query(query, options);

    if (result.rows.length === 0) {
      return `Sorry, I couldn't find the song "${songName}" by ${artistName}.`;
    }

    const { id: documentId, lyrics_embedding } = result.rows[0];

    if (!lyrics_embedding) {
      return `No lyrics embedding found for "${songName}" by ${artistName}.`;
    }

    // Step 2: Perform a vector search using the lyrics_embedding
    const knnResult = await scope.search(
      ftsIndexName,
      couchbase.SearchRequest.create(
        couchbase.VectorSearch.fromVectorQuery(
          couchbase.VectorQuery.create(
            "lyrics_embedding",
            lyrics_embedding,
          ).numCandidates(5),
        ),
      ),
      {
        fields: ["artist", "song", "album", "year", "lyrics_summary"],
      },
    );

    if (!knnResult?.rows?.length) {
      return "Sorry, I couldn't find any lyrically similar songs.";
    }

    // Exclude the original song from the results
    const similarSongs = knnResult.rows.filter((row) => row.id !== documentId);

    if (similarSongs.length === 0) {
      return "Sorry, I couldn't find any lyrically similar songs.";
    }

    // Pick the top result
    const similarSong = similarSongs[0].fields;

    // Pick a random song from the similar songs
    const randomSong =
      similarSongs[Math.floor(Math.random() * similarSongs.length)].fields;

    // Update the session with the similar song
    updateSession("lastSong", similarSong);

    // Pick a random response template
    const responseTemplate =
      lyricallySimilarResponses[
        Math.floor(Math.random() * lyricallySimilarResponses.length)
      ];

    // Replace placeholders with actual values
    const botResponse = responseTemplate
      .replace("{{songName}}", songName)
      .replace("{{artistName}}", artistName)
      .replace("{{recommendedSong}}", randomSong.song)
      .replace("{{recommendedArtist}}", randomSong.artist);

    return botResponse;
  } catch (error) {
    logger.error("Error finding lyrically similar songs:", error);
    return "An error occurred while searching for lyrically similar songs.";
  }
}

// Function to find mood-based similar songs
async function findMoodBasedSimilarSongs(songName, artistName) {
  try {
    const { cluster } = await connectToCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const scope = bucket.scope(process.env.COUCHBASE_SCOPE_DIRECTUS);

    // Step 1: Retrieve the song_mood of the specified song
    const query = `
            SELECT song_mood
            FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_MUSIC}\`
            WHERE LOWER(song) = $songName AND LOWER(artist) = $artistName
            LIMIT 1;
        `;
    const options = {
      parameters: {
        songName: songName.toLowerCase(),
        artistName: artistName.toLowerCase(),
      },
    };
    const result = await cluster.query(query, options);

    if (result.rows.length === 0) {
      return `Sorry, I couldn't find the song "${songName}" by ${artistName}.`;
    }

    const { song_mood } = result.rows[0];

    if (!song_mood || song_mood.length === 0) {
      return `No mood data found for "${songName}" by ${artistName}.`;
    }

    // Step 2: Find other songs with similar moods
    const moodParams = {};
    song_mood.forEach((mood, index) => {
      moodParams[`mood${index}`] = mood;
    });

    const moodQuery = `
            SELECT m.artist, m.song, m.album, m.year, m.lyrics_summary
            FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_MUSIC}\` AS m
            WHERE ANY mood IN m.song_mood SATISFIES mood IN [${Object.keys(
              moodParams,
            )
              .map((key) => `$${key}`)
              .join(", ")}] END
            AND LOWER(m.artist) != $artistName
            ORDER BY RANDOM()
            LIMIT 1;
        `;
    const moodOptions = {
      parameters: {
        ...moodParams,
        artistName: artistName.toLowerCase(),
      },
    };
    const moodResult = await cluster.query(moodQuery, moodOptions);

    if (moodResult.rows.length === 0) {
      return "Sorry, I couldn't find any songs with a similar mood.";
    }

    const similarSong = moodResult.rows[0];

    // Update the session with the similar song
    updateSession("lastSong", similarSong);

    const responseTemplate =
      moodBasedResponses[Math.floor(Math.random() * moodBasedResponses.length)];

    const botResponse = responseTemplate
      .replace("{{songName}}", songName)
      .replace("{{artistName}}", artistName)
      .replace("{{recommendedSong}}", similarSong.song)
      .replace("{{recommendedArtist}}", similarSong.artist);

    return botResponse;
  } catch (error) {
    logger.error("Error finding mood-based similar songs:", error);
    return "An error occurred while searching for mood-based similar songs.";
  }
}

// Function to find musically similar songs
async function findMusicallySimilarSongs(songName, artistName) {
  try {
    const { cluster } = await connectToCouchbase();
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const scope = bucket.scope(process.env.COUCHBASE_SCOPE_DIRECTUS);
    const ftsIndexName = "fts_library";

    // Step 1: Retrieve the music_vector of the specified song
    const query = `
            SELECT meta().id, music_vector
            FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE_DIRECTUS}\`.\`${process.env.COUCHBASE_COLLECTION_MUSIC}\`
            WHERE LOWER(song) = $songName AND LOWER(artist) = $artistName
            LIMIT 1;
        `;
    const options = {
      parameters: {
        songName: songName.toLowerCase(),
        artistName: artistName.toLowerCase(),
      },
    };
    const result = await cluster.query(query, options);

    if (result.rows.length === 0) {
      return `Sorry, I couldn't find the song "${songName}" by ${artistName}.`;
    }

    const { id: documentId, music_vector } = result.rows[0];

    if (!music_vector) {
      return `No music vector data found for "${songName}" by ${artistName}.`;
    }

    // Step 2: Perform a vector search using the music_vector
    const knnResult = await scope.search(
      ftsIndexName,
      couchbase.SearchRequest.create(
        couchbase.VectorSearch.fromVectorQuery(
          couchbase.VectorQuery.create(
            "music_vector",
            music_vector,
          ).numCandidates(5),
        ),
      ),
      {
        fields: ["artist", "song", "album", "year", "lyrics_summary"],
      },
    );

    if (!knnResult?.rows?.length) {
      return "Sorry, I couldn't find any musically similar songs.";
    }

    // Exclude the original song from the results
    const similarSongs = knnResult.rows.filter((row) => row.id !== documentId);

    if (similarSongs.length === 0) {
      return "Sorry, I couldn't find any musically similar songs.";
    }

    // Pick the top result
    const similarSong = similarSongs[0].fields;

    // Pick a random song from the similar songs
    const randomSong =
      similarSongs[Math.floor(Math.random() * similarSongs.length)].fields;

    // Update the session with the similar song
    // updateSession('lastSong', similarSong);
    updateSession("lastSong", randomSong);

    // Pick a random response template and replace placeholders
    const responseTemplate =
      musicallySimilarResponses[
        Math.floor(Math.random() * musicallySimilarResponses.length)
      ];
    const botResponse = responseTemplate
      .replace("{{songName}}", songName)
      .replace("{{artistName}}", artistName)
      .replace("{{recommendedSong}}", randomSong.song)
      .replace("{{recommendedArtist}}", randomSong.artist);

    return botResponse;
  } catch (error) {
    logger.error("Error finding musically similar songs:", error);
    return "An error occurred while searching for musically similar songs.";
  }
}

async function getAlbumArt(albumName) {
  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET || "demo";
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
    const collectionAlbums =
      process.env.COUCHBASE_COLLECTION_ALBUMS || "albums";

    const query = `
            SELECT album, albumart, artist, genres, year
            FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionAlbums}\`
            WHERE type = "album" AND album = "${albumName}";
        `;
    const result = await cluster.query(query);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    logger.error("Error fetching album art:", error);
    return null;
  }
}

// Function to extract genre dynamically from Couchbase
async function extractGenreFromMessage(message) {
  const genres = await getGenresFromCouchbase(); // Fetch genres dynamically from Couchbase

  // Match genre from the message using case-insensitive comparison
  const genreRegex = new RegExp(`\\b(${genres.join("|")})\\b`, "i");
  const genreMatch = message.match(genreRegex);

  if (genreMatch) {
    return genreMatch[1].toLowerCase(); // Return matched genre in lowercase
  }
  return ""; // Return empty string if no match found
}

async function handleAlbumArtRequest(res) {
  const lastSong = getSession().lastSong;
  if (lastSong && lastSong.album) {
    const albumData = await getAlbumArt(lastSong.album);
    if (albumData) {
      const botResponse = `Here is the album art for "${albumData.album}" by ${albumData.artist}: ${albumData.albumart}`;
      res.json({
        success: true,
        message: "Album art found",
        botResponse: botResponse,
        albumart: albumData.albumart,
      });
    } else {
      res.json({
        success: false,
        message: "Sorry, I don't have the album art for that album.",
      });
    }
  } else {
    res.json({
      success: false,
      message:
        "I'm not sure which album you're referring to. Could you specify the album again?",
    });
  }
}

exports.handleChat = async (req, res) => {
  const { userId, message } = req.body;

  const timestamp = new Date().toISOString();

  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists and extract the token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Authorization token missing or improperly formatted");
    return res
      .status(401)
      .json({ error: "No token provided or incorrect format" });
  }

  const token = authHeader.split(" ")[1];

  let username;
  
  let firstName;
  let lastName;

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    username = decoded.username;
    firstName = decoded.first_name;
    lastName = decoded.last_name;

    // Log the username to verify it’s being accessed correctly
    logger.debug(
      `Authenticated user in chatbot: ${username} (${firstName}) (${lastName})`,
    );
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }

  let botResponse = "I am not sure how to respond to that. How can I help?";

  // **New Greeting Check** - Personalized greeting response
  if (/^(hi|hello|hey)\s*volt/i.test(message)) {
    botResponse = `Hi, ${firstName}, how are you doing today?`;
  }

  // Sentiment Analysis
  const sentimentResult = sentiment.analyze(message);
  const mood =
    sentimentResult.score > 0
      ? "happy"
      : sentimentResult.score < 0
        ? "sad"
        : "neutral";
  logger.debug(`Sentiment analysis result: ${JSON.stringify(sentimentResult)}`);

  // WordNet for Synonyms
  WordNet.lookup(mood, function (results) {
    results.forEach((result) => {
      logger.debug(`Synonyms for ${mood}: ${result.synonyms}`);
    });
  });

  // Use Compromise for Artist and Genre Extraction
  const doc = nlp(message);

  // Extract Genre dynamically from Couchbase
  let genre = await extractGenreFromMessage(message);
  logger.debug(`Extracted genre from message: ${genre}`);

  // Extract Artist
  let artist = "";
  const artistMatch = message.match(/by\s+([A-Za-z\s]+)/i);
  if (artistMatch) {
    artist = artistMatch[1]
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ""); // Clean artist name
  }
  logger.debug(`Extracted genre: ${genre}, Extracted artist: ${artist}`);

  // Detect lyrically similar song query
  if (/what lyrics are similar to\s+(.+?)\s+by\s+(.+)/i.test(message)) {
    const match = message.match(
      /what lyrics are similar to\s+(.+?)\s+by\s+(.+)/i,
    );
    const songName = match[1].trim();
    const artistName = match[2].trim();

    botResponse = await findLyricallySimilarSongs(songName, artistName);
    return res.json({ success: true, botResponse });
  }

  else if (/who is matching my profile/i.test(message)) {
    botResponse = await findProfileMatches(username);
    return res.json({ success: true, botResponse });
  }

  // Check if the user asks about their favorite songs
  else if (
    /favorite songs|historical favorites|what are my favorite songs/i.test(
      message,
    )
  ) {
    botResponse = await getFavoriteSongs(username);
    return res.json({ success: true, botResponse });
  } else if (
    /what can you (say|tell) about my personality|describe my personality|what does my music taste say about me/i.test(
      message,
    )
  ) {
    const personalityDescription =
      await getUserPersonalityDescription(username);
    botResponse = personalityDescription;
    return res.json({ success: true, botResponse });
  } else if (
    /what (are|kind of) questions (can you|do you) (answer|handle)|help me understand how to interact with you|how can i use you|what can i ask you/i.test(
      message,
    )
  ) {
    botResponse = "Here are some example questions you can ask me:\n\n";
    // botResponse += exampleQuestions.map((q, index) => `${index + 1}. ${q}`).join('<br><br>');
    // botResponse += exampleQuestions.map((q, index) => `${index + 1}. ${q}`).join('\n');
    botResponse += exampleQuestions
      .map((q, index) => `${index + 1}. ${q}`)
      .join("\n\n");
    // botResponse += exampleQuestions.map((q) => `- ${q}`).join('\n');
    res.json({ success: true, botResponse });
    return;
  }

  // Detect mood-based similar song query
  else if (/what song feels like\s+(.+?)\s+by\s+(.+)/i.test(message)) {
    const match = message.match(/what song feels like\s+(.+?)\s+by\s+(.+)/i);
    const songName = match[1].trim();
    const artistName = match[2].trim();

    botResponse = await findMoodBasedSimilarSongs(songName, artistName);
    return res.json({ success: true, botResponse });
  }

  // Detect musically similar song query
  else if (/which song is similar to\s+(.+?)\s+by\s+(.+)/i.test(message)) {
    const match = message.match(
      /which song is similar to\s+(.+?)\s+by\s+(.+)/i,
    );
    const songName = match[1].trim();
    const artistName = match[2].trim();

    botResponse = await findMusicallySimilarSongs(songName, artistName);
    return res.json({ success: true, botResponse });
  }

  // Check for Lyrics Summary Request
  else if (
    /summary of the lyrics|lyrics summary|do you have a summary of the lyrics/i.test(
      message,
    )
  ) {
    const session = getSession();

    // Log session content for better debugging
    logger.debug(`Session content: ${JSON.stringify(session)}`);

    if (session.lastSong && session.lastSong.lyrics_summary) {
      // Send the lyrics summary along with the bot response
      botResponse = `Here is a summary of the lyrics for "${session.lastSong.song}" by ${session.lastSong.artist}:\n\n${session.lastSong.lyrics_summary}`;
      res.json({
        success: true,
        message: "Lyrics summary found",
        botResponse: botResponse,
        lyrics_summary: session.lastSong.lyrics_summary,
      });
      logger.debug(
        `Lyrics summary found for the song: ${session.lastSong.song}`,
      );
      return; // Ensure the response is only sent once
    } else {
      botResponse = "Sorry, I don't have the lyrics summary for that song.";
      res.json({
        success: true,
        message: botResponse,
        botResponse: botResponse,
      });
      logger.debug(`No lyrics summary found in session for the last song.`);
      return; // Ensure the response is only sent once
    }
  }

  // Handle greetings and name introduction combined (Good morning, my name is ...)
  if (
    /good morning|good afternoon|good evening|hello|hi/i.test(message) &&
    /my name is/i.test(message)
  ) {
    const nameMatch = message.match(/my name is\s+([A-Za-z]+)/i);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      updateSession("userName", name);
      botResponse = `Welcome, ${name}! How can I assist you today?`;
    } else {
      botResponse =
        greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }
  }

  // Check for "how are you" type question
  else if (/how are you|how's it going/i.test(message)) {
    botResponse =
      howAreYouResponses[Math.floor(Math.random() * howAreYouResponses.length)];
  }

  // Check for thank you messages
  else if (/thank you|thanks/i.test(message)) {
    botResponse =
      thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
  }

  // Check for a question about the song's year
  else if (/from which year is that song|what year/i.test(message)) {
    const session = getSession();

    if (session.lastSong && session.lastSong.year) {
      botResponse = `The song "${session.lastSong.song}" by ${session.lastSong.artist} was released in ${session.lastSong.year}.`;
    } else {
      botResponse =
        "I'm not sure which song you're referring to. Could you specify the song again?";
    }
  }

  // Check for a question about the song's album
  else if (
    /from which album is that song|from what album is that song|which album is this song from/i.test(
      message,
    )
  ) {
    const session = getSession();

    if (session.lastSong && session.lastSong.album) {
      botResponse = `The song "${session.lastSong.song}" by ${session.lastSong.artist} is from the album "${session.lastSong.album}".`;
    } else {
      botResponse =
        "I'm not sure which song you're referring to. Could you specify the song again?";
    }
  }

  // Check for Album Art Request
  else if (/album art/i.test(message)) {
    const session = getSession();

    // If the user asks about album art for a song
    if (
      /for that song|song album art/i.test(message) &&
      session.lastSong &&
      session.lastSong.albumart
    ) {
      botResponse = `Here is the album art for "${session.lastSong.song}" by ${session.lastSong.artist}: ${session.lastSong.albumart}`;
      res.json({
        success: true,
        message: "Song album art found",
        botResponse: botResponse,
        albumart: session.lastSong.albumart,
      });
      return; // Add this return statement
    }

    // If the user asks about general album art
    else if (session.lastSong && session.lastSong.album) {
      const albumData = await getAlbumArt(session.lastSong.album);
      if (albumData) {
        botResponse = `Here is the album art for "${albumData.album}" by ${albumData.artist}: ${albumData.albumart}`;
        res.json({
          success: true,
          message: "Album art found",
          botResponse: botResponse,
          albumart: albumData.albumart,
        });
        return; // Add this return statement
      } else {
        botResponse = "Sorry, I don't have the album art for that album.";
        res.json({
          success: false,
          message: botResponse,
          botResponse: botResponse,
        });
        return; // Add this return statement
      }
    } else {
      botResponse =
        "I'm not sure which album or song you're referring to. Could you specify again?";
      res.json({
        success: false,
        message: botResponse,
        botResponse: botResponse,
      });
      return; // Add this return statement
    }
  }

  // Check for Lyrics Request
  else if (/lyrics/i.test(message)) {
    const session = getSession();

    // Log session content for better debugging
    logger.debug(`Session content: ${JSON.stringify(session)}`);

    if (session.lastSong && session.lastSong.lyrics) {
      // Send the lyrics along with the bot response
      botResponse = `Here are the lyrics for "${session.lastSong.song}" by ${session.lastSong.artist}:\n\n${session.lastSong.lyrics}`;
      res.json({
        success: true,
        message: "Lyrics found",
        botResponse: botResponse,
        lyrics: session.lastSong.lyrics, // Send lyrics separately if needed
      });
      logger.debug(`Lyrics found for the song: ${session.lastSong.song}`);
      return; // Ensure the response is only sent once
    } else {
      botResponse = "Sorry, I don't have the lyrics for that song.";
      res.json({
        success: true,
        message: botResponse,
        botResponse: botResponse,
      });
      logger.debug(`No lyrics found in session for the last song.`);
      return; // Ensure the response is only sent once
    }
  }

  // Handle Personal Introduction (ignore emotions like "happy", "sad")
  else if (
    /my name is/i.test(message) ||
    (/i am/i.test(message) &&
      !/(happy|sad|excited|angry|bored|tired|fine|good|okay)/i.test(message))
  ) {
    const nameMatch = message.match(/(my name is|i am)\s+([A-Za-z]+)/i);
    if (nameMatch) {
      const name = nameMatch[2].trim();
      updateSession("userName", name);
      botResponse = `Nice to meet you, ${name}! How can I assist you with music today?`;
    }
  }

  // Handle emotions like "I am happy"
  else if (/i am happy/i.test(message) || /i am feeling happy/i.test(message)) {
    botResponse =
      emotionResponses.happy[
        Math.floor(Math.random() * emotionResponses.happy.length)
      ];
  } else if (/i am sad/i.test(message) || /i am feeling sad/i.test(message)) {
    botResponse =
      emotionResponses.sad[
        Math.floor(Math.random() * emotionResponses.sad.length)
      ];
  } else if (/(\w+)\s+song\s+from\s+the\s+(\d{2})\'?s/i.test(message)) {
    const match = message.match(/(\w+)\s+song\s+from\s+the\s+(\d{2})\'?s/i);
    const genre = match[1].toLowerCase();
    const decade = match[2];

    let startYear, endYear;
    switch (decade) {
      case "70":
        startYear = 1970;
        endYear = 1980;
        break;
      case "80":
        startYear = 1980;
        endYear = 1990;
        break;
      case "90":
        startYear = 1990;
        endYear = 2000;
        break;
      case "00":
        startYear = 2000;
        endYear = 2010;
        break;
      default:
        botResponse = "I couldn't understand the decade you're asking for.";
        return res.json({ success: true, botResponse }); // Ensure response is sent here and returned to avoid duplicates
    }

    try {
      const { cluster } = await connectToCouchbase();
      const bucketName = process.env.COUCHBASE_BUCKET || "demo";
      const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
      const collectionAlbums =
        process.env.COUCHBASE_COLLECTION_ALBUMS || "albums";

      const query = `
                SELECT t1.artist, t1.album, t1.year, t1.song, t1.lyrics_summary
                FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionAlbums}\` AS t1
                UNNEST t1.genres AS genre
                WHERE LOWER(genre) = '${genre}'
                AND t1.year BETWEEN ${startYear} AND ${endYear}
                ORDER BY RANDOM()
                LIMIT 1`;

      const result = await cluster.query(query);
      logger.debug(
        `Query result for ${genre} from the ${decade}'s: ${JSON.stringify(result.rows)}`,
      );

      if (result.rows.length > 0) {
        const song = result.rows[0];
        botResponse = genreRecommendationResponses[
          Math.floor(Math.random() * genreRecommendationResponses.length)
        ]
          .replace("{{song}}", song.song)
          .replace("{{artist}}", song.artist)
          .replace("{{album}}", song.album);
        updateSession("lastSong", song);
        logger.debug(`Stored last song in session: ${JSON.stringify(song)}`);
      } else {
        botResponse = `Sorry, I couldn't find any ${genre} songs from the ${decade}'s.`;
      }

      return res.json({ success: true, botResponse }); // Only one response sent
    } catch (error) {
      logger.error(`Error fetching ${genre} song from the ${decade}'s:`, error);
      botResponse =
        "Sorry, something went wrong while fetching a recommendation.";
      return res.json({ success: true, botResponse });
    }
  }

  // Respond based on genre
  else if (genre) {
    try {
      const { cluster } = await connectToCouchbase();
      const bucketName = process.env.COUCHBASE_BUCKET || "demo";
      const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
      const collectionMusic = process.env.COUCHBASE_COLLECTION_MUSIC || "music";

      const query = `
                SELECT m.album, m.artist, m.song, m.year, m.genres, m.\`language\`, m.lyrics, m.albumart, m.lyrics_summary
                FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionMusic}\` AS m
                UNNEST m.genres AS g
                WHERE LOWER(g) = '${genre}'
                ORDER BY RANDOM()
                LIMIT 1`;

      const result = await cluster.query(query);
      logger.debug(
        `Query result for genre: ${genre} - ${JSON.stringify(result.rows)}`,
      );

      if (result.rows.length > 0) {
        const song = result.rows[0];
        botResponse = genreRecommendationResponses[
          Math.floor(Math.random() * genreRecommendationResponses.length)
        ]
          .replace("{{song}}", song.song)
          .replace("{{artist}}", song.artist)
          .replace("{{album}}", song.album);
        updateSession("lastSong", song); // Save last song in session for album art requests
        logger.debug(`Stored last song in session: ${JSON.stringify(song)}`);
      } else {
        botResponse = `Sorry, I couldn't find any ${genre} songs.`;
      }
    } catch (error) {
      logger.error("Error fetching song recommendation:", error);
      botResponse =
        "Sorry, something went wrong while fetching a recommendation.";
    }
  }

  // Respond based on artist
  else if (artist) {
    try {
      const { cluster } = await connectToCouchbase();
      const bucketName = process.env.COUCHBASE_BUCKET || "demo";
      const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
      const collectionMusic = process.env.COUCHBASE_COLLECTION_MUSIC || "music";

      const query = `
                SELECT m.album, m.artist, m.song, m.year, m.genres, m.\`language\`, m.lyrics, m.albumart, m.lyrics_summary
                FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionMusic}\` AS m
                WHERE LOWER(m.artist) = '${artist}'
                ORDER BY RANDOM()
                LIMIT 1`;

      const result = await cluster.query(query);
      logger.debug(
        `Query result for artist: ${artist} - ${JSON.stringify(result.rows)}`,
      );

      if (result.rows.length > 0) {
        const song = result.rows[0];
        botResponse = artistRecommendationResponses[
          Math.floor(Math.random() * artistRecommendationResponses.length)
        ]
          .replace("{{song}}", song.song)
          .replace("{{artist}}", song.artist)
          .replace("{{album}}", song.album);
        updateSession("lastSong", song); // Save last song in session for album art requests
        logger.debug(`Stored last song in session: ${JSON.stringify(song)}`);
      } else {
        botResponse = `Sorry, I couldn't find any songs by ${artist}.`;
      }
    } catch (error) {
      logger.error("Error fetching artist-based recommendation:", error);
      botResponse =
        "Sorry, something went wrong while fetching a recommendation.";
    }
  }

  // Handle Happy Mood (Pop or Glam genre)
  else if (mood === "happy") {
    try {
      const { cluster } = await connectToCouchbase();
      const bucketName = process.env.COUCHBASE_BUCKET || "demo";
      const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
      const collectionMusic = process.env.COUCHBASE_COLLECTION_MUSIC || "music";

      const query = `
                SELECT m.album, m.artist, m.song, m.year, m.genres, m.\`language\`, m.lyrics, m.albumart, m.lyrics_summary
                FROM \`${bucketName}\`.\`${scopeDirectus}\`.\`${collectionMusic}\` AS m
                UNNEST m.genres AS g
                WHERE CONTAINS(LOWER(g), "pop") OR CONTAINS(LOWER(g), "glam")
                ORDER BY RANDOM()
                LIMIT 1`;

      const result = await cluster.query(query);
      logger.debug(
        `Query result for happy mood: ${JSON.stringify(result.rows)}`,
      );

      if (result.rows.length > 0) {
        const song = result.rows[0];
        botResponse = `You're feeling happy! Here's a cheerful song: "${song.song}" by ${song.artist} from the album "${song.album}".`;
        updateSession("lastSong", song); // Save last song in session for album art requests
      } else {
        botResponse = "Sorry, I couldn't find any cheerful songs.";
      }
    } catch (error) {
      logger.error("Error fetching happy mood song recommendation:", error);
      botResponse = "Sorry, something went wrong while fetching a happy song.";
    }
  }

  // Handle Sad Mood (Nu-Metal, Thrash Metal, Industrial Metal)
  else if (mood === "sad") {
    genre = "metal";
    botResponse =
      apologyResponses[Math.floor(Math.random() * apologyResponses.length)];
  }

  // Save Chat Message and Response
  try {
    const { cluster } = await connectToCouchbase();
    const bucketName = process.env.COUCHBASE_BUCKET || "demo";
    const scopeDirectus = process.env.COUCHBASE_SCOPE_DIRECTUS || "directus";
    const collectionChats = process.env.COUCHBASE_COLLECTION_CHATS || "chats";

    const collection = cluster
      .bucket(bucketName)
      .scope(scopeDirectus)
      .collection(collectionChats);

    const chatId = `chat_${username}`;

    // Fetch the existing document to check if it exists
    let chatMessage;
    try {
      const existingDoc = await collection.get(chatId);
      chatMessage = existingDoc.content;
    } catch (err) {
      // Document not found, so initialize a new one
      if (err instanceof couchbase.errors.DocumentNotFoundError) {
        chatMessage = {
          username,
          type: "chat",
          messages: [],
        };
      } else {
        throw err; // Rethrow if it's another error
      }
    }

    // Add the new message to the messages array
    chatMessage.messages.push({ message, timestamp, response: botResponse });

    // Upsert the updated document back to Couchbase
    await collection.upsert(chatId, chatMessage);

    res.json({
      success: true,
      message: "Chat message stored successfully.",
      botResponse,
    });
  } catch (error) {
    logger.error("Error storing chat message:", error);
    res.status(500).json({ error: "Error storing chat message" });
  }
};

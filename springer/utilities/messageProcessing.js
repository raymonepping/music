const logger = require("../configurations/logger");

const natural = require("natural");
const Sentiment = require("sentiment");
const nlp = require("compromise");

// Initialize Sentiment Analyzer
const sentiment = new Sentiment();

// Train Classifier Once
const classifier = new natural.BayesClassifier();
classifier.addDocument("hello", "greeting");
classifier.addDocument("hi", "greeting");
classifier.addDocument("how are you", "ask_bot_mood");
classifier.addDocument("i am happy", "express_emotion");
classifier.addDocument("i am sad", "express_emotion");
classifier.addDocument("recommend a song", "recommend_song");
classifier.addDocument("suggest a pop song", "recommend_song_genre");
classifier.addDocument("thank you", "express_gratitude");
classifier.addDocument("thanks", "express_gratitude");
classifier.addDocument("what can you do", "ask_bot_capabilities");
classifier.addDocument("what is the album of", "ask_album");
classifier.addDocument("what lyrics are similar to", "find_lyrics_similarity");
classifier.train();

/**
 * Preprocess the message by cleaning and normalizing input.
 * @param {string} message - User's message.
 * @returns {string} - Preprocessed message.
 */
function preprocessMessage(message) {
  return message.trim().toLowerCase();
}

/**
 * Detect the intent of the message using natural and regex rules.
 * @param {string} message - User's message.
 * @returns {string} - Detected intent.
 */
function detectIntent(message) {
  const processedMessage = preprocessMessage(message);

  // Regex-based overrides for specific patterns
  if (/^(hi|hello|hey)\s*volt/i.test(processedMessage)) {
    return "greeting";
  }

  return classifier.classify(processedMessage) || "unknown";
}

/**
 * Analyze the sentiment of the message using Sentiment.js.
 * @param {string} message - User's message.
 * @returns {string} - Sentiment: positive, negative, or neutral.
 */
function analyzeSentiment(message) {
  const processedMessage = preprocessMessage(message);
  const result = sentiment.analyze(processedMessage);

  // Adjust sentiment for specific words
  if (processedMessage.includes("sad")) result.score -= 2;
  if (processedMessage.includes("happy")) result.score += 2;

  return result.score > 0
    ? "positive"
    : result.score < 0
    ? "negative"
    : "neutral";
}

/**
 * Extract context (e.g., genre, artist, song) from the message using NLP.
 * @param {string} message - User's message.
 * @returns {object} - Context object.
 */
function extractContext(message) {
  const doc = nlp(message);

  const genreMatch = message.match(
    /\b(pop|rock|jazz|metal|hip-hop|classical|blues|indie|folk)\b/i
  );
  const genre = genreMatch ? genreMatch[1].toLowerCase() : null;

  const artistMatch = message.match(/by\s+([A-Za-z\s]+)/i);
  const artist = artistMatch
    ? artistMatch[1].trim()
    : doc.people().out("text") || null;

  const songMatch = message.match(/(lyrics of|play|recommend)\s+(.+?)$/i);
  const song = songMatch ? songMatch[2] : null;

  const albumMatch = message.match(/(album of|from the album)\s+(.+?)$/i);
  const album = albumMatch ? albumMatch[2] : null;

  const decadeMatch = message.match(/songs?\s+from\s+the\s+(\d{2})s/i);
  const decade = decadeMatch ? `19${decadeMatch[1]}s` : null;

  const context = { genre, artist, song, album, decade };

  logger.debug(`Extracted context: ${JSON.stringify(context)}`);
  return context;
}

module.exports = {
  detectIntent,
  analyzeSentiment,
  extractContext,
};

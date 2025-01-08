// config.js
module.exports = {
  couchbaseBucket: process.env.COUCHBASE_BUCKET,
  couchbaseScopeDirectus: process.env.COUCHBASE_SCOPE_DIRECTUS,
  couchbaseCollectionDirectus: process.env.COUCHBASE_COLLECTION_MUSIC,
  totalGameRounds: parseInt(process.env.TOTAL_GAME_ROUNDS, 10) || 10,
};

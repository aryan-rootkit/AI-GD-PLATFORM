const mongoose = require('mongoose');
const logger = require('../utils/logger');

function getMongoUri() {
  return (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
}

/**
 * Connect to MongoDB Atlas (or any Mongo URI).
 * Set MONGO_URI or MONGODB_URI in Server/.env or Render — never in the Expo app.
 *
 * If no URI is set, the server still starts; user/session models use in-memory fallback.
 */
async function connectDB() {
  const uri = getMongoUri();
  if (!uri) {
    logger.warn('MONGO_URI / MONGODB_URI not set — using in-memory user/session store');
    return;
  }

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    process.exit(1);
  }
}

module.exports = { connectDB, getMongoUri, mongoose };

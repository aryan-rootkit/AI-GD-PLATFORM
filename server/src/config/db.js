const mongoose = require('mongoose');
const logger = console;

function getConnectedDatabaseName() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) return undefined;
  return conn.db.databaseName;
}

function getMongoUri() {
  return (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
}

/** Default DB name when URI has no path (avoids Atlas only showing `test`). */
function getMongoDbName() {
  return (process.env.MONGO_DB_NAME || 'ai-gd-platform').trim() || 'ai-gd-platform';
}

/** True when URI already names a database path (do not override with `dbName`). */
function uriHasDatabasePath(uri) {
  if (!uri) return false;
  const withoutQuery = uri.split('?')[0];
  const doubled = withoutQuery.indexOf('//');
  const rest = doubled >= 0 ? withoutQuery.slice(doubled + 2) : withoutQuery;
  const firstSlash = rest.indexOf('/');
  if (firstSlash === -1) return false;
  const pathAfterSlash = rest.slice(firstSlash + 1).replace(/\/+$/, '');
  return pathAfterSlash.length > 0;
}

/**
 * Connect to MongoDB Atlas (or any Mongo URI).
 * Set MONGO_URI or MONGODB_URI in Server/.env or Render — never in the Expo app.
 * Optional MONGO_DB_NAME (default `ai-gd-platform`) is passed to mongoose when the URI omits a database path.
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
    const opts = {};
    if (!uriHasDatabasePath(uri)) {
      opts.dbName = getMongoDbName();
    }
    if (Object.keys(opts).length) {
      await mongoose.connect(uri, opts);
    } else {
      await mongoose.connect(uri);
    }
    console.log('MongoDB Connected');
    logger.info('MongoDB database', getConnectedDatabaseName());
  } catch (err) {
    logger.error('MongoDB connection failed', err);
    throw err;
  }
}

module.exports = { connectDB };

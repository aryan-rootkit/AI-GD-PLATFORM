const path = require('path');
const dotenv = require('dotenv');
const Redis = require('ioredis');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

let redis;

function getRedisConnection() {
  if (!redis) {
    const url = process.env.REDIS_URL;
    const opts = { maxRetriesPerRequest: null };
    redis = url ? new Redis(url, opts) : new Redis({ host: '127.0.0.1', port: 6379, ...opts });
  }
  return redis;
}

module.exports = { getRedisConnection };

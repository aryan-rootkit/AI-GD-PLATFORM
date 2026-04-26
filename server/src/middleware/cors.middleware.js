const cors = require('cors');
const { expressCorsOrigin } = require('../config/corsOrigins');

/**
 * Express CORS with JWT-friendly origins (see CLIENT_ORIGIN).
 * @returns {import('express').RequestHandler}
 */
function createCorsMiddleware() {
  return cors({
    origin: expressCorsOrigin(),
    credentials: true,
  });
}

module.exports = { createCorsMiddleware };

/**
 * Browser origins allowed for credentialed CORS + Socket.IO.
 * Set CLIENT_ORIGIN on the host (e.g. Render) to your Vercel URL(s).
 * Comma-separated for multiple origins (e.g. production + preview).
 *
 * @example CLIENT_ORIGIN=https://my-app.vercel.app,https://my-app-git-main-org.vercel.app
 */
const DEFAULT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

function parseClientOrigins() {
  const raw = process.env.CLIENT_ORIGIN || '';
  const fromEnv = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ORIGINS, ...fromEnv]));
}

function getAllowedOrigins() {
  return parseClientOrigins();
}

/** Socket.IO `cors.origin`: array of allowed origins */
function getSocketCorsOrigin() {
  return getAllowedOrigins();
}

/** Express `cors` dynamic origin callback */
function expressCorsOrigin() {
  const list = getAllowedOrigins();
  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (list.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}

module.exports = {
  getAllowedOrigins,
  getSocketCorsOrigin,
  expressCorsOrigin,
};

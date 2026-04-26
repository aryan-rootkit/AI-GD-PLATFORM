/**
 * CORS: allow any Vercel deployment (including preview) via `*.vercel.app`, localhost, and
 * optional CLIENT_ORIGIN (comma-separated) for other production domains.
 */

function parseClientOrigins() {
  const raw = process.env.CLIENT_ORIGIN || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const extraOrigins = () => new Set(parseClientOrigins());

/**
 * @param {string | undefined} origin - `Origin` header; omitted for non-browser or same-site
 * @returns {boolean}
 */
function isCorsOriginAllowed(origin) {
  if (!origin) {
    return true;
  }
  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }
  const host = url.hostname;
  if (host === 'vercel.app' || host.endsWith('.vercel.app')) {
    return true;
  }
  if (host === 'localhost' || host === '127.0.0.1') {
    return true;
  }
  if (extraOrigins().has(origin)) {
    return true;
  }
  return false;
}

/** Express `cors({ origin })` and Socket.IO `cors.origin` (same as the `cors` package) */
const corsOriginHandler = (origin, callback) => {
  if (isCorsOriginAllowed(origin)) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'), false);
};

/** Socket.IO reads `cors.origin` as this call’s return value */
function getSocketCorsOrigin() {
  return corsOriginHandler;
}

module.exports = {
  isCorsOriginAllowed,
  getSocketCorsOrigin,
  corsOriginHandler,
};

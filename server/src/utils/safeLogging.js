/** Keys whose values must never appear in logs (case-insensitive match on key). */
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'authorization',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'api_key',
  'secret',
  'jwt',
  'bearer',
  'cookie',
  'set-cookie',
]);

const REDACTED = '[REDACTED]';

/**
 * Deep-clone plain objects for logging and replace sensitive fields.
 * Does not handle Map/Set/Buffer; good enough for request/job payloads.
 * @param {unknown} input
 * @param {number} depth
 * @returns {unknown}
 */
function sanitizeForLog(input, depth = 0) {
  if (depth > 8) return '[MaxDepth]';
  if (input == null) return input;
  if (typeof input !== 'object') return input;
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeForLog(item, depth + 1));
  }
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = REDACTED;
    } else if (v != null && typeof v === 'object') {
      out[k] = sanitizeForLog(v, depth + 1);
    } else {
      out[k] = v;
    }
  }
  return out;
}

module.exports = { sanitizeForLog, REDACTED, SENSITIVE_KEYS };

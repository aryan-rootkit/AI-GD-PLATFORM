/** Hard cap to limit storage and log exposure. */
const MAX_MESSAGE_LENGTH = 12_000;

/** Likely JWT (three base64url segments). */
const JWT_LIKE = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/;

const SENSITIVE_PATTERNS = [
  { re: /\bpassword\s*[:=]\s*\S+/i, hint: 'password' },
  { re: /\bapi[_-]?key\s*[:=]\s*\S+/i, hint: 'api key' },
  { re: /\bsecret\s*[:=]\s*\S+/i, hint: 'secret' },
  { re: /\bbearer\s+[a-z0-9._+/=-]{24,}/i, hint: 'bearer token' },
  { re: /\bsk-[a-zA-Z0-9]{20,}\b/, hint: 'API key pattern' },
  { re: JWT_LIKE, hint: 'token-like string' },
];

/**
 * @param {string} content Trimmed message body
 * @throws {Error} status 400 when content must not be stored
 */
function assertMessageContentAllowed(content) {
  if (content.length > MAX_MESSAGE_LENGTH) {
    const e = new Error(`Message exceeds maximum length (${MAX_MESSAGE_LENGTH} characters)`);
    e.status = 400;
    throw e;
  }
  for (const { re, hint } of SENSITIVE_PATTERNS) {
    if (re.test(content)) {
      const e = new Error(
        `Message may not contain ${hint}. Do not post passwords, API keys, or bearer tokens in chat.`,
      );
      e.status = 400;
      throw e;
    }
  }
}

module.exports = {
  MAX_MESSAGE_LENGTH,
  assertMessageContentAllowed,
};

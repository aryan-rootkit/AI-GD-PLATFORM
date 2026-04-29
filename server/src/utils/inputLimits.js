/** Shared server-side limits (defense in depth with client validation). */

const MAX_SESSION_TITLE_LENGTH = 240;
const MAX_TOPIC_TEXT_LENGTH = 4_000;
const MAX_DISPLAY_NAME_LENGTH = 80;

/**
 * @param {string} detailTrim
 * @throws {Error}
 */
function assertTopicDetailLength(detailTrim) {
  if (detailTrim.length > MAX_TOPIC_TEXT_LENGTH) {
    const e = new Error(`Topic text must be at most ${MAX_TOPIC_TEXT_LENGTH} characters`);
    e.status = 400;
    throw e;
  }
}

/**
 * @param {string} titleTrim
 * @throws {Error}
 */
function assertSessionTitleLength(titleTrim) {
  if (titleTrim.length > MAX_SESSION_TITLE_LENGTH) {
    const e = new Error(`Title must be at most ${MAX_SESSION_TITLE_LENGTH} characters`);
    e.status = 400;
    throw e;
  }
}

module.exports = {
  MAX_SESSION_TITLE_LENGTH,
  MAX_TOPIC_TEXT_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  assertTopicDetailLength,
  assertSessionTitleLength,
};

/**
 * AI evaluation integration layer.
 *
 * Today: deterministic dummy output (no external APIs).
 * Later: swap internals to call your model provider using `sessionData` (transcript, topic, rubric, etc.).
 */

const { buildDummyEvaluation } = require('../utils/evaluation');

/**
 * @typedef {import('../utils/evaluation').EvaluationDto} EvaluationDto
 */

/**
 * Generate a structured evaluation for a participant / session end.
 *
 * @param {Record<string, unknown>} [sessionData] Future inputs, e.g.:
 *   - sessionId, userId
 *   - title, topic, topicKind
 *   - messages / transcript summary
 *   - metrics hints from analytics
 * @returns {EvaluationDto}
 */
function generateEvaluation(sessionData = {}) {
  // Reserved for real integrations (prompt building, retrieval, model calls).
  void sessionData;
  return buildDummyEvaluation();
}

module.exports = {
  generateEvaluation,
};

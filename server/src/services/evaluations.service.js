const evaluationPersistence = require('./evaluationPersistence.service');
const sessionModel = require('../models/session.model');

/**
 * @param {string} userId
 * @param {{ limit?: number, includeSession?: boolean }} [opts]
 */
async function listUserEvaluationHistory(userId, opts = {}) {
  const { limit = 100, includeSession = true } = opts;
  const rows = await evaluationPersistence.listEvaluationsByUser(userId, { limit });

  if (!includeSession) {
    return rows.map((r) => ({
      sessionId: r.sessionId,
      score: r.score,
      strengths: r.strengths,
      improvements: r.improvements,
      metrics: r.metrics,
      isGenerated: r.isGenerated,
      createdAt: r.createdAt,
    }));
  }

  const out = [];
  for (const r of rows) {
    let sessionTitle = null;
    let sessionTopic = null;
    try {
      const session = await sessionModel.findById(r.sessionId);
      if (session) {
        sessionTitle = session.title ?? null;
        sessionTopic = session.topic != null && String(session.topic).trim() ? session.topic : null;
      }
    } catch (_) {
      /* session missing or invalid id */
    }
    out.push({
      sessionId: r.sessionId,
      score: r.score,
      strengths: r.strengths,
      improvements: r.improvements,
      metrics: r.metrics,
      isGenerated: r.isGenerated,
      createdAt: r.createdAt,
      sessionTitle,
      sessionTopic,
    });
  }
  return out;
}

module.exports = { listUserEvaluationHistory };

const mongoose = require('mongoose');
const { normalizeEvaluationForApi } = require('../utils/evaluation');
const aiEvaluationService = require('./aiEvaluation.service');
const userModel = require('../models/user.model');
const logger = require('../utils/logger');

/** In-memory evaluations when MongoDB is not used: sessionId -> rows */
const memoryBySession = new Map();

/** userId -> history rows (newest first), for GET /evaluations/user/:userId without Mongo */
const memoryEvaluationsByUser = new Map();

function isMongo() {
  return mongoose.connection.readyState === 1;
}

function isObjectIdString(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

function getEvaluationModel() {
  return require('../../models/Evaluation.model');
}

/**
 * @param {Array<{ userId: string, score: number }>} rows
 */
async function applyUserStatsForEvaluations(rows) {
  for (const row of rows) {
    try {
      await userModel.applyEvaluationToUserStats(row.userId, row.score);
    } catch (err) {
      logger.warn('applyEvaluationToUserStats failed', {
        userId: row.userId,
        err: err?.message || String(err),
      });
    }
  }
}

/**
 * @param {string} sessionId
 * @param {string[]} participantIds
 * @returns {Promise<Array<{ userId: string, score: number, strengths: string, improvements: string, metrics: Record<string, number>, isGenerated: boolean }>>}
 */
async function persistEvaluationsForParticipants(sessionId, participantIds) {
  const sid = String(sessionId).trim();
  const unique = [...new Set((participantIds || []).map((p) => String(p).trim()).filter(Boolean))];
  const out = [];

  for (const userId of unique) {
    const dto = aiEvaluationService.generateEvaluation({ sessionId: sid, userId });
    out.push({ userId, ...dto });
  }

  if (!isMongo() || !isObjectIdString(sid)) {
    const createdAt = new Date().toISOString();
    memoryBySession.set(
      sid,
      out.map((row) => ({ ...row, createdAt })),
    );
    for (const row of out) {
      const uid = String(row.userId);
      const hist = memoryEvaluationsByUser.get(uid) || [];
      hist.unshift({
        sessionId: sid,
        score: row.score,
        strengths: row.strengths || '',
        improvements: row.improvements || '',
        metrics: row.metrics,
        isGenerated: row.isGenerated !== false,
        createdAt,
      });
      memoryEvaluationsByUser.set(uid, hist.slice(0, 500));
    }
    await applyUserStatsForEvaluations(out);
    return out;
  }

  const Evaluation = getEvaluationModel();
  await Evaluation.deleteMany({ sessionId: new mongoose.Types.ObjectId(sid) });

  const docs = unique
    .filter((userId) => isObjectIdString(userId))
    .map((userId) => {
      const dto = out.find((r) => r.userId === userId);
      if (!dto) return null;
      return {
        sessionId: new mongoose.Types.ObjectId(sid),
        userId: new mongoose.Types.ObjectId(userId),
        score: dto.score,
        strengths: dto.strengths,
        improvements: dto.improvements,
        metrics: dto.metrics,
        isGenerated: dto.isGenerated !== false,
      };
    })
    .filter(Boolean);

  if (docs.length > 0) {
    await Evaluation.insertMany(docs);
  }

  await applyUserStatsForEvaluations(out);

  return out;
}

/**
 * @param {string} sessionId
 * @param {string} userId
 * @returns {Promise<{ score: number, strengths: string, improvements: string, metrics: Record<string, number>, isGenerated: boolean } | null>}
 */
async function findEvaluationForUser(sessionId, userId) {
  const sid = String(sessionId).trim();
  const uid = String(userId).trim();

  if (!isMongo()) {
    const fromMemory = (memoryBySession.get(sid) || []).find((r) => r.userId === uid);
    if (!fromMemory) return null;
    return normalizeEvaluationForApi({
      score: fromMemory.score,
      strengths: fromMemory.strengths,
      improvements: fromMemory.improvements,
      metrics: fromMemory.metrics,
      feedback: fromMemory.feedback,
      isGenerated: fromMemory.isGenerated,
    });
  }

  if (!isObjectIdString(sid) || !isObjectIdString(uid)) {
    return null;
  }

  const Evaluation = getEvaluationModel();
  const doc = await Evaluation.findOne({
    sessionId: new mongoose.Types.ObjectId(sid),
    userId: new mongoose.Types.ObjectId(uid),
  }).lean();

  if (!doc) return null;
  return normalizeEvaluationForApi({
    score: doc.score,
    strengths: doc.strengths,
    improvements: doc.improvements,
    metrics: doc.metrics,
    feedback: doc.feedback,
    isGenerated: doc.isGenerated,
  });
}

/**
 * @param {string} userId
 * @param {{ limit?: number }} [opts]
 * @returns {Promise<Array<{ sessionId: string, score: number, strengths: string, improvements: string, metrics: Record<string, number>, isGenerated: boolean, createdAt: string }>>}
 */
async function listEvaluationsByUser(userId, opts = {}) {
  const uid = String(userId || '').trim();
  const limit = Math.min(Math.max(Number(opts.limit) || 100, 1), 500);
  if (!uid) return [];

  if (!isMongo()) {
    const list = memoryEvaluationsByUser.get(uid) || [];
    return list.slice(0, limit).map((r) => {
      const norm = normalizeEvaluationForApi({
        score: r.score,
        strengths: r.strengths,
        improvements: r.improvements,
        metrics: r.metrics,
        feedback: r.feedback,
        isGenerated: r.isGenerated,
      });
      if (!norm) {
        return {
          sessionId: String(r.sessionId),
          score: r.score,
          strengths: r.strengths || '',
          improvements: r.improvements || '',
          metrics: {},
          isGenerated: true,
          createdAt: r.createdAt,
        };
      }
      return {
        sessionId: String(r.sessionId),
        createdAt: r.createdAt,
        ...norm,
      };
    });
  }

  if (!isObjectIdString(uid)) {
    return [];
  }

  const Evaluation = getEvaluationModel();
  const docs = await Evaluation.find({ userId: new mongoose.Types.ObjectId(uid) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map((d) => {
    const norm = normalizeEvaluationForApi({
      score: d.score,
      strengths: d.strengths,
      improvements: d.improvements,
      metrics: d.metrics,
      feedback: d.feedback,
      isGenerated: d.isGenerated,
    });
    const createdAt = d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString();
    if (!norm) {
      return {
        sessionId: String(d.sessionId),
        score: d.score,
        strengths: typeof d.strengths === 'string' ? d.strengths : '',
        improvements: typeof d.improvements === 'string' ? d.improvements : '',
        metrics: {},
        isGenerated: true,
        createdAt,
      };
    }
    return {
      sessionId: String(d.sessionId),
      createdAt,
      ...norm,
    };
  });
}

module.exports = {
  persistEvaluationsForParticipants,
  findEvaluationForUser,
  listEvaluationsByUser,
};

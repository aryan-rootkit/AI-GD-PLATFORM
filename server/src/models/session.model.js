const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const { normalizeEvaluationForApi } = require('../utils/evaluation');

const practicePersonaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    displayName: { type: String, required: true },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    hostId: { type: String, required: true },
    participants: [{ type: String }],
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    isPractice: { type: Boolean, default: false },
    practiceParticipants: { type: [practicePersonaSchema], default: [] },
    topicKind: {
      type: String,
      enum: ['business', 'technology', 'abstract', 'custom', 'auto'],
      default: 'auto',
    },
    topicDetail: { type: String, default: '' },
    /** Resolved discussion topic line for UI / analytics / future AI (preset label, custom text, or preset · detail). */
    topic: { type: String, default: '' },
    evaluation: {
      score: { type: Number },
      /** @deprecated Prefer strengths / improvements; kept for legacy documents */
      feedback: { type: String },
      strengths: { type: String },
      improvements: { type: String },
      metrics: {
        communication: { type: Number },
        engagement: { type: Number },
        clarity: { type: Number },
        confidence: { type: Number },
      },
      isGenerated: { type: Boolean, default: true },
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

const sessions = new Map();

function isMongo() {
  return mongoose.connection.readyState === 1;
}

function isCastError(err) {
  return Boolean(err && err.name === 'CastError');
}

function mapPracticeParticipants(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((p) => ({
      id: p && typeof p.id === 'string' ? p.id : '',
      displayName: p && typeof p.displayName === 'string' ? p.displayName : 'AI participant',
    }))
    .filter((p) => p.id);
}

const TOPIC_KINDS = ['business', 'technology', 'abstract', 'custom', 'auto'];

function buildTopicLine(topicKind, topicDetailTrim) {
  const kind =
    typeof topicKind === 'string' && TOPIC_KINDS.includes(topicKind) ? topicKind : 'auto';
  const d = topicDetailTrim || '';
  const labels = { business: 'Business', technology: 'Technology', abstract: 'Abstract' };
  if (kind === 'custom') return d;
  if (kind === 'auto') return '';
  const L = labels[kind];
  if (!L) return d;
  return d ? `${L} · ${d}` : L;
}

function mapSession(o) {
  if (!o) return null;
  const id = o._id != null ? String(o._id) : o.id;
  const evaluation =
    o.evaluation && typeof o.evaluation.score === 'number'
      ? normalizeEvaluationForApi(o.evaluation)
      : undefined;
  const isPractice = Boolean(o.isPractice);
  const practiceParticipants = mapPracticeParticipants(o.practiceParticipants);
  const topicKind =
    typeof o.topicKind === 'string' && TOPIC_KINDS.includes(o.topicKind) ? o.topicKind : 'auto';
  const topicDetailRaw = o.topicDetail;
  const topicDetailTrim =
    typeof topicDetailRaw === 'string' && topicDetailRaw.trim() ? topicDetailRaw.trim() : '';
  const topicRaw = typeof o.topic === 'string' ? o.topic.trim() : '';
  const topic = topicRaw || buildTopicLine(topicKind, topicDetailTrim);
  return {
    id,
    title: o.title,
    hostId: o.hostId,
    participants: Array.isArray(o.participants) ? [...o.participants] : [],
    status: o.status,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    topic,
    topicKind,
    ...(topicDetailTrim ? { topicDetail: topicDetailTrim } : {}),
    ...(evaluation ? { evaluation } : {}),
    ...(isPractice
      ? { isPractice: true, practiceParticipants }
      : {}),
  };
}

async function createSession({
  title,
  hostId,
  isPractice = false,
  practiceParticipants = [],
  topicKind = 'auto',
  topicDetail = '',
}) {
  const practice = Boolean(isPractice);
  const bots = practice ? mapPracticeParticipants(practiceParticipants) : [];
  const kind = typeof topicKind === 'string' && TOPIC_KINDS.includes(topicKind) ? topicKind : 'auto';
  const detailRaw = typeof topicDetail === 'string' ? topicDetail : '';
  const detailTrim = detailRaw.trim();
  const storedTopic = buildTopicLine(kind, detailTrim);
  if (isMongo()) {
    const doc = await Session.create({
      title,
      hostId,
      participants: [hostId],
      status: 'active',
      isPractice: practice,
      practiceParticipants: bots,
      topicKind: kind,
      topicDetail: detailTrim,
      topic: storedTopic,
    });
    return mapSession(doc.toObject());
  }
  const id = randomUUID();
  const session = {
    id,
    title,
    hostId,
    participants: [hostId],
    status: 'active',
    createdAt: new Date().toISOString(),
    isPractice: practice,
    practiceParticipants: bots,
    topicKind: kind,
    topicDetail: detailTrim,
    topic: storedTopic,
  };
  sessions.set(id, session);
  return mapSession(session);
}

async function findById(sessionId) {
  if (sessionId == null) return null;
  const id = String(sessionId).trim();
  if (!id) return null;
  if (isMongo()) {
    try {
      const doc = await Session.findById(id).lean();
      return mapSession(doc);
    } catch (err) {
      if (isCastError(err)) return null;
      throw err;
    }
  }
  const s = sessions.get(id);
  if (!s) return null;
  return mapSession(s);
}

async function removeParticipant(sessionId, userId) {
  const id = sessionId == null ? '' : String(sessionId).trim();
  if (isMongo()) {
    try {
      const doc = await Session.findByIdAndUpdate(
        id,
        { $pull: { participants: userId } },
        { new: true, runValidators: true },
      ).lean();
      if (!doc || doc.status !== 'active') return null;
      return mapSession(doc);
    } catch (err) {
      if (isCastError(err)) return null;
      throw err;
    }
  }
  const s = sessions.get(id);
  if (!s || s.status !== 'active') return null;
  s.participants = s.participants.filter((p) => p !== userId);
  return mapSession(s);
}

async function addParticipant(sessionId, userId) {
  const id = sessionId == null ? '' : String(sessionId).trim();
  if (isMongo()) {
    try {
      const doc = await Session.findByIdAndUpdate(
        id,
        { $addToSet: { participants: userId } },
        { new: true, runValidators: true },
      ).lean();
      if (!doc || doc.status !== 'active') return null;
      return mapSession(doc);
    } catch (err) {
      if (isCastError(err)) return null;
      throw err;
    }
  }
  const s = sessions.get(id);
  if (!s || s.status !== 'active') return null;
  if (!s.participants.includes(userId)) {
    s.participants.push(userId);
  }
  return mapSession(s);
}

/**
 * Ended sessions the user hosted or joined, newest first (cap 100).
 */
async function listEndedSessionsForUser(userId) {
  if (!userId) return [];
  if (isMongo()) {
    try {
      const docs = await Session.find({
        status: 'ended',
        $or: [{ hostId: userId }, { participants: userId }],
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      return docs;
    } catch (err) {
      throw err;
    }
  }
  const out = [];
  for (const s of sessions.values()) {
    if (s.status !== 'ended') continue;
    const inRoom =
      s.hostId === userId || (Array.isArray(s.participants) && s.participants.includes(userId));
    if (!inRoom) continue;
    out.push({ ...s, participants: [...s.participants] });
  }
  out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return out.slice(0, 100);
}

async function endSession(sessionId) {
  const id = sessionId == null ? '' : String(sessionId).trim();
  if (isMongo()) {
    try {
      const doc = await Session.findByIdAndUpdate(
        id,
        { $set: { status: 'ended' }, $unset: { evaluation: 1 } },
        { new: true },
      ).lean();
      if (!doc) return null;
      return mapSession(doc);
    } catch (err) {
      if (isCastError(err)) return null;
      throw err;
    }
  }
  const s = sessions.get(id);
  if (!s) return null;
  s.status = 'ended';
  delete s.evaluation;
  return mapSession(s);
}

module.exports = {
  createSession,
  findById,
  addParticipant,
  removeParticipant,
  endSession,
  listEndedSessionsForUser,
  mapSession,
};

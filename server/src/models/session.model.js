const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    hostId: { type: String, required: true },
    participants: [{ type: String }],
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    evaluation: {
      score: { type: Number },
      feedback: { type: String },
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

function mapSession(o) {
  if (!o) return null;
  const id = o._id != null ? String(o._id) : o.id;
  const evaluation =
    o.evaluation &&
    typeof o.evaluation.score === 'number' &&
    typeof o.evaluation.feedback === 'string'
      ? { score: o.evaluation.score, feedback: o.evaluation.feedback }
      : undefined;
  return {
    id,
    title: o.title,
    hostId: o.hostId,
    participants: Array.isArray(o.participants) ? [...o.participants] : [],
    status: o.status,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    ...(evaluation ? { evaluation } : {}),
  };
}

async function createSession({ title, hostId }) {
  if (isMongo()) {
    const doc = await Session.create({
      title,
      hostId,
      participants: [hostId],
      status: 'active',
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
  };
  sessions.set(id, session);
  return { ...session, participants: [...session.participants] };
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
  return { ...s, participants: [...s.participants] };
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
  return { ...s, participants: [...s.participants] };
}

/**
 * @param {string} sessionId
 * @param {{ score: number, feedback: string }} evaluation
 */
async function endSession(sessionId, evaluation) {
  const id = sessionId == null ? '' : String(sessionId).trim();
  if (isMongo()) {
    try {
      const doc = await Session.findByIdAndUpdate(
        id,
        { status: 'ended', evaluation },
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
  s.evaluation = { ...evaluation };
  return { ...s, participants: [...s.participants], evaluation: { ...s.evaluation } };
}

module.exports = { createSession, findById, addParticipant, endSession };

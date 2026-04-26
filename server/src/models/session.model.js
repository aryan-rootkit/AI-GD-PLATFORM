const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    hostId: { type: String, required: true },
    participants: [{ type: String }],
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

const sessions = new Map();

function isMongo() {
  return mongoose.connection.readyState === 1;
}

function mapSession(o) {
  if (!o) return null;
  const id = o._id != null ? String(o._id) : o.id;
  return {
    id,
    title: o.title,
    hostId: o.hostId,
    participants: Array.isArray(o.participants) ? [...o.participants] : [],
    status: o.status,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
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
  if (isMongo()) {
    const doc = await Session.findById(sessionId).lean();
    return mapSession(doc);
  }
  const s = sessions.get(sessionId);
  if (!s) return null;
  return { ...s, participants: [...s.participants] };
}

async function addParticipant(sessionId, userId) {
  if (isMongo()) {
    const doc = await Session.findByIdAndUpdate(
      sessionId,
      { $addToSet: { participants: userId } },
      { new: true, runValidators: true },
    ).lean();
    if (!doc || doc.status !== 'active') return null;
    return mapSession(doc);
  }
  const s = sessions.get(sessionId);
  if (!s || s.status !== 'active') return null;
  if (!s.participants.includes(userId)) {
    s.participants.push(userId);
  }
  return { ...s, participants: [...s.participants] };
}

async function endSession(sessionId) {
  if (isMongo()) {
    const doc = await Session.findByIdAndUpdate(
      sessionId,
      { status: 'ended' },
      { new: true },
    ).lean();
    if (!doc) return null;
    return mapSession(doc);
  }
  const s = sessions.get(sessionId);
  if (!s) return null;
  s.status = 'ended';
  return { ...s, participants: [...s.participants] };
}

module.exports = { createSession, findById, addParticipant, endSession };

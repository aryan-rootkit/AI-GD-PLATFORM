const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    sessionsParticipated: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

/** In-memory fallback when Mongo is not connected */
const byEmail = new Map();
const byId = new Map();

function isMongo() {
  return mongoose.connection.readyState === 1;
}

function toPublic(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function mapDoc(o) {
  if (!o) return null;
  const id = o._id != null ? String(o._id) : o.id;
  return {
    id,
    name: o.name,
    email: o.email,
    passwordHash: o.passwordHash,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    sessionsParticipated: typeof o.sessionsParticipated === 'number' ? o.sessionsParticipated : 0,
    totalScore: typeof o.totalScore === 'number' ? o.totalScore : 0,
    avgScore: typeof o.avgScore === 'number' ? o.avgScore : 0,
  };
}

function isObjectIdString(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

/**
 * After an evaluation is stored, bump session count and rolling average score.
 * @param {string} userId
 * @param {number} score
 * @returns {Promise<object | null>} updated mapDoc or null if user missing / skipped
 */
async function applyEvaluationToUserStats(userId, score) {
  const uid = String(userId || '').trim();
  const scoreNum = Number(score);
  if (!uid || !Number.isFinite(scoreNum)) {
    return null;
  }

  if (isMongo() && isObjectIdString(uid)) {
    const doc = await User.findOneAndUpdate(
      { _id: uid },
      [
        {
          $set: {
            sessionsParticipated: { $add: [{ $ifNull: ['$sessionsParticipated', 0] }, 1] },
            totalScore: { $add: [{ $ifNull: ['$totalScore', 0] }, scoreNum] },
          },
        },
        {
          $set: {
            avgScore: {
              $round: [{ $divide: ['$totalScore', '$sessionsParticipated'] }, 4],
            },
          },
        },
      ],
      { new: true },
    ).lean();
    return doc ? mapDoc(doc) : null;
  }

  if (isMongo()) {
    return null;
  }

  const user = byId.get(uid);
  if (!user) {
    return null;
  }
  const sp = (user.sessionsParticipated || 0) + 1;
  const ts = (user.totalScore || 0) + scoreNum;
  user.sessionsParticipated = sp;
  user.totalScore = ts;
  user.avgScore = sp > 0 ? Math.round((ts / sp) * 10000) / 10000 : 0;
  byEmail.set(user.email, user);
  return mapDoc(user);
}

async function findByEmail(email) {
  const key = String(email).trim().toLowerCase();
  if (isMongo()) {
    const doc = await User.findOne({ email: key }).lean();
    return mapDoc(doc);
  }
  const u = byEmail.get(key);
  return u ? { ...u } : null;
}

async function findById(id) {
  if (isMongo()) {
    const doc = await User.findById(id).lean();
    return mapDoc(doc);
  }
  const u = byId.get(id);
  return u ? { ...u } : null;
}

async function createUser(data) {
  const key = String(data.email).trim().toLowerCase();
  if (isMongo()) {
    try {
      const doc = await User.create({
        name: data.name,
        email: key,
        passwordHash: data.passwordHash,
      });
      return toPublic(mapDoc(doc.toObject()));
    } catch (e) {
      if (e && e.code === 11000) return null;
      throw e;
    }
  }
  if (byEmail.has(key)) return null;
  const id = randomUUID();
  const user = {
    id,
    name: data.name,
    email: key,
    passwordHash: data.passwordHash,
    createdAt: new Date().toISOString(),
    sessionsParticipated: 0,
    totalScore: 0,
    avgScore: 0,
  };
  byEmail.set(key, user);
  byId.set(id, user);
  return toPublic(user);
}

module.exports = { findByEmail, findById, createUser, toPublic, applyEvaluationToUserStats };

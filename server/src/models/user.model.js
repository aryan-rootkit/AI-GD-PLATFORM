const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
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
  };
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
  };
  byEmail.set(key, user);
  byId.set(id, user);
  return toPublic(user);
}

module.exports = { findByEmail, findById, createUser, toPublic };

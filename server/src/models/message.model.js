const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    senderEmail: { type: String, default: '' },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

messageSchema.index({ sessionId: 1, createdAt: 1 });

/** Single model type so `checkJs` accepts `.create` / `.find` (avoids union inference). */
/** @type {import('mongoose').Model<import('mongoose').InferSchemaType<typeof messageSchema>>} */
const Message = mongoose.models.Message
  ? mongoose.model('Message')
  : mongoose.model('Message', messageSchema);

/** @type {Map<string, Array<{ id: string, sessionId: string, userId: string, senderEmail: string, text: string, at: string }>>} */
const memoryBySession = new Map();

function isMongo() {
  return mongoose.connection.readyState === 1;
}

function toApi(doc) {
  const id = doc.id || (doc._id != null ? String(doc._id) : randomUUID());
  const at =
    doc.at ||
    (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString());
  return {
    id,
    sessionId: String(doc.sessionId),
    userId: doc.userId,
    senderEmail: doc.senderEmail || '',
    text: doc.text,
    at,
  };
}

async function append({ sessionId, userId, senderEmail, text }) {
  if (isMongo()) {
    const doc = await Message.create({
      sessionId: String(sessionId),
      userId,
      senderEmail: senderEmail || '',
      text,
    });
    return toApi(doc.toObject());
  }
  const id = randomUUID();
  const at = new Date().toISOString();
  const row = {
    id,
    sessionId: String(sessionId),
    userId,
    senderEmail: senderEmail || '',
    text,
    at,
  };
  const list = memoryBySession.get(String(sessionId)) || [];
  list.push(row);
  memoryBySession.set(String(sessionId), list);
  return toApi(row);
}

async function listBySession(sessionId, { limit = 300 } = {}) {
  if (isMongo()) {
    const docs = await Message.find({ sessionId: String(sessionId) })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
    return docs.map((d) => toApi(d));
  }
  const list = memoryBySession.get(String(sessionId)) || [];
  return list.slice(-limit).map(toApi);
}

module.exports = { append, listBySession };

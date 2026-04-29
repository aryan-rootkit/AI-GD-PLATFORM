const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const { assertMessageContentAllowed } = require('../utils/messageContentPolicy');

const messageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, default: '' },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['user', 'system', 'ai'],
      default: 'user',
    },
    /** Legacy fields (older documents) */
    userId: { type: String },
    text: { type: String },
    senderEmail: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

messageSchema.index({ sessionId: 1, createdAt: 1 });

/** @type {import('mongoose').Model<import('mongoose').InferSchemaType<typeof messageSchema>>} */
const Message = mongoose.models.Message
  ? mongoose.model('Message')
  : mongoose.model('Message', messageSchema);

/** @type {Map<string, Array<Record<string, unknown>>>} */
const memoryBySession = new Map();

function isMongo() {
  return mongoose.connection.readyState === 1;
}

function inferType(doc) {
  const t = doc.type;
  if (t === 'user' || t === 'system' || t === 'ai') return t;
  const sid = doc.senderId || doc.userId;
  if (sid === 'ai-moderator') return 'ai';
  if (sid === 'system' || sid === '__system__') return 'system';
  return 'user';
}

function toApi(doc) {
  const id = doc.id || (doc._id != null ? String(doc._id) : randomUUID());
  const senderId = doc.senderId || doc.userId || '';
  const content =
    doc.content != null && String(doc.content).length > 0 ? String(doc.content) : String(doc.text ?? '');
  const senderName =
    (doc.senderName != null && String(doc.senderName)) ||
    (doc.senderEmail != null && String(doc.senderEmail)) ||
    '';
  const type = inferType(doc);
  const at =
    doc.at ||
    (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString());

  return {
    id,
    sessionId: String(doc.sessionId),
    senderId,
    content,
    senderName,
    type,
    timestamp: at,
    userId: senderId,
    text: content,
    senderEmail: senderName,
    at,
  };
}

/**
 * @param {{ sessionId: string, senderId: string, senderName?: string, content: string, type?: 'user'|'system'|'ai' }} row
 */
async function append({ sessionId, senderId, senderName = '', content, type = 'user' }) {
  const trimmed = typeof content === 'string' ? content.trim() : '';
  if (!trimmed) {
    const e = new Error('Message content cannot be empty');
    e.status = 400;
    throw e;
  }

  if (type === 'user') {
    assertMessageContentAllowed(trimmed);
  }

  if (isMongo()) {
    const doc = await Message.create({
      sessionId: String(sessionId),
      senderId: String(senderId),
      senderName: senderName || '',
      content: trimmed,
      type,
    });
    return toApi(doc.toObject());
  }

  const id = randomUUID();
  const at = new Date().toISOString();
  const row = {
    id,
    sessionId: String(sessionId),
    senderId: String(senderId),
    senderName: senderName || '',
    content: trimmed,
    type,
    createdAt: new Date(at),
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
  return list.slice(-limit).map((d) => toApi(d));
}

module.exports = { append, listBySession };

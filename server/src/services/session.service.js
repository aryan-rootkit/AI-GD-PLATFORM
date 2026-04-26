const sessionModel = require('../models/session.model');
const messageModel = require('../models/message.model');
const { enqueueSessionCreatedSample } = require('../queue/discussion.queue');

async function createSession({ title, hostId }) {
  if (!title || typeof title !== 'string') {
    const e = new Error('title is required');
    e.status = 400;
    throw e;
  }
  console.log('Creating session…', { title: title.trim(), hostId });
  const session = await sessionModel.createSession({ title: title.trim(), hostId });
  console.log('Session created:', session);
  // Do not await: Redis/BullMQ can hang the HTTP response if Redis is slow or unreachable.
  enqueueSessionCreatedSample(session.id).catch((err) => {
    console.warn('[session] queue enqueue skipped:', err?.message || err);
  });
  return session;
}

async function joinSession({ sessionId, userId }) {
  const existing = await sessionModel.findById(sessionId);
  if (!existing) {
    const e = new Error('session not found');
    e.status = 404;
    throw e;
  }
  if (existing.status !== 'active') {
    const e = new Error('session is not active');
    e.status = 400;
    throw e;
  }
  const updated = await sessionModel.addParticipant(sessionId, userId);
  return updated;
}

async function assertActiveParticipant(sessionId, userId) {
  const session = await sessionModel.findById(sessionId);
  if (!session) {
    const e = new Error('session not found');
    e.status = 404;
    throw e;
  }
  if (session.status !== 'active') {
    const e = new Error('session is not active');
    e.status = 400;
    throw e;
  }
  if (!session.participants.includes(userId)) {
    const e = new Error('not a participant');
    e.status = 403;
    throw e;
  }
  return session;
}

async function getSessionForUser({ sessionId, userId }) {
  return assertActiveParticipant(sessionId, userId);
}

async function listSessionMessages({ sessionId, userId }) {
  await assertActiveParticipant(sessionId, userId);
  return messageModel.listBySession(sessionId);
}

async function appendSessionMessage({ sessionId, userId, senderEmail, text }) {
  await assertActiveParticipant(sessionId, userId);
  return messageModel.append({
    sessionId,
    userId,
    senderEmail,
    text,
  });
}

const AI_MODERATOR_USER_ID = 'ai-moderator';

/**
 * Appends a message from the AI moderator (not a room participant; session must be active).
 */
async function appendAIModeratorMessage({ sessionId, text }) {
  const session = await sessionModel.findById(sessionId);
  if (!session) {
    const e = new Error('session not found');
    e.status = 404;
    throw e;
  }
  if (session.status !== 'active') {
    const e = new Error('session is not active');
    e.status = 400;
    throw e;
  }
  return messageModel.append({
    sessionId,
    userId: AI_MODERATOR_USER_ID,
    senderEmail: 'AI Moderator',
    text,
  });
}

async function endSession({ sessionId, userId }) {
  const existing = await sessionModel.findById(sessionId);
  if (!existing) {
    const e = new Error('session not found');
    e.status = 404;
    throw e;
  }
  if (existing.hostId !== userId) {
    const e = new Error('only the host can end this session');
    e.status = 403;
    throw e;
  }
  if (existing.status === 'ended') {
    const e = new Error('session already ended');
    e.status = 400;
    throw e;
  }
  return sessionModel.endSession(sessionId);
}

module.exports = {
  createSession,
  joinSession,
  endSession,
  assertActiveParticipant,
  getSessionForUser,
  listSessionMessages,
  appendSessionMessage,
  appendAIModeratorMessage,
};

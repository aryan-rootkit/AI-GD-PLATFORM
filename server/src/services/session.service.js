const sessionModel = require('../models/session.model');
const messageModel = require('../models/message.model');
const { enqueueSessionCreatedSample } = require('../queue/discussion.queue');
const logger = require('../utils/logger');

/**
 * Dummy evaluation for ended sessions (no external AI).
 * @returns {{ score: number, feedback: string }}
 */
function generateEvaluation() {
  const score = Math.floor(Math.random() * 10) + 1;
  let feedback;
  if (score >= 8) {
    feedback = 'Strong participation and clarity';
  } else if (score >= 5) {
    feedback = 'Good attempt but can improve arguments';
  } else {
    feedback = 'Needs improvement in communication';
  }
  return { score, feedback };
}

function emitSessionEvaluated(sessionId, evaluation) {
  try {
    const { getIo } = require('../sockets/socket');
    const io = getIo();
    if (io) {
      io.to(String(sessionId)).emit('session_evaluated', {
        sessionId: String(sessionId),
        evaluation,
      });
    }
  } catch (err) {
    logger.warn('session_evaluated emit skipped', err?.message || err);
  }
}

async function createSession({ title, hostId }) {
  if (!title || typeof title !== 'string') {
    const e = new Error('title is required');
    e.status = 400;
    throw e;
  }
  const session = await sessionModel.createSession({ title: title.trim(), hostId });
  logger.info('Session created', { sessionId: session.id, hostId });
  // Do not await: Redis/BullMQ can hang the HTTP response if Redis is slow or unreachable.
  enqueueSessionCreatedSample(session.id).catch((err) => {
    logger.warn('[session] queue enqueue skipped', { err: err?.message || String(err) });
  });
  return session;
}

async function joinSession({ sessionId, userId }) {
  const existing = await sessionModel.findById(sessionId);
  if (!existing) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  if (existing.status !== 'active') {
    const e = new Error('Cannot join: this session has already ended');
    e.status = 400;
    throw e;
  }
  const updated = await sessionModel.addParticipant(sessionId, userId);
  if (!updated) {
    const e = new Error('Unable to join this session; it may no longer exist or is no longer active');
    e.status = 400;
    throw e;
  }
  logger.info('User joined session', { sessionId: String(sessionId), userId });
  return updated;
}

async function assertActiveParticipant(sessionId, userId) {
  const session = await sessionModel.findById(sessionId);
  if (!session) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  if (session.status !== 'active') {
    const e = new Error('This session has ended; messaging is not available');
    e.status = 400;
    throw e;
  }
  if (!session.participants.includes(userId)) {
    const e = new Error('You are not a member of this session');
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
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!trimmed) {
    const e = new Error('Message text cannot be empty');
    e.status = 400;
    throw e;
  }
  const saved = await messageModel.append({
    sessionId,
    userId,
    senderEmail,
    text: trimmed,
  });
  logger.info('Message sent', { sessionId: String(sessionId), userId, messageId: saved?.id });
  return saved;
}

const AI_MODERATOR_USER_ID = 'ai-moderator';

/**
 * Appends a message from the AI moderator (not a room participant; session must be active).
 */
async function appendAIModeratorMessage({ sessionId, text }) {
  const session = await sessionModel.findById(sessionId);
  if (!session) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  if (session.status !== 'active') {
    const e = new Error('This session has ended');
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
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  if (existing.hostId !== userId) {
    const e = new Error('Only the host can end this session');
    e.status = 403;
    throw e;
  }
  if (existing.status === 'ended') {
    const e = new Error('This session has already ended');
    e.status = 400;
    throw e;
  }
  const evaluation = generateEvaluation();
  const updated = await sessionModel.endSession(sessionId, evaluation);
  if (!updated) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  logger.info('Session ended', { sessionId: String(sessionId), userId });
  logger.info('Evaluation generated', {
    sessionId: String(sessionId),
    score: evaluation.score,
  });
  emitSessionEvaluated(sessionId, evaluation);
  return updated;
}

/**
 * Read-only session snapshot for debugging (host or participant only).
 */
async function getSessionDebug({ sessionId, userId }) {
  const session = await sessionModel.findById(sessionId);
  if (!session) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  const allowed =
    session.hostId === userId ||
    (Array.isArray(session.participants) && session.participants.includes(userId));
  if (!allowed) {
    const e = new Error('You do not have access to this session');
    e.status = 403;
    throw e;
  }
  return {
    ...session,
    participantCount: session.participants.length,
  };
}

module.exports = {
  createSession,
  joinSession,
  endSession,
  generateEvaluation,
  assertActiveParticipant,
  getSessionForUser,
  getSessionDebug,
  listSessionMessages,
  appendSessionMessage,
  appendAIModeratorMessage,
};

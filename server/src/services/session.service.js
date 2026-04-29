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

/** Mock AI personas for practice mode (no real users). */
const PRACTICE_AI_PARTICIPANTS = [
  { id: 'ai-practice-maya', displayName: 'Maya (AI)' },
  { id: 'ai-practice-jordan', displayName: 'Jordan (AI)' },
  { id: 'ai-practice-sam', displayName: 'Sam (AI)' },
];

const TOPIC_KINDS = ['business', 'technology', 'abstract', 'custom', 'auto'];

function normalizeTopicForCreate(topicKind, topicDetail) {
  const kind =
    typeof topicKind === 'string' && TOPIC_KINDS.includes(String(topicKind).toLowerCase())
      ? String(topicKind).toLowerCase()
      : 'auto';
  const detailTrim = typeof topicDetail === 'string' ? topicDetail.trim() : '';
  if (kind === 'custom' && !detailTrim) {
    const e = new Error('Custom topic requires a description');
    e.status = 400;
    throw e;
  }
  return {
    topicKind: kind,
    topicDetail: kind === 'auto' ? '' : detailTrim,
  };
}

async function createSession({ title, hostId, isPractice = false, topicKind, topicDetail }) {
  const practice = Boolean(isPractice);
  if (!practice && (!title || typeof title !== 'string' || !title.trim())) {
    const e = new Error('title is required');
    e.status = 400;
    throw e;
  }
  const resolvedTitle = practice
    ? (typeof title === 'string' && title.trim()) || 'Practice with AI'
    : title.trim();

  const topic = practice
    ? { topicKind: 'auto', topicDetail: '' }
    : normalizeTopicForCreate(topicKind, topicDetail);

  const session = await sessionModel.createSession({
    title: resolvedTitle,
    hostId,
    isPractice: practice,
    practiceParticipants: practice ? PRACTICE_AI_PARTICIPANTS : [],
    topicKind: topic.topicKind,
    topicDetail: topic.topicDetail,
  });
  logger.info('Session created', {
    sessionId: session.id,
    hostId,
    isPractice: practice,
    topicKind: topic.topicKind,
  });
  if (!practice) {
    enqueueSessionCreatedSample(session.id).catch((err) => {
      logger.warn('[session] queue enqueue skipped', { err: err?.message || String(err) });
    });
  }
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

/**
 * Participant leaves the room (removed from participants). Host leaving ends the session for everyone.
 */
async function leaveSession({ sessionId, userId }) {
  const existing = await sessionModel.findById(sessionId);
  if (!existing) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  if (existing.status !== 'active') {
    const e = new Error('This session has already ended');
    e.status = 400;
    throw e;
  }
  if (!existing.participants.includes(userId)) {
    const e = new Error('You are not a member of this session');
    e.status = 403;
    throw e;
  }
  if (existing.hostId === userId) {
    return endSession({ sessionId, userId });
  }
  const updated = await sessionModel.removeParticipant(sessionId, userId);
  if (!updated) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  logger.info('User left session', { sessionId: String(sessionId), userId });
  return updated;
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
/**
 * @returns {Promise<Array<{ sessionId: string, title: string, date: string, score: number | null, feedback: string | null }>>}
 */
async function listHistoryForUser({ userId }) {
  const raw = await sessionModel.listEndedSessionsForUser(userId);
  return raw
    .map((doc) => sessionModel.mapSession(doc))
    .filter((m) => m && m.status === 'ended')
    .map((m) => ({
      sessionId: m.id,
      title: m.title,
      date: m.createdAt,
      score: m.evaluation && typeof m.evaluation.score === 'number' ? m.evaluation.score : null,
      feedback:
        m.evaluation && typeof m.evaluation.feedback === 'string' ? m.evaluation.feedback : null,
    }));
}

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
  leaveSession,
  endSession,
  generateEvaluation,
  assertActiveParticipant,
  getSessionForUser,
  getSessionDebug,
  listHistoryForUser,
  listSessionMessages,
  appendSessionMessage,
  appendAIModeratorMessage,
};

const sessionModel = require('../models/session.model');
const messageModel = require('../models/message.model');
const evaluationPersistence = require('./evaluationPersistence.service');
const { enqueueSessionCreatedSample } = require('../queue/discussion.queue');
const logger = require('../utils/logger');
const aiEvaluationService = require('./aiEvaluation.service');
const { assertSessionTitleLength, assertTopicDetailLength } = require('../utils/inputLimits');

/**
 * Back-compat wrapper; prefer `aiEvaluationService.generateEvaluation(sessionData)` for new code.
 * @returns {{ score: number, strengths: string, improvements: string, metrics: Record<string, number>, isGenerated: boolean }}
 */
function generateEvaluation() {
  return aiEvaluationService.generateEvaluation({});
}

function emitSessionEvaluated(sessionId, evaluations) {
  try {
    const { getIo } = require('../sockets/socket');
    const io = getIo();
    if (io) {
      io.to(String(sessionId)).emit('session_evaluated', {
        sessionId: String(sessionId),
        evaluations,
      });
    }
  } catch (err) {
    logger.warn('session_evaluated emit skipped', err?.message || err);
  }
}

/**
 * Simulated group members for practice mode (no sockets, not in `participants`).
 * IDs are stable strings; display names match AI_1 … AI_3.
 */
const PRACTICE_BOT_TEMPLATES = [
  { id: 'practice-ai-1', displayName: 'AI_1' },
  { id: 'practice-ai-2', displayName: 'AI_2' },
  { id: 'practice-ai-3', displayName: 'AI_3' },
];

/** Pick 2 or 3 dummy AI participants for a solo practice room. */
function pickPracticeBotRoster() {
  const n = 2 + Math.floor(Math.random() * 2);
  return PRACTICE_BOT_TEMPLATES.slice(0, n);
}

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
  if (detailTrim) {
    assertTopicDetailLength(detailTrim);
  }
  return {
    topicKind: kind,
    topicDetail: kind === 'auto' ? '' : detailTrim,
  };
}

/**
 * Parse `topic` (unified) and/or legacy `topicKind` + `topicDetail` from create body.
 * `topic` may be: preset slug string, free-form string (→ custom), or `{ preset, detail? }` / `{ custom }`.
 */
function parseTopicFromCreateBody(body = {}) {
  const t = body.topic;
  if (t != null && typeof t === 'object' && !Array.isArray(t)) {
    if (typeof t.custom === 'string' && t.custom.trim()) {
      return normalizeTopicForCreate('custom', t.custom);
    }
    const preset = typeof t.preset === 'string' ? t.preset.toLowerCase().trim() : '';
    if (TOPIC_KINDS.includes(preset)) {
      const detail = typeof t.detail === 'string' ? t.detail : '';
      return normalizeTopicForCreate(preset, detail);
    }
  }
  if (typeof t === 'string' && t.trim()) {
    const raw = t.trim();
    const lower = raw.toLowerCase();
    if (TOPIC_KINDS.includes(lower)) {
      if (lower === 'custom') {
        const detail =
          (typeof body.topicDetail === 'string' ? body.topicDetail : '') ||
          (typeof body.customTopic === 'string' ? body.customTopic : '');
        return normalizeTopicForCreate('custom', detail);
      }
      const detail = typeof body.topicDetail === 'string' ? body.topicDetail : '';
      return normalizeTopicForCreate(lower, detail);
    }
    return normalizeTopicForCreate('custom', raw);
  }
  return normalizeTopicForCreate(body.topicKind, body.topicDetail);
}

async function createSession({
  title,
  hostId,
  isPractice = false,
  topic,
  topicKind,
  topicDetail,
  customTopic,
}) {
  const practice = Boolean(isPractice);
  if (!practice && (!title || typeof title !== 'string' || !title.trim())) {
    const e = new Error('title is required');
    e.status = 400;
    throw e;
  }
  const resolvedTitle = practice
    ? (typeof title === 'string' && title.trim()) || 'Practice with AI'
    : title.trim();

  if (!practice) {
    assertSessionTitleLength(resolvedTitle);
  }

  const topicNorm = practice
    ? { topicKind: 'auto', topicDetail: '' }
    : parseTopicFromCreateBody({ topic, topicKind, topicDetail, customTopic });

  const practiceBots = practice ? pickPracticeBotRoster() : [];

  const session = await sessionModel.createSession({
    title: resolvedTitle,
    hostId,
    isPractice: practice,
    practiceParticipants: practiceBots,
    topicKind: topicNorm.topicKind,
    topicDetail: topicNorm.topicDetail,
  });
  logger.info('Session created', {
    sessionId: session.id,
    hostId,
    isPractice: practice,
    topicKind: topicNorm.topicKind,
    topic: session.topic,
    practiceBots: practice ? practiceBots.map((b) => b.displayName) : undefined,
  });
  if (practice) {
    // Optional future hook: timed / heuristic replies from practice bots (see practiceSimulation.placeholder.js).
    const { simulatePracticeResponsesPlaceholder } = require('./practiceSimulation.placeholder');
    simulatePracticeResponsesPlaceholder({ sessionId: session.id }).catch(() => {});
  }
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
  const senderName = typeof senderEmail === 'string' ? senderEmail : '';
  const saved = await messageModel.append({
    sessionId,
    senderId: userId,
    senderName,
    content: trimmed,
    type: 'user',
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
    senderId: AI_MODERATOR_USER_ID,
    senderName: 'AI Moderator',
    content: text,
    type: 'ai',
  });
}

/**
 * System line persisted for conversation logs (join/leave, etc.).
 */
async function appendSystemMessage({ sessionId, content }) {
  const session = await sessionModel.findById(sessionId);
  if (!session || session.status !== 'active') {
    return null;
  }
  return messageModel.append({
    sessionId,
    senderId: 'system',
    senderName: 'Session',
    content,
    type: 'system',
  });
}

function emitRoomMessage(sessionId, payload) {
  try {
    const { getIo } = require('../sockets/socket');
    const io = getIo();
    if (io && payload) {
      io.to(String(sessionId)).emit('receive_message', payload);
    }
  } catch (err) {
    logger.warn('receive_message emit skipped', err?.message || err);
  }
}

/**
 * Participant leaves the room (removed from participants). Host leaving ends the session for everyone.
 */
async function leaveSession({ sessionId, userId, leaverLabel = 'Someone' }) {
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
    const { session } = await endSession({ sessionId, userId });
    return session;
  }
  const updated = await sessionModel.removeParticipant(sessionId, userId);
  if (!updated) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }
  logger.info('User left session', { sessionId: String(sessionId), userId });
  const label = typeof leaverLabel === 'string' && leaverLabel.trim() ? leaverLabel.trim() : 'Someone';
  try {
    const saved = await appendSystemMessage({
      sessionId,
      content: `${label} left the session`,
    });
    if (saved) {
      emitRoomMessage(sessionId, saved);
      try {
        const { getIo } = require('../sockets/socket');
        const io = getIo();
        if (io) {
          io.to(String(sessionId)).emit('user_left', { userId, name: label });
        }
      } catch (_) {
        /* ignore */
      }
    }
  } catch (err) {
    logger.warn('leave system message skipped', err?.message || err);
  }
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
  const participantIds = [...new Set(existing.participants)];

  const updated = await sessionModel.endSession(sessionId);
  if (!updated) {
    const e = new Error('Session not found');
    e.status = 404;
    throw e;
  }

  let evaluations = [];
  try {
    evaluations = await evaluationPersistence.persistEvaluationsForParticipants(
      sessionId,
      participantIds,
    );
  } catch (err) {
    logger.warn('evaluation persist failed', { err: err?.message || String(err) });
  }

  logger.info('Session ended', { sessionId: String(sessionId), userId });
  logger.info('Evaluations generated', {
    sessionId: String(sessionId),
    count: evaluations.length,
  });
  emitSessionEvaluated(sessionId, evaluations);
  return { session: updated, evaluations };
}

/**
 * Read-only session snapshot for debugging (host or participant only).
 */
/**
 * @returns {Promise<Array<{ sessionId: string, title: string, date: string, evaluation: { score: number, strengths: string, improvements: string, metrics: Record<string, number>, isGenerated: boolean } | null }>>}
 */
async function listHistoryForUser({ userId }) {
  const raw = await sessionModel.listEndedSessionsForUser(userId);
  const mapped = raw
    .map((doc) => sessionModel.mapSession(doc))
    .filter((m) => m && m.status === 'ended');

  const out = [];
  for (const m of mapped) {
    let evaluation = await evaluationPersistence.findEvaluationForUser(m.id, userId);
    if (!evaluation && m.evaluation && typeof m.evaluation.score === 'number') {
      evaluation = m.evaluation;
    }
    out.push({
      sessionId: m.id,
      title: m.title,
      date: m.createdAt,
      evaluation,
    });
  }
  return out;
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
  appendSystemMessage,
};

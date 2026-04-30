const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const { getSocketCorsOrigin } = require('../config/corsOrigins');
const logger = require('../utils/logger');
const { generateModeratorResponse } = require('../services/ai.service');
const sessionService = require('../services/session.service');
const messageModel = require('../models/message.model');

let ioRef;

/**
 * Run OpenAI in the background so the `send_message` handler returns after the user message
 * is persisted and broadcast, without waiting for the API.
 * @param {import('socket.io').Server} io
 */
function runAiModeration(io, sessionId, userText) {
  (async () => {
    try {
      const reply = await generateModeratorResponse([{ role: 'user', content: userText }]);
      if (!reply) return;
      const saved = await sessionService.appendAIModeratorMessage({ sessionId, text: reply });
      io.to(String(sessionId)).emit('receive_message', saved);
    } catch (err) {
      logger.error('AI moderation failed', err);
    }
  })();
}

function getIo() {
  return ioRef;
}

/**
 * @param {{ email?: string }} user
 * @param {object | null | undefined} payload
 */
function pickDisplayName(user, payload) {
  const fromClient =
    payload && typeof payload.displayName === 'string' ? payload.displayName.trim() : '';
  if (fromClient) return fromClient.slice(0, 80);
  const email = user?.email || '';
  const local = email.split('@')[0];
  return local || 'Member';
}

/**
 * JWT required on connect (auth.token from client, or query.token).
 * join_room / send_message require active session membership.
 * Messages are persisted then broadcast with stable id for dedup.
 */
function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: getSocketCorsOrigin(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  ioRef = io;

  io.use((socket, next) => {
    const raw =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (socket.handshake.headers.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : null);
    if (!raw) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const payload = verifyToken(String(raw));
      socket.user = { id: payload.sub, email: payload.email };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (!socket.data.trackedSessions) {
      socket.data.trackedSessions = new Set();
    }

    socket.on('disconnect', () => {
      const tracked = socket.data.trackedSessions;
      if (!tracked || tracked.size === 0 || !socket.user) return;
      const name = pickDisplayName(socket.user, null);
      const { id: userId } = socket.user;
      const roomCount = tracked.size;
      const sids = [...tracked];
      tracked.clear();
      (async () => {
        for (const sid of sids) {
          socket.to(String(sid)).emit('user_left', { userId, name });
          try {
            const saved = await sessionService.appendSystemMessage({
              sessionId: sid,
              content: `${name} left the session`,
            });
            if (saved) {
              io.to(String(sid)).emit('receive_message', saved);
            }
          } catch (err) {
            logger.warn('persist disconnect message failed', err?.message || err);
          }
        }
      })();
      logger.info('Socket disconnected', { userId, roomsNotified: roomCount });
    });

    socket.on('join_room', async (payload) => {
      const rawId = payload && typeof payload === 'object' ? payload.sessionId : null;
      const sessionId = rawId != null ? String(rawId).trim() : '';
      if (!sessionId) {
        socket.emit('room_error', {
          sessionId: '',
          message: 'sessionId is required',
          status: 400,
        });
        return;
      }
      try {
        await sessionService.assertActiveParticipant(sessionId, socket.user.id);
        const tracked = socket.data.trackedSessions;
        const alreadyAnnounced = tracked.has(sessionId);
        await socket.join(String(sessionId));
        if (!alreadyAnnounced) {
          tracked.add(sessionId);
          const name = pickDisplayName(socket.user, payload);
          io.to(String(sessionId)).emit('user_joined', {
            userId: socket.user.id,
            name,
          });
          try {
            const saved = await sessionService.appendSystemMessage({
              sessionId,
              content: `${name} joined the session`,
            });
            if (saved) {
              io.to(String(sessionId)).emit('receive_message', saved);
            }
          } catch (err) {
            logger.warn('persist join message failed', err?.message || err);
          }
        }
        logger.info('Socket room joined', { sessionId: String(sessionId), userId: socket.user.id });
      } catch (err) {
        socket.emit('room_error', {
          sessionId: String(sessionId),
          message: err.message || 'Could not join room',
          status: err.status || 400,
        });
      }
    });

    socket.on('mark_key_point', async (payload) => {
      const sessionId = payload?.sessionId != null ? String(payload.sessionId).trim() : '';
      const messageId = payload?.messageId != null ? String(payload.messageId).trim() : '';
      if (!sessionId || !messageId || !socket.user) return;
      try {
        await sessionService.assertActiveParticipant(sessionId, socket.user.id);
        const value = payload?.value !== false;
        const updated = await messageModel.setKeyPoint({ sessionId, messageId, value });
        if (updated) {
          io.to(String(sessionId)).emit('message_patch', {
            messageId: updated.id,
            isKeyPoint: updated.isKeyPoint,
            reactions: updated.reactions,
          });
        }
      } catch (err) {
        socket.emit('room_error', {
          sessionId: String(sessionId),
          message: err.message || 'Could not update message',
          status: err.status || 400,
        });
      }
    });

    socket.on('message_reaction', async (payload) => {
      const sessionId = payload?.sessionId != null ? String(payload.sessionId).trim() : '';
      const messageId = payload?.messageId != null ? String(payload.messageId).trim() : '';
      const kind = payload?.kind === 'disagree' ? 'disagree' : 'agree';
      if (!sessionId || !messageId || !socket.user) return;
      try {
        await sessionService.assertActiveParticipant(sessionId, socket.user.id);
        const updated = await messageModel.addReaction({ sessionId, messageId, kind });
        if (updated) {
          io.to(String(sessionId)).emit('message_patch', {
            messageId: updated.id,
            isKeyPoint: updated.isKeyPoint,
            reactions: updated.reactions,
          });
        }
      } catch (err) {
        socket.emit('room_error', {
          sessionId: String(sessionId),
          message: err.message || 'Could not add reaction',
          status: err.status || 400,
        });
      }
    });

    socket.on('typing', (payload) => {
      const sessionId = payload?.sessionId != null ? String(payload.sessionId).trim() : '';
      if (!sessionId || !socket.user) return;
      const tracked = socket.data.trackedSessions;
      if (!tracked || !tracked.has(sessionId)) return;
      const displayName = pickDisplayName(socket.user, payload);
      socket.to(String(sessionId)).emit('participant_typing', {
        userId: socket.user.id,
        displayName,
      });
    });

    socket.on('send_message', async (payload) => {
      const sessionId = payload?.sessionId != null ? String(payload.sessionId).trim() : '';
      const text = payload?.text;
      if (!sessionId || text == null) {
        socket.emit('room_error', {
          sessionId: sessionId || '',
          message: 'sessionId and text are required',
          status: 400,
        });
        return;
      }
      const trimmed = String(text).trim();
      if (!trimmed) {
        socket.emit('room_error', {
          sessionId: String(sessionId),
          message: 'Message text cannot be empty',
          status: 400,
        });
        return;
      }
      try {
        const saved = await sessionService.appendSessionMessage({
          sessionId,
          userId: socket.user.id,
          senderEmail: socket.user.email,
          text: trimmed,
        });
        io.to(String(sessionId)).emit('receive_message', saved);
        if (trimmed.length > 20) {
          runAiModeration(io, String(sessionId), trimmed);
        }
      } catch (err) {
        socket.emit('room_error', {
          sessionId: String(sessionId),
          message: err.message || 'Could not send message',
          status: err.status || 400,
        });
      }
    });
  });

  return io;
}

module.exports = { attachSocket, getIo };

const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const { getSocketCorsOrigin } = require('../config/corsOrigins');
const logger = require('../utils/logger');
const { generateModeratorResponse } = require('../services/ai.service');
const sessionService = require('../services/session.service');

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
      for (const sid of tracked) {
        socket.to(String(sid)).emit('user_left', { userId, name });
      }
      tracked.clear();
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

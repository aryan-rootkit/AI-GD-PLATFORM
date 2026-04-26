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
    socket.on('join_room', async (payload) => {
      const sessionId = payload && typeof payload === 'object' ? payload.sessionId : null;
      if (!sessionId) return;
      try {
        await sessionService.assertActiveParticipant(sessionId, socket.user.id);
        await socket.join(String(sessionId));
      } catch (err) {
        socket.emit('room_error', {
          sessionId: String(sessionId),
          message: err.message,
          status: err.status || 400,
        });
      }
    });

    socket.on('send_message', async (payload) => {
      const sessionId = payload?.sessionId;
      const text = payload?.text;
      if (!sessionId || text == null) return;
      try {
        const saved = await sessionService.appendSessionMessage({
          sessionId,
          userId: socket.user.id,
          senderEmail: socket.user.email,
          text: String(text),
        });
        io.to(String(sessionId)).emit('receive_message', saved);
        if (String(text).length > 20) {
          runAiModeration(io, String(sessionId), String(text));
        }
      } catch (err) {
        socket.emit('room_error', {
          sessionId: String(sessionId),
          message: err.message,
          status: err.status || 400,
        });
      }
    });
  });

  return io;
}

module.exports = { attachSocket, getIo };

const { Router } = require('express');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const authRoutes = require('./auth.routes');
const sessionRoutes = require('./session.routes');
const messagesRoutes = require('./messages.routes');
const evaluationsRoutes = require('./evaluations.routes');
const sessionsRoutes = require('./sessions.routes');
const userRoutes = require('./user.routes');
const debugRoutes = require('./debug.routes');

const router = Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/debug', debugRoutes);
router.use('/user', userRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/messages', messagesRoutes);
router.use('/evaluations', evaluationsRoutes);
router.use('/session', sessionRoutes);

router.use((_req, res) => {
  sendError(res, 404, 'Resource not found');
});

module.exports = router;

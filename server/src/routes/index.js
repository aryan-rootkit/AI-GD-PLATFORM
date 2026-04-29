const { Router } = require('express');
const authRoutes = require('./auth.routes');
const sessionRoutes = require('./session.routes');
const sessionsRoutes = require('./sessions.routes');
const userRoutes = require('./user.routes');
const debugRoutes = require('./debug.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);
router.use('/debug', debugRoutes);
router.use('/user', userRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/session', sessionRoutes);

router.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

module.exports = router;

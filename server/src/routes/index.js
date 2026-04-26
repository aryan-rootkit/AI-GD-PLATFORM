const { Router } = require('express');
const authRoutes = require('./auth.routes');
const sessionRoutes = require('./session.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);
router.use('/session', sessionRoutes);

module.exports = router;

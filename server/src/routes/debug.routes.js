const { Router } = require('express');
const debugController = require('../controllers/debug.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.get('/session/:sessionId', authMiddleware, debugController.getSession);

module.exports = router;

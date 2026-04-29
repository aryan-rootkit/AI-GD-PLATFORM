const { Router } = require('express');
const messagesController = require('../controllers/messages.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.get('/:sessionId', authMiddleware, messagesController.listBySession);

module.exports = router;

const { Router } = require('express');
const sessionController = require('../controllers/session.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.post('/create', authMiddleware, sessionController.create);
router.post('/join/:sessionId', authMiddleware, sessionController.join);
router.post('/end/:sessionId', authMiddleware, sessionController.end);
router.get('/:sessionId/messages', authMiddleware, sessionController.listMessages);
router.get('/:sessionId', authMiddleware, sessionController.getOne);

module.exports = router;

const { Router } = require('express');
const sessionsController = require('../controllers/sessions.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.get('/history', authMiddleware, sessionsController.history);

module.exports = router;

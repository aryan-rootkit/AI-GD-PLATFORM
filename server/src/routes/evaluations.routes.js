const { Router } = require('express');
const evaluationsController = require('../controllers/evaluations.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.get('/user/:userId', authMiddleware, evaluationsController.listForUser);

module.exports = router;

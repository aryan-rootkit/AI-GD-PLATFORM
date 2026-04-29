const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.get('/activity', authMiddleware, userController.getActivity);

module.exports = router;

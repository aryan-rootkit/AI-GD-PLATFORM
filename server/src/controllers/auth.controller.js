const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');

async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };

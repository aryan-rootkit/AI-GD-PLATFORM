const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');

async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body);
    sendSuccess(res, result, { message: 'Account created', status: 201 });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, { message: 'Signed in', status: 200 });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };

const sessionService = require('../services/session.service');
const { sendSuccess } = require('../utils/apiResponse');

async function history(req, res, next) {
  try {
    const items = await sessionService.listHistoryForUser({ userId: req.user.id });
    sendSuccess(res, items, { message: 'OK', status: 200 });
  } catch (err) {
    next(err);
  }
}

module.exports = { history };

const sessionService = require('../services/session.service');
const { sendSuccess } = require('../utils/apiResponse');

async function listBySession(req, res, next) {
  try {
    const messages = await sessionService.listSessionMessages({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });
    sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
}

module.exports = { listBySession };

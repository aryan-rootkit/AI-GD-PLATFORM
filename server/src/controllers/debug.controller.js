const sessionService = require('../services/session.service');
const { sendSuccess } = require('../utils/apiResponse');

async function getSession(req, res, next) {
  try {
    const detail = await sessionService.getSessionDebug({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });
    sendSuccess(res, detail, { message: 'Session details', status: 200 });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSession };

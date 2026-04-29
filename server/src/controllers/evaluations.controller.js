const evaluationsService = require('../services/evaluations.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

async function listForUser(req, res, next) {
  try {
    const { userId } = req.params;
    if (String(userId) !== String(req.user.id)) {
      sendError(res, 403, 'You can only access your own evaluations');
      return;
    }
    const rawInc = req.query.includeSession;
    const includeSession = rawInc !== '0' && rawInc !== 'false';
    const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
    const items = await evaluationsService.listUserEvaluationHistory(req.user.id, {
      limit,
      includeSession,
    });
    sendSuccess(res, items);
  } catch (err) {
    next(err);
  }
}

module.exports = { listForUser };

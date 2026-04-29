const { sendSuccess } = require('../utils/apiResponse');

/**
 * User activity stats. Extend with DB aggregates when session history is persisted.
 */
function getActivity(_req, res) {
  sendSuccess(res, {
    sessionsParticipated: 0,
    lastSessionScore: null,
    activeSession: false,
  });
}

module.exports = { getActivity };

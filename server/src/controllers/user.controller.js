/**
 * User activity stats. Extend with DB aggregates when session history is persisted.
 */
function getActivity(_req, res) {
  res.json({
    success: true,
    data: {
      sessionsParticipated: 0,
      lastSessionScore: null,
      activeSession: false,
    },
  });
}

module.exports = { getActivity };

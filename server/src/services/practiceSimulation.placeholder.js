/**
 * Placeholder for future practice-mode behaviour: faux group replies without real Socket.IO
 * clients for `practice-ai-*` participants (e.g. subscribe to `appendSessionMessage` or a queue).
 *
 * @param {{ sessionId: string }} _ctx
 * @returns {Promise<void>}
 */
async function simulatePracticeResponsesPlaceholder(_ctx) {
  await Promise.resolve();
}

module.exports = { simulatePracticeResponsesPlaceholder };

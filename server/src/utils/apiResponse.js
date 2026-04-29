/**
 * Standard JSON envelopes for API routes.
 * Success: { success: true, data }
 * Error:   { success: false, message }
 *
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {number} [status=200]
 */
function sendSuccess(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

/**
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} message
 */
function sendError(res, status, message) {
  res.status(status).json({ success: false, message });
}

module.exports = { sendSuccess, sendError };

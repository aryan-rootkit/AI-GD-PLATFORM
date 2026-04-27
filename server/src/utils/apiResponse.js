/**
 * Standard success envelope for JSON APIs.
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {{ message?: string, status?: number }} [opts]
 */
function sendSuccess(res, data, opts = {}) {
  const { message = 'OK', status = 200 } = opts;
  res.status(status).json({ success: true, message, data });
}

module.exports = { sendSuccess };

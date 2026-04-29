const { sendError } = require('../utils/apiResponse');

function errorMiddleware(err, _req, res, _next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    sendError(res, 400, 'Invalid JSON in request body');
    return;
  }

  const status = err.status || 500;
  const message = status >= 500 ? 'Internal Server Error' : err.message || 'Request failed';
  if (status >= 500) {
    console.error(err);
  }
  sendError(res, status, message);
}

module.exports = { errorMiddleware };

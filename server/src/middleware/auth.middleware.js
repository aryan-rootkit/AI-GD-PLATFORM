const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/apiResponse');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    sendError(res, 401, 'Authentication required');
    return;
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    sendError(res, 401, 'Authentication required');
    return;
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    sendError(res, 401, 'Invalid or expired token');
  }
}

module.exports = { authMiddleware };

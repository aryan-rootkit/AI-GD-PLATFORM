const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || 'dev-insecure-change-me';
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, getSecret(), { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { signToken, verifyToken, getSecret };

const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;
const MAX_PASSWORD_LENGTH = 128;

function validateSignup({ name, email, password }) {
  if (!name || typeof name !== 'string') {
    const e = new Error('name is required');
    e.status = 400;
    throw e;
  }
  if (!email || !String(email).includes('@')) {
    const e = new Error('valid email is required');
    e.status = 400;
    throw e;
  }
  if (!password || String(password).length < 6) {
    const e = new Error('password must be at least 6 characters');
    e.status = 400;
    throw e;
  }
  if (String(password).length > MAX_PASSWORD_LENGTH) {
    const e = new Error(`password must be at most ${MAX_PASSWORD_LENGTH} characters`);
    e.status = 400;
    throw e;
  }
}

async function signup({ name, email, password }) {
  validateSignup({ name, email, password });
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const e = new Error('email already registered');
    e.status = 409;
    throw e;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.createUser({ name: name.trim(), email, passwordHash });
  if (!user) {
    const e = new Error('could not create user');
    e.status = 400;
    throw e;
  }
  return { user };
}

async function login({ email, password }) {
  if (!email || !password) {
    const e = new Error('email and password are required');
    e.status = 400;
    throw e;
  }
  if (String(password).length > MAX_PASSWORD_LENGTH) {
    const e = new Error(`password must be at most ${MAX_PASSWORD_LENGTH} characters`);
    e.status = 400;
    throw e;
  }
  const user = await userModel.findByEmail(email);
  if (!user) {
    const e = new Error('invalid credentials');
    e.status = 401;
    throw e;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const e = new Error('invalid credentials');
    e.status = 401;
    throw e;
  }
  const token = signToken({ id: user.id, email: user.email });
  return {
    token,
    user: userModel.toPublic(user),
  };
}

module.exports = { signup, login };

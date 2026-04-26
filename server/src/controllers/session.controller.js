const sessionService = require('../services/session.service');

async function create(req, res, next) {
  try {
    const session = await sessionService.createSession({
      title: req.body.title,
      hostId: req.user.id,
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

async function join(req, res, next) {
  try {
    const session = await sessionService.joinSession({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function end(req, res, next) {
  try {
    const session = await sessionService.endSession({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const session = await sessionService.getSessionForUser({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function listMessages(req, res, next) {
  try {
    const messages = await sessionService.listSessionMessages({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, join, end, getOne, listMessages };

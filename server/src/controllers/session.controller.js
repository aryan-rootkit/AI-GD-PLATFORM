const sessionService = require('../services/session.service');
const { sendSuccess } = require('../utils/apiResponse');

async function create(req, res, next) {
  try {
    const raw = req.body && req.body.isPractice;
    const isPractice = raw === true || raw === 'true' || raw === 1 || raw === '1';
    const session = await sessionService.createSession({
      title: req.body.title,
      hostId: req.user.id,
      isPractice,
      topic: req.body.topic,
      topicKind: req.body.topicKind,
      topicDetail: req.body.topicDetail,
      customTopic: req.body.customTopic,
    });
    sendSuccess(res, session, 201);
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
    sendSuccess(res, session);
  } catch (err) {
    next(err);
  }
}

async function leave(req, res, next) {
  try {
    const email = req.user.email || '';
    const leaverLabel = email.includes('@') ? email.split('@')[0] : email || 'Someone';
    const session = await sessionService.leaveSession({
      sessionId: req.params.sessionId,
      userId: req.user.id,
      leaverLabel,
    });
    sendSuccess(res, session);
  } catch (err) {
    next(err);
  }
}

async function end(req, res, next) {
  try {
    const { session, evaluations } = await sessionService.endSession({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });
    sendSuccess(
      res,
      {
        status: session.status,
        evaluations,
      },
      { message: 'Session ended', status: 200 },
    );
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
    sendSuccess(res, session);
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
    sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, join, leave, end, getOne, listMessages };

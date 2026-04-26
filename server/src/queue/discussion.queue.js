const { Queue } = require('bullmq');
const { getRedisConnection } = require('../config/env');
const { DISCUSSION_QUEUE, JOB_SAMPLE } = require('../config/constants');

let discussionQueue;

function getDiscussionQueue() {
  if (!discussionQueue) {
    discussionQueue = new Queue(DISCUSSION_QUEUE, {
      connection: getRedisConnection(),
    });
  }
  return discussionQueue;
}

/** Sample job when a session is created (no heavy processing). */
async function enqueueSessionCreatedSample(sessionId) {
  return getDiscussionQueue().add(
    JOB_SAMPLE,
    { sessionId, type: 'session_created' },
    { removeOnComplete: 100 },
  );
}

module.exports = { getDiscussionQueue, enqueueSessionCreatedSample };

/** Enqueue a sample job on discussionQueue (Redis + worker required). */
require('../src/config/env');
const { getDiscussionQueue } = require('../src/queue/discussion.queue');
const { JOB_SAMPLE } = require('../src/config/constants');

getDiscussionQueue()
  .add(JOB_SAMPLE, { ping: true }, { removeOnComplete: 50 })
  .then(() => {
    console.log('Sample job enqueued on discussionQueue.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

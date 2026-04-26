/**
 * Run separately: npm run worker
 * Processes jobs from discussionQueue (Redis required).
 */
require('../config/env');

const { Worker } = require('bullmq');
const { getRedisConnection } = require('../config/env');
const { DISCUSSION_QUEUE } = require('../config/constants');
const logger = require('../utils/logger');

async function processJob(job) {
  logger.info('discussionQueue job', job.name, job.id, job.data);
  return { ok: true };
}

const worker = new Worker(DISCUSSION_QUEUE, processJob, {
  connection: getRedisConnection(),
});

worker.on('completed', (job) => {
  logger.info('completed', job.id);
});

worker.on('failed', (job, err) => {
  logger.error('failed', job?.id, err);
});

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
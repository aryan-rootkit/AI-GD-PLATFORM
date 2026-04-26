require('./src/config/env');

const http = require('http');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

async function start() {
  await connectDB();

  const app = require('./src/app');
  const { attachSocket } = require('./src/sockets/socket');

  const port = Number(process.env.PORT) || 3000;
  const server = http.createServer(app);

  attachSocket(server);

  server.listen(port, () => {
    logger.info(`listening on ${port}`);
  });
}

start().catch((err) => {
  logger.error('Server failed to start', err);
  process.exit(1);
});

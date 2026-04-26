require('./src/config/env');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const http = require('http');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

async function start() {
  await connectDB();

  const app = require('./src/app');
  const { attachSocket } = require('./src/sockets/socket');

  const PORT = Number(process.env.PORT) || 10000;
  const server = http.createServer(app);

  attachSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    logger.info(`listening on ${PORT}`);
  });
}

start().catch((err) => {
  logger.error('Server failed to start', err);
  process.exit(1);
});

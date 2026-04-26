require('./config/env');

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { getAllowedOrigins } = require('./config/corsOrigins');

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = getAllowedOrigins();
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get('/test-db', async (_req, res) => {
  res.send('DB connected if no crash 🚀');
});

app.use(routes);

module.exports = app;

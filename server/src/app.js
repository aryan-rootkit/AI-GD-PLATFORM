require('./config/env');

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { corsOriginHandler } = require('./config/corsOrigins');

const app = express();

app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/test-db', async (_req, res) => {
  res.send('DB connected if no crash 🚀');
});

app.use('/api', routes);

module.exports = app;

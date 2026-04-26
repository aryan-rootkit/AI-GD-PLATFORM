require('./config/env');

const express = require('express');
const routes = require('./routes');
const { createCorsMiddleware } = require('./middleware/cors.middleware');

const app = express();

app.use(createCorsMiddleware());
app.use(express.json());

app.get('/test-db', async (_req, res) => {
  res.send('DB connected if no crash 🚀');
});

app.use(routes);

module.exports = app;

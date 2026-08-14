'use strict';

const express = require('express');
const crypto = require('crypto');

const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const { stats } = require('./db/pool');
const log = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Attach a trace id to every request so logs can be correlated.
app.use((req, res, next) => {
  req.traceId = req.get('x-trace-id') || crypto.randomBytes(16).toString('hex');
  req.spanId = crypto.randomBytes(8).toString('hex');
  req.startedAt = Date.now();

  res.on('finish', () => {
    log.info('http.request', {
      trace_id: req.traceId,
      span_id: req.spanId,
      http: {
        method: req.method,
        path: req.route ? req.baseUrl + req.route.path : req.path,
        status: res.statusCode,
        duration_ms: Date.now() - req.startedAt,
      },
    });
  });

  next();
});

app.get('/healthz', (req, res) => res.json({ ok: true, pool: stats() }));

app.use('/api', checkoutRoutes);
app.use('/api', orderRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  log.error(err.message, {
    trace_id: req.traceId,
    span_id: req.spanId,
    error: {
      type: err.name,
      message: err.message,
      stack: err.stack,
    },
    http: {
      method: req.method,
      path: req.path,
      status: 500,
      duration_ms: Date.now() - req.startedAt,
    },
  });

  res.status(500).json({ error: 'internal_error', trace_id: req.traceId });
});

app.listen(PORT, () => log.info('server.started', { port: PORT }));

module.exports = app;

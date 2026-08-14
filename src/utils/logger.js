'use strict';

const os = require('os');

const SERVICE = process.env.SERVICE_NAME || 'checkout-api';
const ENV = process.env.NODE_ENV || 'production';

function emit(level, message, fields = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE,
    env: ENV,
    message,
    host: os.hostname(),
    ...fields,
  };
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

module.exports = {
  debug: (msg, fields) => emit('DEBUG', msg, fields),
  info: (msg, fields) => emit('INFO', msg, fields),
  warn: (msg, fields) => emit('WARN', msg, fields),
  error: (msg, fields) => emit('ERROR', msg, fields),
};

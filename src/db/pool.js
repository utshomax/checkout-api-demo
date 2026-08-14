'use strict';

const { Pool } = require('pg');
const log = require('../utils/logger');

const ACQUIRE_TIMEOUT_MS = 5000;

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
});

let inFlight = 0;

/**
 * Check out a client from the pool. Callers MUST call release() on every
 * path, including error paths, or the client is never returned.
 */
async function acquire() {
  const started = Date.now();

  const timeout = new Promise((_, reject) => {
    setTimeout(
      () => reject(new TimeoutError(`connection acquire timed out after ${ACQUIRE_TIMEOUT_MS}ms`)),
      ACQUIRE_TIMEOUT_MS
    );
  });

  const client = await Promise.race([pool.connect(), timeout]);
  inFlight += 1;

  log.debug('pool.acquire', {
    waited_ms: Date.now() - started,
    in_flight: inFlight,
    max: pool.options.max,
  });

  return client;
}

function release(client) {
  if (!client) return;
  inFlight -= 1;
  client.release();
}

function stats() {
  return { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount, inFlight };
}

module.exports = { pool, acquire, release, stats, TimeoutError, ACQUIRE_TIMEOUT_MS };

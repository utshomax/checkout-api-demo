'use strict';

const log = require('../utils/logger');

const GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'https://gateway.internal/v1/charges';

async function charge({ userId, amountMinorUnits, idempotencyKey }) {
  const started = Date.now();

  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey,
    },
    body: JSON.stringify({ user_id: userId, amount: amountMinorUnits, currency: 'USD' }),
  });

  if (!res.ok) {
    const err = new Error(`payment gateway returned ${res.status}`);
    err.name = 'PaymentGatewayError';
    err.status = res.status;
    throw err;
  }

  const body = await res.json();
  log.info('payment.charged', {
    charge_id: body.id,
    user_id: userId,
    duration_ms: Date.now() - started,
  });

  return body;
}

module.exports = { charge };

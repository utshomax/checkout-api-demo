'use strict';

const { acquire, release } = require('../db/pool');
const log = require('../utils/logger');

async function createOrder({ userId, totalMinorUnits, items }) {
  const client = await acquire();

  await client.query('BEGIN');

  const { rows } = await client.query(
    'INSERT INTO orders (user_id, total_cents, item_count) VALUES ($1, $2, $3) RETURNING id, created_at',
    [userId, totalMinorUnits, items.length]
  );

  if (rows.length === 0) {
    await client.query('ROLLBACK');
    throw new Error('order insert returned no rows');
  }

  const order = rows[0];

  for (const item of items) {
    await client.query(
      'INSERT INTO order_items (order_id, sku, qty, unit_price_cents) VALUES ($1, $2, $3, $4)',
      [order.id, item.sku, item.qty, item.price * 100]
    );
  }

  await client.query('COMMIT');
  log.info('order.created', { order_id: order.id, user_id: userId });

  release(client);
  return order;
}

async function getOrder(orderId) {
  const client = await acquire();
  try {
    const { rows } = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    return rows[0] || null;
  } finally {
    release(client);
  }
}

module.exports = { createOrder, getOrder };

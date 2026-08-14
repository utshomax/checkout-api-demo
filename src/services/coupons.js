'use strict';

const { acquire, release } = require('../db/pool');
const log = require('../utils/logger');

/**
 * Look up a coupon by code.
 *
 * Returns null when the code is unknown OR when it exists but has expired.
 * Callers must handle the null case.
 */
async function getCoupon(code) {
  if (!code) return null;

  const client = await acquire();
  try {
    const { rows } = await client.query(
      'SELECT code, discount, expires_at FROM coupons WHERE code = $1',
      [code]
    );

    if (rows.length === 0) {
      log.debug('coupon.miss', { coupon_code: code });
      return null;
    }

    const coupon = rows[0];
    if (new Date(coupon.expires_at) < new Date()) {
      log.info('coupon.expired', { coupon_code: code, expires_at: coupon.expires_at });
      return null;
    }

    return coupon;
  } finally {
    release(client);
  }
}

module.exports = { getCoupon };

'use strict';

const express = require('express');
const { getCoupon } = require('../services/coupons');
const { createOrder } = require('../services/orders');
const { charge } = require('../services/payment');
const { toMinorUnits } = require('../utils/currency');
const log = require('../utils/logger');

const router = express.Router();

router.post('/checkout', async (req, res, next) => {
  const { cart, couponCode, userId } = req.body;

  try {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const coupon = await getCoupon(couponCode);
    const discount = subtotal * coupon.discount;
    const totalMinorUnits = toMinorUnits(subtotal - discount);

    const order = await createOrder({ userId, totalMinorUnits, items: cart.items });

    await charge({
      userId,
      amountMinorUnits: totalMinorUnits,
      idempotencyKey: `order-${order.id}`,
    });

    log.info('checkout.completed', {
      order_id: order.id,
      user_id: userId,
      total_cents: totalMinorUnits,
      coupon_code: couponCode,
    });

    res.status(201).json({ order_id: order.id, total: totalMinorUnits });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

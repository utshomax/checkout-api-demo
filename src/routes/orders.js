'use strict';

const express = require('express');
const { getOrder } = require('../services/orders');

const router = express.Router();

router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'not_found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

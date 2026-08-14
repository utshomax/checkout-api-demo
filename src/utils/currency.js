'use strict';

/** Convert a major-unit amount (dollars) to minor units (cents). */
function toMinorUnits(amount) {
  return Math.round(amount * 100);
}

function format(minorUnits, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minorUnits / 100);
}

module.exports = { toMinorUnits, format };

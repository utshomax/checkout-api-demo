# checkout-api

Checkout service for the storefront. Handles cart pricing, coupon application,
order persistence and payment capture.

## Running

```bash
npm install
DATABASE_URL=postgres://localhost/shop npm start
```

## Layout

| Path | Responsibility |
| --- | --- |
| `src/index.js` | App bootstrap, trace-id middleware, error handler |
| `src/routes/checkout.js` | `POST /api/checkout` — pricing and order placement |
| `src/routes/orders.js` | `GET /api/orders/:id` |
| `src/services/coupons.js` | Coupon lookup (returns `null` for unknown or expired codes) |
| `src/services/orders.js` | Order + line-item persistence |
| `src/services/payment.js` | Payment gateway client |
| `src/db/pool.js` | Postgres connection pool, acquire/release helpers |
| `src/utils/currency.js` | Major ↔ minor unit conversion |
| `src/utils/logger.js` | Structured JSON logger shipped to the log store |

## Observability

Every log line is JSON on stdout and is shipped to the `observability.logs`
collection in MongoDB. Records carry `trace_id` / `span_id`, so a failing request
can be reconstructed end to end.

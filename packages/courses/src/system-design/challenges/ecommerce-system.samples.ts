import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'ecommerce-pass-reservation',
    label: 'Strong: reservation-based inventory in a relational database',
    expect: 'pass',
    note: 'Correct and complete. Stock is protected by an atomic conditional decrement in a transactional store, reservations expire, the flash sale is handled with a waiting room and per-SKU admission, PSP calls are idempotent with reconciliation, and the capacity math is right and drives decisions.',
    answers: {
      functional:
        'In scope: catalog browse and search, product pages with price and approximate availability, a persistent cart tied to the account, checkout that reserves stock and charges the card through the PSP, flash sales, and order history with status. Abandoned checkouts release their stock automatically. Out of scope: recommendations, third-party sellers, returns and warehouse logistics; we only record a shipped status sent to us by the warehouse system.',
      nonFunctional:
        'Product and search p95 under 200 ms, checkout p99 under 2 s excluding the PSP. 99.95% availability for browse and checkout across three availability zones. Stock and orders need strong consistency: we never sell a unit we do not have. Catalog data and the availability badge on product pages may be up to a few seconds stale. Orders are durable once acknowledged (synchronous replication to a standby before commit) and kept for 7 years.',
      capacity:
        'Reads: 5M DAU x 20 = 100M/day, / 86,400 is about 1,160 RPS on average and about 3,500 RPS at the normal 3x peak. I read the flash sale as 10x the average on top, so roughly 12k extra RPS for 10 minutes; I size the read tier for about 20k RPS. Orders: 500k/day is about 6/s, about 18/s at peak. The flash sale is 200k buyers in 60 s, about 3,300 purchase attempts per second against one SKU, of which only 10k can succeed. Storage: catalog 10M x 10 KB = 100 GB, images 10M x 5 x 500 KB = 25 TB in object storage. An order with 3 lines is about 2.5 KB, so 1.25 GB/day, about 460 GB/year and about 3.2 TB over 7 years. Conclusion: total volume is modest for one relational cluster; the hard part is 3,300 writes/s contending on one row.',
      api: 'GET /products/{id}, GET /search?q=&cursor= (cursor pagination). PUT /cart/items/{sku} {quantity}, DELETE /cart/items/{sku}, GET /cart. POST /checkout with an Idempotency-Key header: reserves stock, creates an order in PENDING_PAYMENT and returns {orderId, reservationExpiresAt, pspClientSecret}; 409 OUT_OF_STOCK if any line cannot be reserved. POST /psp/webhook (signed) receives payment results. GET /orders?cursor=, GET /orders/{id}. Flash sale: POST /sales/{saleId}/enter returns a queue token; checkout for a sale SKU requires an admitted token.',
      database:
        'PostgreSQL (any relational database with transactions works) for inventory, reservations and orders. inventory(sku PK, on_hand, reserved, version); reservations(id, order_id, sku, qty, expires_at, status) with an index on expires_at; orders(id, user_id, status, total, idempotency_key UNIQUE, created_at) and order_lines. Reserving is one statement per line: UPDATE inventory SET reserved = reserved + :q WHERE sku = :sku AND on_hand - reserved >= :q, inside the same transaction that inserts the reservation and order; zero rows updated means out of stock. Carts live in a key-value store keyed by user id with a 30-day TTL. The catalog is in its own database and is indexed into a search engine through change data capture, so search never queries the order database.',
      architecture:
        '1. Static assets and images come from a CDN backed by object storage. 2. Product and search requests go through the load balancer to a stateless catalog service that reads from a cache (cache-aside, 60 s TTL) and the search index. 3. Cart service reads and writes the key-value store. 4. On checkout, the order service runs one DB transaction: reserve every line, create the order PENDING_PAYMENT with a 10-minute reservation, return the PSP client secret. 5. The browser confirms the card with the PSP directly. 6. The PSP webhook (or our status poll) marks the order PAID and converts reservations to sold (on_hand -= q, reserved -= q) in one transaction, then publishes OrderPaid through an outbox table to a queue for email and the warehouse. 7. A sweeper releases expired reservations every 30 s and cancels the order.',
      scalability:
        'The read tier scales horizontally behind the CDN and cache; the catalog database has read replicas. For the flash sale, a waiting room admits shoppers at a fixed rate (say 500/s) and issues signed tokens, with a per-user limit of one attempt in flight, so the hot row sees bounded contention. Because only 10k units exist, the admission service also stops admitting once a fast counter says the sale is likely sold out and shows a sold-out page; the counter is advisory only, the database UPDATE is the real guard. If 500/s single-row updates are still too hot, I split the sale SKU into 10 bucket rows of 1,000 units and pick a bucket at random, falling back to others when one is empty. Orders are partitioned by user_id later if one primary is not enough, which the numbers say is years away.',
      failures:
        'PSP timeout: the order stays PENDING_PAYMENT; we never re-charge blindly, we query the PSP by our idempotency key and rely on the webhook, and the reservation TTL is longer than the PSP retry window. A webhook that arrives after the reservation expired triggers an automatic refund if stock is gone. Abandoned checkout: the sweeper releases stock. Database primary failure: synchronous standby in another AZ is promoted in under a minute; checkout returns 503 meanwhile while browsing keeps working from cache and replicas. Cache or waiting-room loss: correctness does not depend on them, so the worst case is more load on the database, which the admission rate limit caps. Queue consumers are idempotent by order id, so redelivery is safe.',
      tradeoffs:
        'Reserving at checkout rather than add-to-cart means a cart can fail at checkout, but it does not lock stock in thousands of idle carts. One relational transaction instead of a saga keeps the flow simple for 8 engineers and gives atomicity for free; the cost is coupling inventory and orders to one database, acceptable at about 18 orders/s. The waiting room makes the sale feel slower but fair and protects the database; failing fast would be cheaper but produces a thundering retry storm. Showing cached availability can promise stock that is already gone, so the checkout response is the only authoritative answer.',
    },
  },
  {
    id: 'ecommerce-pass-saga',
    label: 'Strong: event-driven services with a checkout saga',
    expect: 'pass',
    note: 'A genuinely different but valid design: separate services with their own stores, an orchestrated saga with compensations and the outbox pattern, and an in-memory atomic counter for the hot SKU that is reconciled with a durable inventory record. It must score well even though it differs from the relational-transaction approach.',
    answers: {
      functional:
        'Core flows: browse/search, product detail with availability, cross-device cart, checkout with card payment, flash sales, order history and status, and automatic release of stock when a checkout is abandoned or payment fails. Excluded per the brief: recommendations, marketplace sellers, returns and logistics. I also exclude coupons and multi-currency to keep the saga small.',
      nonFunctional:
        'Browse p95 < 200 ms, checkout p99 < 2 s without the PSP, 99.95% availability. Inventory must be linearizable per SKU so we never oversell; orders must reach a final state (paid, cancelled) eventually, within minutes, and never be silently lost. Catalog and search may lag writes by up to 30 s. Durability: orders and inventory changes are committed to replicated storage before acknowledging.',
      capacity:
        'Assume each of the 5M DAU makes 20 reads: 100M/day, about 1.2k RPS average, about 3.5k RPS peak, and during a sale up to about 35k RPS if the 10x applies to the normal peak; I plan for that worst case. Orders: 500k/day = about 6/s, plus during a sale 10k successful orders in a few minutes, around 100-200 orders/s. The hot path is 200k attempts / 60 s = about 3.3k/s on one SKU. Storage: 100 GB catalog metadata, 25 TB images, orders about 2 KB each = 1 GB/day = about 2.5 TB in 7 years. So no service needs heavy sharding; the design problem is contention on one SKU and coordinating three services.',
      api: 'Public: GET /products/{id}, GET /search, GET/PUT/DELETE /cart/items, POST /orders (Idempotency-Key header, body = cart snapshot id) returns 202 {orderId, status: PENDING} and the client polls GET /orders/{id} or listens on a server-sent events stream for status changes. Internal commands on the message bus: ReserveStock, ReleaseStock, AuthorizePayment, CapturePayment, VoidPayment, each carrying orderId as a dedup key. PSP webhooks land on POST /payments/webhook with signature verification.',
      database:
        'Order service: a document or relational store with orders and a saga_state table, plus an outbox table written in the same transaction. Inventory service: a key-value store with conditional writes (compare-and-set on a version) per SKU, holding available and a list of reservation ids, so ReserveStock with the same orderId twice is a no-op. Payment service: its own table of payment attempts keyed by orderId with the PSP reference. Catalog: document store plus a search index fed by change events. Carts: key-value by user id. Each service owns its data; no cross-service joins.',
      architecture:
        'An order orchestrator drives the saga: 1. POST /orders writes the order PENDING and an OrderCreated outbox row in one transaction. 2. Orchestrator sends ReserveStock; inventory does a conditional decrement per line and replies Reserved or Rejected. 3. On Reserved, it sends AuthorizePayment; the payment service calls the PSP with the orderId as the PSP idempotency key. 4. On authorized, it marks the order CONFIRMED and sends CapturePayment when the warehouse confirms pickup. Compensations: if payment fails, ReleaseStock; if stock is rejected, cancel the order with nothing to undo. Reads go through CDN, an API gateway and cached catalog services. Flash-sale SKUs are routed to a dedicated sale-inventory path described below.',
      scalability:
        'Catalog and search scale with replicas and caches; the bus is partitioned by orderId so a saga is processed in order. For the hot SKU, the sale’s 10k units are loaded into an in-memory store as a counter, decremented atomically with a single DECR-if-positive script; after a successful decrement the sale service appends a reservation record (orderId, sku) to a durable replicated log and only then tells the buyer they got a unit; if the append fails or times out, the unit is not returned to the counter (the outcome is unknown, so we accept a tiny undersell rather than risk handing it out twice). The 10k sale units are carved out of the durable inventory up front so normal checkout cannot touch them. The in-memory store is replicated, but we do not trust it for correctness: on any failover we pause the sale and rebuild the counter as 10,000 minus the reservations in the durable log that have not been released (released units are logged too and returned to the counter). A decrement that was never logged was never acknowledged, so the rebuild can at worst undersell slightly, never oversell. Per-user rate limiting at the gateway and a CAPTCHA-protected entry absorb bots.',
      failures:
        'Every consumer is idempotent by orderId and command type, and the outbox guarantees messages are published at least once after commit. If the orchestrator crashes, saga state is in the database and another instance resumes it. PSP timeout: payment stays UNKNOWN and a reconciler queries the PSP by idempotency key before any retry, so a card is never charged twice. Stuck sagas (no reply in 10 minutes) trigger compensation: release stock and void any authorization. A dead-letter queue collects poison messages with alerting.',
      tradeoffs:
        'The saga gives independent deployment and failure isolation, at the cost of eventual consistency, compensations to write and test, and a more complex mental model for a team of 8; a single transactional database would be simpler and is a valid alternative at 6 orders/s. I chose it because the flash-sale path and normal checkout scale very differently. The in-memory sale counter trades a small undersell risk on failover for very high throughput on one SKU; a row lock in a SQL database would be simpler but would serialize 3.3k attempts/s. Asynchronous order creation (202 + polling) adds client complexity but keeps checkout latency stable during spikes.',
    },
  },
  {
    id: 'ecommerce-fail-shallow',
    label: 'Weak: generic and vague',
    expect: 'fail',
    note: 'Names components but never explains how overselling is prevented, gives no numbers, ignores the flash sale and the PSP failure modes, and has no real trade-offs. It should score well below the pass mark on every criterion.',
    answers: {
      functional:
        'Users can view products, add them to a cart and buy them. There is also an order history page. Admins can add products.',
      nonFunctional:
        'The system should be fast, scalable and highly available. It should also be secure.',
      capacity:
        'There are millions of users, so we need a lot of servers. We will use auto-scaling so capacity is not a problem.',
      api: 'GET /products, POST /cart, POST /checkout, GET /orders. They return JSON.',
      database:
        'We will use MongoDB because it is scalable and flexible. Products, carts and orders go in collections.',
      architecture:
        'We use a microservices architecture with a load balancer, an API gateway, a product service, a cart service and an order service. Services talk over REST. We use Redis for caching and Kafka for events.',
      scalability:
        'Everything scales horizontally with Kubernetes. Caching will make it fast. We can shard the database if it gets too big.',
      failures:
        'If something fails we retry. We will have backups of the database and monitoring with alerts.',
      tradeoffs:
        'Microservices are more complex than a monolith but they scale better. NoSQL is more scalable than SQL.',
    },
  },
  {
    id: 'ecommerce-fail-wrong',
    label: 'Weak: confident but incorrect',
    expect: 'fail',
    note: 'Detailed and assertive but wrong where it matters: stock is checked from a cache and then decremented with a read-then-write race, the authoritative count lives in a non-durable cache, PSP retries are not idempotent, capacity math is off by orders of magnitude, and the single database has no failover.',
    answers: {
      functional:
        'Catalog, search, cart, checkout with the PSP, flash sales and order history. Stock is shown live on every product page so shoppers always see the exact number left.',
      nonFunctional:
        'Every page under 50 ms, 100% availability, and strong consistency everywhere including search results and product pages.',
      capacity:
        '5M DAU each doing 20 requests is 100M requests, and since they can all arrive in the same second at peak we need 100M RPS. Each order is about 1 MB with images embedded, so 500k orders is 500 GB per day. The flash sale is only 10,000 units so it is a small load and needs nothing special.',
      api: 'GET /products/{id} returns the live stock count. POST /checkout {cart} charges the card and returns the order. If the PSP times out the client should call POST /checkout again.',
      database:
        'Stock counts live in Redis because it is fast; MySQL holds orders. At checkout the order service reads the stock from Redis, and if it is greater than or equal to the quantity it writes the new value (stock minus quantity) back with SET. Redis persistence is turned off for speed since we can always recount stock later.',
      architecture:
        'Load balancer to a cluster of app servers, which read stock from Redis, call the PSP to charge the card, then insert the order into MySQL and update stock in Redis. Product images are stored as BLOBs in MySQL so everything is in one place and served by the app servers.',
      scalability:
        'We add app servers as traffic grows. The single MySQL server is very powerful (128 cores) so it can handle everything, and vertical scaling is simpler than replication. The flash sale is handled by Redis being fast.',
      failures:
        'If the PSP call fails or times out, the app server retries the charge up to 3 times immediately. If MySQL goes down we restore from last night’s backup. If Redis restarts we set every SKU back to its value from the morning stock file.',
      tradeoffs:
        'We chose Redis over a database for stock because it is faster and has no consistency issues since it is single-threaded. One big MySQL server avoids distributed systems problems entirely.',
    },
  },
]

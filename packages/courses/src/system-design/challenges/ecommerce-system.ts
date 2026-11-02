import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `Design the backend for **ShopLane**, a single-seller online store (one company sells its own stock) that is growing fast.

Shoppers browse and search a large catalog, keep a cart that follows them across devices, and check out with a card. The company runs **flash sales**: a popular item is released at a published time in limited quantity, and tens of thousands of shoppers try to buy it in the same minute.

Two incidents prompted the redesign. During the last flash sale the store **oversold** a limited item by 3,000 units and had to cancel orders. And the catalog pages slowed to a crawl because the same database served browsing, carts and checkout.

Card payments are processed by an external payment service provider (PSP). ShopLane never sees raw card numbers: the browser sends card details straight to the PSP and ShopLane receives a token.`,
  requirements: [
    'Shoppers can browse categories, search the catalog and view product pages with price and availability.',
    'Shoppers have a persistent cart that is shared across their devices and survives logout.',
    'Checkout turns a cart into an order, charges the card through the PSP, and must never sell more units than are in stock.',
    'Flash sales: a limited-quantity item goes on sale at a set time and must stay fair and available under a sudden spike.',
    'Shoppers can see their order history and the status of each order (placed, paid, shipped, cancelled).',
    'Unpaid or abandoned checkouts must release any stock they were holding.',
  ],
  scale: [
    '5 million daily active shoppers, averaging 20 page or API views each per day (about 100 million reads per day).',
    'Normal peak traffic is 3x the daily average; flash sales add a 10x spike on top of normal traffic for about 10 minutes.',
    '500,000 orders per day on a normal day, averaging 3 line items each.',
    'A flash sale offers 10,000 units of one SKU, and about 200,000 shoppers attempt to buy it in the first minute.',
    'Catalog: 10 million SKUs with about 10 KB of metadata each, plus an average of 5 images per SKU at about 500 KB each.',
    'Orders must be retained for 7 years for tax and accounting.',
  ],
  constraints: [
    'Product and search pages: p95 under 200 ms at the edge of your system. Checkout: p99 under 2 seconds, excluding time spent waiting on the PSP.',
    'Availability target of 99.95% for browsing and checkout. Overselling a limited item is treated as a correctness bug, not an availability trade-off.',
    'Card data never touches ShopLane servers (the PSP tokenizes it), which keeps ShopLane mostly out of PCI DSS scope. Do not design a card vault.',
    'A team of 8 backend engineers on a single cloud provider, serving one country from one region with multiple availability zones.',
    'Out of scope: recommendations, third-party sellers, returns, and warehouse or shipping logistics beyond recording a shipped status.',
  ],
  instructions: `Fill in all nine fields. Write for an engineer who has to build this.

- There is no single reference answer. Any architecture that meets the requirements and constraints can score well, whether it uses synchronous calls or events, one database or several, and whichever products you prefer. Justify choices against the requirements rather than naming tools.
- Show your capacity math: write down every assumption (views per user, peak factor, row and object sizes) and the arithmetic, so a reader can follow it. Round freely, but keep it within the right order of magnitude.
- Be explicit about how stock is protected from overselling under concurrency, how the flash-sale spike is absorbed, and what happens when the PSP is slow, fails, or the shopper abandons checkout.
- Name what you are leaving out and the risks you accept.`,
  rubric: {
    version: '1.0',
    passMark: 75,
    criteria: [
      {
        id: 'requirements_understanding',
        title: 'Requirements understanding',
        weight: 15,
        description:
          'A strong answer separates the read-heavy browse and search path from the write-critical checkout path and states which needs strong correctness (stock, orders, payment status) and which tolerates staleness (catalog, displayed availability). It covers the cart, checkout, flash sale fairness, order status and stock release on abandonment, and gives measurable non-functional targets consistent with the constraints. Penalize answers that ignore the no-oversell requirement or the flash sale, or that invent scope the brief excludes (recommendations, sellers, logistics) at the expense of the core flows.',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'A strong answer derives read RPS from the stated figures (about 100 million reads/day is roughly 1,200 per second average, a few thousand at normal peak, and over 10,000 per second during a flash sale), order writes (500,000/day is about 6 per second average, far higher bursts during a sale), catalog storage (about 100 GB of metadata, roughly 25 TB of images) and order storage over 7 years, and draws a design conclusion from them, e.g. the catalog fits comfortably in one database cluster plus caches while the flash-sale hot SKU is a contention problem rather than a volume problem. Assumptions must be written down. Penalize errors of an order of magnitude or more, or numbers that are never used to make a decision.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        minScore: 50,
        description:
          'A strong answer has clear components for catalog/search, cart, inventory, order/checkout and the PSP integration, with a step-by-step checkout flow that shows when stock is held or decremented, when the card is charged, and how the order reaches a final state. Either a reservation-based approach (hold stock with a TTL, then confirm or release) or a saga/event approach (order, inventory and payment steps with compensations) is acceptable, as is a well-structured modular monolith; judge whether the flow is correct under concurrency and partial failure. Static assets and images should be served from a CDN/object storage rather than app servers. Penalize a check-then-write stock flow without an atomic guard, charging the card with no way to reconcile it against the order, or a design that routes all traffic through one undifferentiated database.',
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        description:
          'A strong answer keeps stock and orders in a store that supports atomic conditional updates or transactions (e.g. decrement only if available >= quantity, or a compare-and-set on a version), models orders and order lines with a status lifecycle, and keys idempotency for order creation. Catalog data may live in a different store and be indexed for search, with a stated way to keep the search index in sync. Carts may use a key-value or document store keyed by user. Any database family is acceptable if it provides the guarantees the access pattern needs. Penalize keeping the authoritative stock count only in a cache or eventually consistent store, or a schema where order and stock changes cannot be made consistent.',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        minScore: 50,
        description:
          'A strong answer scales browsing with CDN and cache layers and read replicas, and treats the flash-sale hot SKU explicitly: for example an admission queue or waiting room, rate limiting per user, splitting a hot counter into buckets, or an in-memory atomic counter backed by a durable record, with a statement of how correctness survives a cache or node failure. It handles PSP timeouts and errors (retries with an idempotency key, a pending state, and reconciliation via webhook or status query), expires abandoned reservations, and avoids single points of failure through replication across availability zones. Penalize designs where a cache restart can oversell or lose orders, retries that can double-charge, or no plan for the 10x spike beyond "autoscale".',
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'A strong answer names the real choices and what each costs: reserve stock at add-to-cart vs at checkout vs at payment (fairness vs stock locked by abandoned carts), synchronous transaction vs saga (simplicity vs decoupling and compensation complexity), showing slightly stale availability on product pages vs live counts, and queueing flash-sale buyers vs failing them fast. It explains why the chosen side fits this brief (one region, 8 engineers, no-oversell). Penalize lists of technologies with no alternatives considered, or claims that a choice has no downside.',
      },
    ],
  },
  remediation: {
    requirements_understanding: [
      'intro-to-system-design',
      'consistency-models',
    ],
    capacity_estimation: [
      'intro-to-system-design',
      'horizontal-vertical-scaling',
      'cdn-object-storage',
    ],
    architecture_design: [
      'distributed-transactions',
      'event-driven-architecture',
      'cdn-object-storage',
    ],
    database_design: ['sql-vs-nosql', 'database-indexing', 'idempotency'],
    scalability_reliability: [
      'cache-strategies',
      'rate-limiting',
      'fault-tolerance',
    ],
    tradeoff_reasoning: ['distributed-transactions', 'consistency-models'],
  },
  fieldHints: {
    capacity:
      'Separate the steady-state numbers from the flash sale. For the sale, ask how many concurrent writes hit one SKU, not just total RPS.',
    database:
      'Say exactly which operation prevents overselling and why it is atomic, and where the source of truth for stock lives.',
    failures:
      'Walk through a PSP timeout, a shopper who never pays, and the loss of a cache or database node during a flash sale.',
  },
}

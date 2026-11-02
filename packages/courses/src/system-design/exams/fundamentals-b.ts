import type { Question } from '../../types'

export const examQuestions: Question[] = [
  {
    id: 'sd-fundamentals-x5',
    objective: 'sd-database-indexing-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'A link-redirect service runs three app servers behind a load balancer. Every redirect runs `SELECT url FROM links WHERE code = $1`, and `EXPLAIN` shows a sequential scan of `links`. The database CPU is near its limit while the app servers are mostly idle. Which change addresses the root cause?',
    options: [
      {
        id: 'a',
        text: 'Add two more app servers behind the load balancer',
        explanation:
          'The app servers are not the bottleneck. More of them would send the same full-table scans to the same database.',
      },
      {
        id: 'b',
        text: 'Switch the load balancer to least connections',
        explanation:
          'The balancing algorithm only changes which app server sends each query; every query still scans the whole table.',
      },
      {
        id: 'c',
        text: 'Add a unique index on `links.code`',
        explanation:
          'Correct. Each lookup becomes a short walk down an index instead of a scan of every row, which removes the work that is saturating the database. A unique index also enforces that codes are not duplicated.',
      },
      {
        id: 'd',
        text: 'Send redirects with `Cache-Control: private`',
        explanation:
          '`private` only stops shared caches from storing responses. It does nothing about how expensive each database lookup is.',
      },
    ],
    answer: 'c',
  },
  {
    id: 'sd-fundamentals-x6',
    objective: 'sd-caching-fundamentals-3',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'Each of four app servers keeps its own in-memory cache of product data with a 10-minute TTL, and a round-robin load balancer spreads requests across them. After a price change, a user refreshing the product page sees the old and new price alternate for several minutes. Why?',
    options: [
      {
        id: 'a',
        text: 'Each server cached its own copy at a different time, and requests rotate between servers',
        explanation:
          'Correct. Servers that cached the product before the change keep the old price until their own TTL expires, while others already hold the new one. Round robin sends successive refreshes to different servers, so the user sees both.',
      },
      {
        id: 'b',
        text: 'The load balancer caches page responses and alternates between two stored versions',
        explanation:
          'A load balancer forwards requests; nothing in this setup says it caches responses, and the copies described live on the app servers.',
      },
      {
        id: 'c',
        text: 'The database index on products is stale and returns the old row on some queries',
        explanation:
          'Indexes are kept in sync with the table on every write, so they do not return old values.',
      },
      {
        id: 'd',
        text: 'Each read resets the TTL, so popular entries never expire at all',
        explanation:
          'A standard TTL counts from when the entry was stored, and the prices do converge after a few minutes, so entries are expiring.',
      },
    ],
    answer: 'a',
  },
  {
    id: 'sd-fundamentals-x7',
    objective: 'sd-database-indexing-2',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'An `events` table gets a new row for every click and is read only by a nightly job filtering on `created_at`. A teammate proposes indexing all six columns "for future queries" and writing every new event into Redis as well. What is the best response?',
    options: [
      {
        id: 'a',
        text: 'Accept both: indexes and caches only make reads faster, so they are free',
        explanation:
          'Each index adds work to every insert, and caching rows nobody reads uses memory for nothing. Neither is free.',
      },
      {
        id: 'b',
        text: 'Index all six columns, but skip Redis because caches cannot hold event data',
        explanation:
          'Redis can hold event data fine. The problem is that nothing reads it, and six indexes slow every insert.',
      },
      {
        id: 'c',
        text: 'Cache the events in Redis instead of storing them in the database',
        explanation:
          'A cache holds evictable copies, not the source of truth. Events that live only in a cache can be lost.',
      },
      {
        id: 'd',
        text: 'Index only `created_at` for the nightly job and skip caching the writes',
        explanation:
          'Correct. On a write-heavy table every extra index slows each insert, so index only what is queried. Caching helps data that is read repeatedly, which these events are not.',
      },
    ],
    answer: 'd',
  },
  {
    id: 'sd-fundamentals-x8',
    objective: 'sd-sql-vs-nosql-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'Shopping carts must survive app-server restarts and be readable by whichever of several servers behind a load balancer handles the request. Carts are always fetched by cart id. Where should they live?',
    options: [
      {
        id: 'a',
        text: "In each server's memory, with sticky sessions on the load balancer",
        explanation:
          'Stickiness keeps a user on one server, but a restart or failure of that server loses the carts it holds.',
      },
      {
        id: 'b',
        text: 'In a shared database keyed by cart id, such as a key-value store or a table',
        explanation:
          'Correct. A durable store every server can reach means any server can serve any request, and the access pattern (get by id) fits a key-value store or an indexed relational table equally well.',
      },
      {
        id: 'c',
        text: 'In a local in-process cache on each server, with a one-day TTL',
        explanation:
          'A local cache is per server and is wiped on restart, and other servers cannot see it.',
      },
      {
        id: 'd',
        text: "In the browser's HTTP cache, using `Cache-Control: private`",
        explanation:
          'The HTTP cache stores responses for reuse; it is not application storage the servers can read, and the browser may evict entries at any time.',
      },
    ],
    answer: 'b',
  },
]

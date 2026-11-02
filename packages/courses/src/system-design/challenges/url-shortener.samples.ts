import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'url-shortener-pass-random-kv',
    label: 'Random codes, key-value store, async analytics',
    expect: 'pass',
    note: 'Correct capacity math, random 7-character codes with an atomic conditional insert, a key-value store keyed by code, cache plus short-TTL edge caching, 302 redirects for analytics, and analytics fully decoupled from redirects. Failure handling and trade-offs are concrete.',
    answers: {
      functional: `1. Create a short link: POST a long URL, optional custom alias and optional expiry; get back a 7-character code.
2. Redirect: GET /{code} returns a redirect to the long URL, or a 404/410 page for unknown, expired or disabled links.
3. Disable a link (trust and safety), effective within 1 minute.
4. Click analytics per link: daily counts, top countries, top referrers, fresh within 5 minutes.
Out of scope: accounts, billing, dashboard UI, link previews. I also leave out editing the destination of an existing link.`,
      nonFunctional: `Redirects: 99.99% availability and p99 under 50 ms at the service, so the redirect path must not depend on anything slow. Creation: 99.9% and p99 under 300 ms. Links are durable for years, so the link store must be replicated and backed up. Codes must be unique and not enumerable. Analytics can be eventually consistent (up to 5 minutes stale) and approximate under failure; a few lost click events are acceptable, a broken redirect is not.`,
      capacity: `Writes: 100M links/month / 2.6M seconds per month ≈ 40/s average; assume peak 10x ≈ 400/s.
Reads: 100:1 → 10B redirects/month ≈ 3,900/s average; with a 5x peak ≈ 20,000/s.
Storage: 100M × 60 months = 6B links × 500 bytes ≈ 3 TB, ×3 replicas ≈ 9 TB.
Analytics: 10B clicks × 100 bytes ≈ 1 TB/month raw; 90 days ≈ 3 TB.
Code space: base62 with 7 chars = 62^7 ≈ 3.5 trillion. At 6B links the space is about 0.2% full, so a random code collides with probability about 0.002 per try, and a retry almost always succeeds.
Cache: if the last week of links gets most traffic, that is about 25M links × 500 B ≈ 12 GB, which fits in memory on a small cluster.`,
      api: `POST /v1/links {url, alias?, expiresAt?} → 201 {code, shortUrl}; 400 invalid URL; 409 alias taken; 429 rate limited.
GET /{code} → 302 Location: longUrl (Cache-Control: max-age=30); 404 unknown; 410 expired or disabled.
GET /v1/links/{code}/stats?from&to → 200 {daily: [...], countries: [...], referrers: [...]}.
POST /v1/links/{code}/disable (internal, trust and safety) → 204.
I use 302, not 301: browsers cache a 301 permanently, so repeat clicks would never reach us and analytics would undercount, and a disabled link could keep working in someone’s browser.`,
      database: `Links live in a managed key-value store with the partition key = code: {code, longUrl, ownerId, createdAt, expiresAt?, status}. The only hot access pattern is a point lookup by code, which a key-value store serves in single-digit milliseconds at any scale, and it partitions automatically so 3 TB is not a concern. Uniqueness is enforced with a conditional put (write only if the key does not exist); custom aliases use the same table, so an alias can never clash with a generated code. A secondary index on ownerId supports “my links”.
Click events go to a separate append-only pipeline: a durable log, then a columnar analytics store with raw events partitioned by day (90-day TTL) and rolled-up daily aggregates per link.`,
      architecture: `Create: client → load balancer → stateless API servers → generate a random 7-char base62 code from a cryptographically secure RNG → conditional put; on conflict, retry with a new code (max 3 tries) → return the short URL.
Redirect: client → CDN/edge → API servers → in-memory cache (cache-aside, TTL 60 s) → on miss, key-value store → check status and expiry → 302.
After responding, the server emits a click event (code, timestamp, country from IP, referrer) to a local buffer that ships batches to the durable log. Stream workers aggregate per link per minute and write to the analytics store; the stats API reads from there.
Disable: update status in the store and delete the cache key; edge responses have max-age 30 s, so the link stops within a minute.`,
      scalability: `API servers are stateless and scale horizontally behind the load balancer. The cache absorbs most of the 20k/s peak; I expect a 90%+ hit rate given the skew, so the store sees a few thousand reads/s. Viral links are cached at the edge for 30 s, so one hot link is served mostly by the CDN. Negative caching (cache “not found” for 30 s) stops scanners from hammering the store with random codes. The key-value store partitions by code, and random codes spread writes evenly. Analytics scales separately by adding log partitions and stream workers.`,
      failures: `Cache node down: requests fall through to the store, which is provisioned to take the full peak for a short time; the cache cluster uses consistent hashing so only that node’s keys miss.
Store replica down: the managed store replicates across 3 zones, so reads continue.
Analytics log unavailable: servers buffer events in memory up to a limit and then drop them, and redirects keep working; we alert on dropped events.
Code collision: the conditional put fails and we retry with a new code.
Region outage: links are replicated to a second region (asynchronously, creation may lose the last seconds of writes); DNS fails over redirects there.`,
      tradeoffs: `Random codes vs a counter: random needs no coordination and is not enumerable, at the cost of a rare retry; a counter would need a coordinator plus scrambling. 302 vs 301: 302 costs more server traffic but keeps analytics accurate and lets us disable links. Key-value vs relational: I lose ad hoc queries and joins, which this workload does not need, and gain automatic partitioning. Edge TTL of 30 s trades a little origin load for meeting the 1-minute disable target. Analytics may drop events under failure, which I accept to protect redirect availability.`,
    },
  },
  {
    id: 'url-shortener-pass-counter-relational',
    label: 'Counter ranges with scrambling, relational store',
    expect: 'pass',
    note: 'A genuinely different valid design: IDs from pre-allocated counter ranges passed through a reversible permutation (non-sequential codes, no collisions by construction), a relational primary with read replicas and a cache, and analytics through a queue with batch aggregation. Math is right and failure modes, including the range allocator, are handled.',
    answers: {
      functional: `Core features: shorten a URL (optional alias and expiry), redirect by code, disable a link quickly for abuse, and show link owners clicks per day, countries and referrers within 5 minutes. Expired links return 410, unknown ones 404. Not in scope: login, billing, dashboards, previews, and changing a link’s destination after creation.`,
      nonFunctional: `- Redirect availability 99.99%, p99 < 50 ms server-side.
- Creation availability 99.9%, p99 < 300 ms.
- Durability: a created link must never be lost or point somewhere else.
- Codes unique and not guessable by incrementing.
- Analytics eventually consistent within 5 minutes; small undercounts during incidents are acceptable.
- Disable takes effect within 60 s.`,
      capacity: `Assume 30-day months (2.59M s).
Creates: 100M / 2.59M ≈ 39/s, peak ≈ 400/s.
Redirects: 10B / 2.59M ≈ 3,860/s, peak ≈ 20k/s.
Links after 5 years: 6B. At 500 B each that is 3 TB of table data; indexes on the code are already included in that estimate.
Click events: 10B/month × 100 B = 1 TB/month raw, ~3 TB retained.
Code length: 6B IDs need log62(6×10^9) ≈ 5.5 characters, so 6 characters would just fit (62^6 ≈ 57B); I use 7 (62^7 ≈ 3.5T) for headroom and to keep the space sparse after scrambling.`,
      api: `POST /api/links  body {longUrl, customAlias?, expiresAt?}  → 201 {code, shortUrl} | 409 alias exists | 422 bad URL.
GET /{code} → 307 to longUrl, 404 or 410 otherwise. 307 is a temporary redirect like 302, so it is not cached permanently by browsers and every click reaches us for counting.
GET /api/links/{code}/analytics?granularity=day → counts, countries, referrers.
PATCH /api/admin/links/{code} {status: "disabled"} → 200.`,
      database: `A relational database: table links(id BIGINT PK, code CHAR(7) UNIQUE, long_url TEXT, owner_id, created_at, expires_at NULL, status). Lookups are by code through the unique index, which is O(log n) and fast. Custom aliases go in a separate table aliases(alias PK, link_id) so they cannot collide with the generated namespace (generated codes are always exactly 7 chars; aliases must be 4–6 or 8+ chars or contain a hyphen).
3 TB fits on one well-provisioned primary for the first couple of years; the write rate (40/s) is tiny. Before it gets uncomfortable I would partition by hash of code. Click events are not stored here; they go to a queue and then to a separate analytics database with daily rollup tables.`,
      architecture: `ID generation: a small table id_ranges hands out blocks of 100,000 IDs. Each app server grabs a block in a transaction and assigns IDs from memory. The ID is passed through a reversible permutation of the 62^7 space (a keyed Feistel network), then base62-encoded and left-padded to 7 characters. Because the permutation is a bijection, distinct IDs give distinct codes, so no collision check is needed, and consecutive IDs give unrelated codes.
Redirect flow: LB → app server → distributed cache (code → longUrl, status, expiry) → on miss, read replica → respond 307 → publish click event to a queue (fire-and-forget).
Analytics: consumers batch events every minute into an analytics DB and update per-day aggregates.`,
      scalability: `The redirect path scales by adding stateless app servers and cache nodes. I expect most lookups to hit the cache because of the recency skew; misses go to read replicas, which I can add as read load grows. The primary only takes 40–400 writes/s. Range allocation means the id_ranges table is touched once per 100,000 links. Analytics consumers scale with queue partitions. For viral links, an edge cache with a 30 s TTL takes the load off origin while still honoring the 1-minute disable rule.`,
      failures: `Primary fails: managed failover promotes a replica (tens of seconds); creation fails briefly, redirects keep working from cache and replicas. id_ranges unavailable: servers keep using their current block and fetch the next block when 80% is used, so a short outage does not stop creation; a crashed server just wastes the rest of its block, which is fine with 3.5T codes. Cache cluster down: replicas take the load; we keep replica capacity for peak. Queue down: click publishing times out after 5 ms and the event is dropped and counted in a metric; redirects are unaffected.`,
      tradeoffs: `Counter + permutation vs random codes: no collision retries and predictable code density, but it needs the range allocator and a secret permutation key; leaking the key would make codes predictable again. Relational vs key-value: familiar tooling, transactions for aliases and admin updates, easy reporting, but sharding is manual later. 307 vs 301: more requests reach us, but analytics stay accurate and disabled links stop working. Dropping click events under failure favors redirect availability over exact counts.`,
    },
  },
  {
    id: 'url-shortener-fail-shallow',
    label: 'Shallow: right shape, no depth',
    expect: 'fail',
    note: 'Names reasonable components but gives no numbers, no key-generation scheme or uniqueness guarantee, no redirect status reasoning, and no real failure handling. It would score low on capacity, architecture and reliability.',
    answers: {
      functional: `Users can shorten a URL and get a short link. When someone clicks it they get redirected. There should also be analytics.`,
      nonFunctional: `The system should be fast, scalable and highly available. It should also be secure.`,
      capacity: `There are a lot of links and a lot of clicks, so the system needs to handle high traffic. We will need a lot of storage over time, so we should use a database that scales.`,
      api: `POST /shorten with the long URL returns the short URL. GET /{code} redirects to the long URL. There is also an endpoint to get stats.`,
      database: `I would use a NoSQL database because it is more scalable than SQL. It stores the short code and the long URL.`,
      architecture: `The client sends a request to the load balancer, which sends it to the server. The server generates a short code and saves it to the database. For redirects the server looks up the code and redirects the user. Analytics are saved to the database too.`,
      scalability: `We can add more servers behind the load balancer and use a cache like Redis to make it faster. The database can be sharded.`,
      failures: `We will have backups and monitoring so that if something fails we can fix it.`,
      tradeoffs: `NoSQL is more scalable but SQL has better consistency. I chose NoSQL because scale is more important here.`,
    },
  },
  {
    id: 'url-shortener-fail-wrong',
    label: 'Confident but technically wrong',
    expect: 'fail',
    note: 'Detailed and confident, but wrong where it matters: write rate off by about four orders of magnitude, truncated MD5 assumed collision-free, 301 redirects while claiming exact analytics and fast disabling, click counts updated synchronously on the link row, and a single cache that is the only copy of recent links.',
    answers: {
      functional: `Shorten URLs with optional alias and expiry, redirect, disable malicious links, and give owners exact real-time click counts per day, country and referrer. Out of scope: accounts and billing.`,
      nonFunctional: `99.99% availability, sub-50 ms redirects. Analytics must be strongly consistent and exact in real time, because owners pay attention to them. Codes must be unique.`,
      capacity: `100M links per month is about 1M writes per second at peak, so writes are the main bottleneck. Redirects are 100x that, about 100M per second. Each link is 500 bytes, so 6B links is 3 GB, which fits in memory on one server.`,
      api: `POST /shorten {url} → {short}. GET /{code} → 301 Moved Permanently to the long URL. A 301 is the right choice because it is the standard redirect for URLs and every click still goes through our server, so we can count it. GET /stats/{code} → counts.`,
      database: `A single relational database table links(code PK, long_url, clicks INT, clicks_by_country JSON). On every redirect we run UPDATE links SET clicks = clicks + 1 and update the JSON in the same transaction, which gives exact real-time analytics. Because the DB is ACID, the counts are always correct.`,
      architecture: `To generate the code we take MD5(longUrl) and keep the first 6 characters. MD5 is a cryptographic hash, so two different URLs never produce the same code, and we don’t need a uniqueness check. The same URL always gets the same code, which also deduplicates. New links are written to one Redis instance first and flushed to the database every 10 minutes in a batch, which keeps the 1M writes/s off the database. Redirects read Redis first, then the database.`,
      scalability: `Because the whole dataset is 3 GB, we keep everything in one large Redis instance, so there is no need to shard. The database can scale vertically to handle the click updates. Disabling a link is just an update in the database.`,
      failures: `Redis is very reliable, so it is unlikely to fail; if it does, we restart it. The database has nightly backups. If the database is slow, redirects wait for the click update to finish so that analytics stay exact.`,
      tradeoffs: `I chose MD5 over random codes because it is deterministic and has no collisions. 301 over 302 because it is the permanent and SEO-friendly choice. Exact analytics are worth the extra database load.`,
    },
  },
]

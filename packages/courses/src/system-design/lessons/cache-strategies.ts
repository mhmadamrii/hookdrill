import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'cache-strategies',
  title: 'Cache Strategies',
  summary:
    'How data gets into a cache and stays close enough to the database: cache-aside, read-through, write-through and write-back; invalidation with TTLs and deletes, and the races they leave open; and how to stop a cache stampede when a popular key expires.',
  minutes: 18,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-cache-strategies-1',
      text: 'describe cache-aside, read-through, write-through and write-back, stating who writes to the cache and the database, and when.',
    },
    {
      id: 'sd-cache-strategies-2',
      text: 'choose an invalidation approach (TTL, delete on write, versioned keys) and explain the races and staleness each one still allows.',
    },
    {
      id: 'sd-cache-strategies-3',
      text: 'recognise a cache stampede and apply mitigations such as request coalescing, a rebuild lock, serving stale data and TTL jitter.',
    },
  ],
  concept: [
    {
      heading: 'Two copies of the truth',
      blocks: [
        {
          type: 'text',
          md: 'Caching Fundamentals covered where caches sit, hit rates and eviction. The moment you add a cache such as Redis in front of a database, you have **two copies** of some data, and two questions follow:\n\n- **How does data get into the cache?** On demand when someone reads it, or every time someone writes it?\n- **How does the cache find out the database changed?** If it never does, users see old data forever.\n\nThe answers are called **cache strategies** (or caching patterns). None is free: each trades read latency, write latency, freshness, durability and complexity differently. You saw the same kind of trade-off in Database Replication, where a follower can lag behind the leader. A cache is another copy that can lag, and the techniques in this lesson are about bounding that lag.',
        },
      ],
    },
    {
      heading: 'Read and write strategies, precisely',
      blocks: [
        {
          type: 'text',
          md: '**Reading**\n\n- **Cache-aside** (also called **lazy loading**): the application checks the cache first. On a hit it uses the value. On a miss it reads the database, writes the result into the cache, and returns it. The cache only holds data someone asked for, and if a cache node is lost the app still works, just slower, while the cache refills. The cost is a slower first read after each miss.\n- **Read-through:** the same flow, but the cache layer (a caching library or an inline cache product) loads from the database itself on a miss. Application code just asks the cache.\n\n**Writing**\n\n- **Write-through:** every write updates the database and the cache together, synchronously, before the write is acknowledged. Reads after a write find fresh data in the cache, but every write pays for two updates, and the cache fills with data that may never be read (a TTL limits that).\n- **Write-back** (also called **write-behind**): the write updates only the cache and is acknowledged; the database is updated later, asynchronously, often in batches. Writes are fast, but any change still waiting in the cache is **lost if the cache node fails** before it is flushed. Use it only where losing recent writes is acceptable or the cache itself is made durable.\n- **Write-around:** writes go only to the database, and the cache is left alone or the old entry is removed. The next read loads the new value through cache-aside.\n\nIn practice the most common combination is **cache-aside for reads, plus deleting the cache entry on writes, plus a TTL on every entry**.\n\n**Invalidation**\n\n- **TTL (time to live):** every entry expires after a set time. TTL does not keep data fresh; it puts an **upper bound** on how stale it can get.\n- **Delete on write:** after updating the database, delete the cache key so the next read reloads it. Deleting is usually safer than writing the new value into the cache, because two concurrent writers can update the database in one order and the cache in the other, leaving the older value cached.\n- **Versioned keys:** include a version in the key (`product:42:v7`). Bumping the version makes readers ignore old entries, which then age out.\n\nEven with delete on write, races remain. In the classic one, a reader misses, reads the old row, and is delayed; a writer then updates the row and deletes the key; the reader finally writes the **old** value into the cache. It stays stale until the next delete or TTL expiry. The same happens if misses are filled from a **lagging read replica**. This is why a TTL is kept as a safety net even when you invalidate on writes.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Cache-aside (lazy loading)',
              definition:
                'The application reads the cache first and, on a miss, loads from the database and populates the cache itself.',
            },
            {
              term: 'Read-through',
              definition:
                'The cache layer loads missing entries from the database on its own; the application only talks to the cache.',
            },
            {
              term: 'Write-through',
              definition:
                'Each write updates both the database and the cache before it is acknowledged.',
            },
            {
              term: 'Write-back (write-behind)',
              definition:
                'Each write updates the cache and is acknowledged; the database is updated later. Fast, but pending writes are lost if the cache fails first.',
            },
            {
              term: 'TTL (time to live)',
              definition:
                'How long an entry may stay in the cache before it expires and the next read must reload it.',
            },
            {
              term: 'Cache stampede (thundering herd)',
              definition:
                'Many requests miss the same entry at once, for example when a popular key expires, and all hit the database together.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Cache-aside in a picture, and the stampede',
      blocks: [
        {
          type: 'diagram',
          caption:
            'Cache-aside with delete on write. The read API checks Redis and loads from the database only on a miss; the write API updates the database, then deletes the cached key.',
          nodes: [
            { id: 'client', label: 'Client', kind: 'client', col: 0, row: 2 },
            { id: 'read', label: 'Read API', kind: 'service', col: 1, row: 1 },
            {
              id: 'write',
              label: 'Write API',
              kind: 'service',
              col: 1,
              row: 4,
            },
            {
              id: 'cache',
              label: 'Redis cache',
              kind: 'cache',
              col: 3,
              row: 1,
            },
            { id: 'db', label: 'Database', kind: 'store', col: 3, row: 4 },
          ],
          edges: [
            { from: 'client', to: 'read', label: 'GET product' },
            { from: 'client', to: 'write', label: 'update price' },
            { from: 'read', to: 'cache', label: 'GET; SET on miss' },
            { from: 'read', to: 'db', label: 'query on miss', dashed: true },
            { from: 'write', to: 'db', label: '1. update row' },
            { from: 'write', to: 'cache', label: '2. delete key' },
          ],
        },
        {
          type: 'text',
          md: '**The stampede.** Suppose the home page’s data is one cached key that takes a slow query to rebuild, and many requests per second read it. When the key expires, every request in the next moment misses, and each one runs the slow query. The database suddenly gets a burst of identical expensive queries at the moment it is least ready. A cold cache after a restart or flush causes the same burst on a larger scale.\n\nMitigations:\n\n- **Request coalescing:** only one request rebuilds a missing key; others wait for its result. Within one process this is a shared in-flight promise; some caches and proxies offer it built in.\n- **A rebuild lock across servers:** `SET lock:home <token> NX EX 10` in Redis succeeds for only one caller. That caller rebuilds; the others serve the old value or wait briefly and re-check. Redis notes this simple lock is not a strongly safe lock, which is acceptable here because a rare double rebuild is harmless.\n- **Serve stale while refreshing:** keep a soft expiry (time to refresh) and a hard expiry (time the value is unusable). Between them, serve the old value and refresh in the background.\n- **TTL jitter:** add a small random amount to each TTL so keys written together do not expire together.\n- **Warm the cache** before sending traffic to a new, empty cache.',
        },
        {
          type: 'example',
          title: 'A product page under a flash sale',
          md: 'Illustrative numbers: product pages are read thousands of times per minute, and prices change a few times a day.\n\n- **Read:** cache-aside, key `product:{id}`, TTL 5 minutes plus up to 30 seconds of random jitter.\n- **Write:** the admin tool updates the row in the leader database, then deletes `product:{id}`. The next read reloads it.\n- **Repopulating:** misses within a few seconds of a write read from the leader, not a replica, so lag cannot put the old price back in the cache.\n- **The hot item:** the sale item gets a rebuild lock, so when its key expires one request reloads it while the rest are served the previous value for a moment.\n- **Not cached at all:** the stock count checked at checkout. That decision must be made against the database, because a stale cache answer would sell items that are gone.',
        },
      ],
    },
    {
      heading: 'Strategies in real systems',
      blocks: [
        {
          type: 'text',
          md: '- **Amazon ElastiCache** documents three strategies: **lazy loading** (cache-aside), **write-through**, and **adding a TTL**. It lists the trade-offs: lazy loading only caches requested data and survives node failure but can serve stale data and pays a penalty on every miss; write-through keeps the cache current on every write but caches data that may never be read and leaves a new node empty until data is written again. It recommends combining them with TTLs, which keep data from getting too stale without guaranteeing freshness.\n- **AWS’s article on caching challenges** separates **side caches** (cache-aside in application code) from **inline caches** that handle read-through and write-through themselves. It describes request coalescing against thundering herds, the flood of misses when a server starts with an empty cache, a soft and hard TTL pair for serving stale data when a dependency fails, and caching error responses (negative caching) with their own TTL.\n- **Redis** supports these patterns with key expiry and with `SET ... NX EX` for a simple lock, while pointing to its Redlock algorithm when stronger locking guarantees are needed.',
        },
      ],
    },
  ],
  application: {
    heading: 'Choosing a strategy, and what no strategy gives you',
    blocks: [
      {
        type: 'text',
        md: 'A practical starting point for most read-heavy web apps: cache-aside reads, delete on write, a TTL on every key sized to how much staleness the product can accept, jitter on that TTL, and a rebuild lock or coalescing for the few very hot keys. Add write-through where reads right after a write must hit warm, fresh data. Reach for write-back only for data where losing recent writes is acceptable, such as counters or analytics, or where the cache layer is itself durable.\n\nLimits:\n\n- **Caching gives bounded staleness, not strong consistency.** Races between readers and writers, lagging replicas and failed cache updates can all leave old data cached until the TTL ends. Data that must be exactly right at decision time, such as stock at checkout or an account balance, should be read from the source of truth.\n- **Write-heavy data gains little.** If a key changes about as often as it is read, most reads miss anyway.\n- **The database must survive a cold cache.** If the cache is flushed or lost, every request misses at once. Design so that a cold start degrades performance instead of taking the database down: warm-up, coalescing and limits on concurrent rebuilds.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'With write-through caching, the cache can never be stale.',
      correction:
        'Write-through keeps the cache current only when every write goes through that path and both updates succeed. A failed cache update, concurrent writers, or another service writing the database directly can still leave old data cached, so a TTL is still worth having.',
    },
    {
      claim: 'Write-back is simply a faster write-through.',
      correction:
        'Write-back acknowledges a write before it reaches the database. If the cache node fails before flushing, those acknowledged writes are lost. It trades durability for write speed.',
    },
    {
      claim:
        'On every update, writing the new value into the cache is always better than deleting the key.',
      correction:
        'Two concurrent writers can update the database in one order and the cache in the other, leaving the older value cached indefinitely. Deleting the key makes the next read load from the database. It narrows the window for races but does not close it, which is why a TTL stays as a backstop.',
    },
  ],
  questions: [
    {
      id: 'sd-cache-strategies-q1',
      objective: 'sd-cache-strategies-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'In the cache-aside pattern, what puts data into the cache after a miss?',
      options: [
        {
          id: 'a',
          text: 'The database pushes every changed row to the cache',
          explanation:
            'Databases do not push into the cache in cache-aside; the cache only gets what the application puts there.',
        },
        {
          id: 'b',
          text: 'The cache itself fetches the row from the database',
          explanation:
            'A cache that loads itself on a miss is read-through, not cache-aside.',
        },
        {
          id: 'c',
          text: 'A scheduled batch job copies all rows every night',
          explanation:
            'Bulk preloading is a warm-up technique, not how cache-aside fills entries.',
        },
        {
          id: 'd',
          text: 'The application reads the database and writes the result',
          explanation:
            'Correct. On a miss the application loads from the database and populates the cache itself.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-cache-strategies-q2',
      objective: 'sd-cache-strategies-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which write policy acknowledges a write after updating only the cache, and updates the database later?',
      options: [
        {
          id: 'a',
          text: 'Write-through',
          explanation:
            'Write-through updates the database and the cache before acknowledging.',
        },
        {
          id: 'b',
          text: 'Write-back',
          explanation:
            'Correct. Also called write-behind: the database update is deferred and done asynchronously.',
        },
        {
          id: 'c',
          text: 'Cache-aside',
          explanation:
            'Cache-aside is a read pattern; writes go to the database, often followed by deleting the key.',
        },
        {
          id: 'd',
          text: 'Write-around',
          explanation:
            'Write-around writes only to the database and skips the cache, the opposite of this.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-cache-strategies-q3',
      objective: 'sd-cache-strategies-1',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'What is the main risk of write-back compared with write-through?',
      options: [
        {
          id: 'a',
          text: 'Reads become slower, because every read must also check the database',
          explanation:
            'Write-back does not change the read path; reads still hit the cache first.',
        },
        {
          id: 'b',
          text: 'The cache fills with entries that are written but never read again',
          explanation:
            'That cache churn is a known downside of write-through too, so it is not what sets write-back apart.',
        },
        {
          id: 'c',
          text: 'Acknowledged writes are lost if the cache fails before they are flushed',
          explanation:
            'Correct. Until the deferred database write happens, the only copy of the change is in the cache.',
        },
        {
          id: 'd',
          text: 'Every write needs two synchronous round trips before it is acknowledged',
          explanation:
            'That describes write-through. Write-back acknowledges after the cache write alone.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-cache-strategies-q4',
      objective: 'sd-cache-strategies-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Reader A misses the cache and reads price = 10 from the database, then pauses. Writer B updates the price to 12 and deletes the cache key. Reader A then writes price = 10 into the cache. What is the result?',
      options: [
        {
          id: 'a',
          text: 'The cache holds the stale 10 until the key is deleted again or its TTL expires',
          explanation:
            'Correct. This is the classic cache-aside race. A TTL bounds how long the stale value can last.',
        },
        {
          id: 'b',
          text: 'Redis rejects reader A’s write because the key was deleted a moment earlier',
          explanation:
            'A plain SET does not know about earlier deletes; it simply creates the key.',
        },
        {
          id: 'c',
          text: 'The cache holds 12, because the delete came after reader A started',
          explanation:
            'The delete happened before A’s write, so nothing removes the old value A wrote.',
        },
        {
          id: 'd',
          text: 'The database rolls back to 10 so that it matches what is in the cache',
          explanation:
            'The cache never writes to the database in cache-aside; the database keeps 12.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-cache-strategies-q5',
      objective: 'sd-cache-strategies-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Cache misses are filled by reading from a read replica. After users edit their profile, the write service deletes the cache key, yet users sometimes see their old profile for many minutes. What is the most likely cause?',
      options: [
        {
          id: 'a',
          text: 'Redis is evicting the profile keys early under its LRU policy',
          explanation:
            'Eviction removes entries, which would cause fresh reloads, not long-lived stale ones.',
        },
        {
          id: 'b',
          text: 'A miss after the delete read the lagging replica and cached the old row',
          explanation:
            'Correct. The delete worked, but the reload came from a replica that had not yet applied the update. Reload from the leader shortly after writes, or keep TTLs short.',
        },
        {
          id: 'c',
          text: 'Redis applies DEL commands lazily, minutes after they are sent',
          explanation:
            'A DEL removes the key when it runs; later reads of that key miss.',
        },
        {
          id: 'd',
          text: 'The profile keys have a TTL that is much too short to be useful',
          explanation:
            'A short TTL would shorten staleness. It cannot explain stale data lasting minutes.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-cache-strategies-q6',
      objective: 'sd-cache-strategies-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'Which situation is a cache stampede?',
      options: [
        {
          id: 'a',
          text: 'The cache runs out of memory and starts evicting older entries',
          explanation:
            'That is normal eviction under memory pressure, not a burst of identical misses.',
        },
        {
          id: 'b',
          text: 'Two writers update the same cache key with different values',
          explanation:
            'That is a write race that can leave stale data, but it does not flood the database.',
        },
        {
          id: 'c',
          text: 'A popular key expires and many requests miss and query the database at once',
          explanation:
            'Correct. Many simultaneous misses for the same entry all fall through to the database.',
        },
        {
          id: 'd',
          text: 'Clients keep retrying immediately after receiving 429 responses',
          explanation:
            'That is a retry storm against a rate limiter, not a burst of cache misses.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-cache-strategies-q7',
      objective: 'sd-cache-strategies-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'The home page data is one cached key built by a 2-second query, with a 60-second TTL. Database CPU spikes sharply every minute. Which change most directly fixes this?',
      options: [
        {
          id: 'a',
          text: 'Let one request rebuild the key under a lock while others get the previous value',
          explanation:
            'Correct. Only one expensive query runs per expiry, and users are not blocked waiting for it.',
        },
        {
          id: 'b',
          text: 'Cut the TTL to 10 seconds so each rebuild has less data to fetch',
          explanation:
            'The query does the same work regardless of TTL; this just makes the spikes six times as frequent.',
        },
        {
          id: 'c',
          text: 'Switch the home page key to a write-back caching policy instead',
          explanation:
            'Write-back changes how writes reach the database. The spikes come from simultaneous read misses.',
        },
        {
          id: 'd',
          text: 'Add more app servers so the misses are spread over more machines',
          explanation:
            'More servers produce more concurrent misses, sending even more identical queries to the database.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-cache-strategies-q8',
      objective: 'sd-cache-strategies-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'At each deploy a warm-up script loads about 50,000 product keys, all with a TTL of exactly 3600 seconds. One hour after every deploy the database is overloaded. What is the best fix?',
      options: [
        {
          id: 'a',
          text: 'Give half the keys a TTL of 1800 seconds and the other half 3600',
          explanation:
            'This only splits one synchronized wave into two; each half still expires at the same moment.',
        },
        {
          id: 'b',
          text: 'Remove TTLs entirely so the warmed keys never expire at all',
          explanation:
            'This removes the spike but also the bound on staleness; missed invalidations would leave data wrong forever.',
        },
        {
          id: 'c',
          text: 'Give the Redis server more memory so fewer of the keys expire',
          explanation:
            'TTL expiry is unrelated to memory. Keys with a TTL expire on time however much memory is free.',
        },
        {
          id: 'd',
          text: 'Add a random jitter to each key’s TTL so expirations spread out',
          explanation:
            'Correct. Randomised TTLs turn one burst of misses into a steady trickle the database can handle.',
        },
      ],
      answer: 'd',
    },
  ],
  scenario: {
    prompt:
      'An online shop runs PostgreSQL with one leader and two read replicas, and has a Redis instance it barely uses. A flash sale is coming. Product pages (name, description, images, price) are read heavily; prices are edited by staff a few times a day and must show up within about a minute; the stock count shown at checkout must never let the shop sell items it does not have. During the last sale the database CPU hit its limit whenever the most popular product’s data was reloaded.\n\nDesign the caching strategy. Say what you cache and how it is loaded, how writes keep the cache acceptably fresh, which races you still accept, and how you stop the reload spikes.',
    modelAnswer:
      '**What to cache.** Product details and price, keyed `product:{id}`. **Not** the stock decision at checkout: it is checked and decremented against the leader database in a transaction, because a stale cached count could oversell. A cached "in stock" badge on the product page is acceptable if it is allowed to be slightly behind.\n\n**Loading.** Cache-aside: read Redis, on a miss load from the database and set the key. Normal misses may read a replica, but for a short window after an edit (for example tracked by a "recently changed" marker in Redis) the reload reads the leader, so replica lag cannot put the old price back.\n\n**Writes.** Staff edits update the leader, then **delete** `product:{id}`. Delete rather than overwrite, so two quick edits cannot leave the older value cached because their cache writes arrived out of order.\n\n**TTL.** Every key gets a TTL of about 60 seconds, the freshness the business asked for, plus a few seconds of random jitter. The TTL is the backstop for the races I accept: a slow reader writing an old value after the delete, or a failed delete. Either one lasts at most a TTL.\n\n**Spikes.** The hot product’s reload is a stampede. Use a **rebuild lock** (`SET lock:product:{id} <token> NX EX 5`): one request reloads; others serve the previous value, kept with a longer hard expiry, or wait briefly. Jitter spreads expiry across keys, and the cache is warmed before the sale starts.\n\n**Why not write-through or write-back.** Write-through would also work for prices, but the delete approach is simpler with replicas in the mix. Write-back is wrong here: losing an acknowledged price change if Redis failed is not acceptable.\n\nOther valid designs might use write-through with a TTL, or request coalescing inside each server instead of a Redis lock. What matters is that freshness is bounded, the checkout decision avoids the cache, and the hot-key reload is controlled.',
    checklist: [
      'Uses a named strategy (such as cache-aside) and says who populates the cache',
      'Invalidates on write (delete or write-through) and keeps a TTL sized to the freshness requirement',
      'Names at least one remaining race (slow reader, replica lag) and how the TTL bounds it',
      'Keeps the correctness-critical stock check off the cache',
      'Prevents the hot-key stampede with a lock, coalescing or serving stale data',
      'Adds TTL jitter or warm-up so many keys do not expire at once',
    ],
  },
  takeaways: [
    'Cache-aside loads entries on demand in application code; read-through does the same inside the cache layer.',
    'Write-through updates cache and database before acknowledging; write-back acknowledges after the cache alone and can lose writes if the cache fails.',
    'Deleting the key on write plus a TTL on every entry is the common baseline; the TTL bounds how long any missed invalidation or race can leave data stale.',
    'Reloading from a lagging replica can put old data back in the cache right after an invalidation.',
    'A cache stampede happens when many requests miss the same key at once; coalescing, a rebuild lock, serving stale data and TTL jitter prevent it.',
  ],
  references: [
    {
      title: 'Caching strategies (ElastiCache)',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html',
      kind: 'source',
    },
    {
      title: 'Caching challenges and strategies',
      publisher: 'Amazon Web Services (AWS Builder Center)',
      url: 'https://builder.aws.com/content/3K9TeXp6strMiJ4vhakpRD7BQWO/caching-challenges-and-strategies',
      kind: 'source',
    },
    {
      title: 'SET (NX and EX options, locking pattern)',
      publisher: 'Redis',
      url: 'https://redis.io/docs/latest/commands/set/',
      kind: 'source',
    },
    {
      title: 'Designing Data-Intensive Applications',
      publisher: 'Martin Kleppmann, O’Reilly',
      url: 'https://dataintensive.net/',
      kind: 'further',
    },
    {
      title: 'Cache (computing): writing policies',
      publisher: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Cache_(computing)',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}

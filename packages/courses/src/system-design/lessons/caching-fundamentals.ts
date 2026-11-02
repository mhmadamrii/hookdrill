import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'caching-fundamentals',
  title: 'Caching Fundamentals',
  summary:
    'A cache keeps copies of data closer to where it is needed so repeated requests skip slow work. Its value depends on the hit rate, and its risk is serving data that is stale or meant for someone else.',
  minutes: 15,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-caching-fundamentals-1',
      text: 'identify where caches sit along a web request path, from the browser to the database, and which of them are private or shared.',
    },
    {
      id: 'sd-caching-fundamentals-2',
      text: 'explain hits, misses and hit rate, and how expiry (TTL) and eviction policies such as LRU decide what stays in a bounded cache.',
    },
    {
      id: 'sd-caching-fundamentals-3',
      text: 'judge whether a piece of data is safe to cache, for how long and where, given how stale it may be and who may see it.',
    },
  ],
  concept: [
    {
      heading: 'Why caching works',
      blocks: [
        {
          type: 'text',
          md: 'Most applications ask the same questions over and over: the same product page, the same user profile, the same list of countries. If answering takes a database query, a computation or a trip across the network, doing it again for every request wastes time and load.\n\nA **cache** stores the answer the first time and hands back the stored copy next time. It is the same idea as keeping your most-used tools on the desk instead of in the cupboard.\n\nTwo facts shape everything else in this lesson:\n\n- **A cache holds copies.** The source of truth lives somewhere else (usually your database), so a cached entry can be thrown away and fetched again. That is what makes eviction safe.\n- **A copy can go out of date.** The moment the source changes, the copy is **stale**. Caching trades some freshness for speed, and your job is to decide how much staleness each piece of data can tolerate.',
        },
      ],
    },
    {
      heading: 'Where caches sit',
      blocks: [
        {
          type: 'text',
          md: "A single page load can pass through several caches:\n\n- **Browser cache.** A **private** cache: it belongs to one user, so it may store personalised responses.\n- **CDN and reverse proxy caches.** **Shared** caches between clients and your servers that serve many users. MDN calls the ones you deploy on purpose (reverse proxies, CDNs) **managed caches**; you control them with `Cache-Control` headers and their own configuration, and many let you purge entries.\n- **Application cache.** An in-memory store such as Redis or Memcached that your server code reads and writes, typically holding database results.\n- **Inside the database.** Databases keep recently used data in memory too, but you rarely manage that directly.\n\nThe most common way to use an application cache is **lazy loading** (also called cache-aside): the app asks the cache first; on a **hit** it returns the stored value; on a **miss** it queries the database, writes the result into the cache and returns it. Only data someone asked for gets cached. Level 2's Cache Strategies lesson compares this with write-through and other patterns.",
        },
        {
          type: 'diagram',
          caption:
            'Caches along one request path: a private browser cache, a shared CDN, and an application cache in front of the database.',
          nodes: [
            {
              id: 'browser',
              label: 'Browser (private)',
              kind: 'client',
              col: 0,
              row: 2,
            },
            {
              id: 'cdn',
              label: 'CDN (shared cache)',
              kind: 'cache',
              col: 1,
              row: 2,
            },
            { id: 'app', label: 'App server', kind: 'service', col: 2, row: 2 },
            {
              id: 'redis',
              label: 'App cache (Redis)',
              kind: 'cache',
              col: 3,
              row: 1,
            },
            { id: 'db', label: 'Database', kind: 'store', col: 3, row: 3 },
          ],
          edges: [
            { from: 'browser', to: 'cdn', label: 'GET /products/42' },
            { from: 'cdn', to: 'app', label: 'on CDN miss' },
            { from: 'app', to: 'redis', label: '1. check cache' },
            { from: 'app', to: 'db', label: '2. on miss, query' },
            {
              from: 'app',
              to: 'redis',
              label: '3. store result',
              dashed: true,
            },
          ],
        },
      ],
    },
    {
      heading: 'Hit rate, expiry and eviction',
      blocks: [
        {
          type: 'text',
          md: "A cache earns its keep through its **hit rate**: hits divided by all lookups (hits plus misses). Redis reports both counters, `keyspace_hits` and `keyspace_misses`, so you can compute it. Every miss still pays the full cost of going to the source, plus the cache check and the write back.\n\nTwo mechanisms remove entries:\n\n- **Expiry (TTL).** A **time to live** on an entry makes it disappear after a set time. Reading an expired key behaves like a miss, so the next request fetches fresh data. A TTL **bounds** how stale data can get; it does not prevent staleness inside that window.\n- **Eviction.** A cache has limited memory. In Redis, `maxmemory` sets the limit and `maxmemory-policy` decides what happens when it is reached. `allkeys-lru` evicts the **least recently used** keys and is Redis's suggested default when some keys are much hotter than others; `allkeys-lfu` evicts the **least frequently used**; `volatile-ttl` evicts keys with the shortest remaining TTL; and `noeviction` evicts nothing and returns errors for commands that would add data, while reads keep working. Redis approximates LRU by sampling keys rather than tracking exact order, to save memory.\n\nOn the HTTP side, MDN describes the same ideas in header form: a response is **fresh** while its age is below `max-age` and **stale** after. A stale response is not necessarily thrown away; the cache can **revalidate** it by asking the server with `If-None-Match` and its `ETag`, and a `304 Not Modified` reply makes the stored copy fresh again without resending the body.",
        },
        {
          type: 'example',
          title: 'Reading a hit rate',
          md: 'Illustrative numbers. A product API serves 1,000 lookups in a minute. 900 are found in Redis (hits) and 100 are not (misses). The hit rate is 900 / (900 + 100) = 90%, and only 100 queries reach the database.\n\nNow suppose a deploy restarts the cache empty. For a while almost every lookup misses, and the database briefly sees close to all 1,000. Nothing is broken, since each miss falls back to the database, but if the database was sized for 100 queries a minute it may struggle. This is why a cold cache after a restart deserves a plan.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Cache hit / miss',
              definition:
                'A hit is a lookup answered from the cache; a miss has to go to the source of truth.',
            },
            {
              term: 'Hit rate',
              definition: 'Hits divided by total lookups (hits plus misses).',
            },
            {
              term: 'TTL (time to live)',
              definition:
                'How long an entry may stay in the cache before it expires and is treated as missing.',
            },
            {
              term: 'Eviction',
              definition:
                'Removing entries to stay within a memory limit, chosen by a policy such as LRU or LFU.',
            },
            {
              term: 'Stale data',
              definition:
                'A cached copy that no longer matches the source, or in HTTP terms a response older than its freshness lifetime.',
            },
            {
              term: 'Private vs shared cache',
              definition:
                'A private cache (the browser) serves one user; a shared cache (proxy, CDN) serves many users from the same stored responses.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Deciding what to cache',
      blocks: [
        {
          type: 'text',
          md: 'For each piece of data, ask three questions:\n\n1. **How often is it read compared with how often it changes?** Data read constantly and changed rarely (a list of countries, a published article) caches well. Data that changes on nearly every read gains little.\n2. **How stale can it be?** A product description that is a few minutes old is harmless. An account balance shown just before a payment is not. The answer sets the TTL, or rules out caching.\n3. **Who may see it?** Responses that are the same for everyone can go in shared caches. Personalised responses must stay out of them, or one user\'s page can be served to another. MDN recommends `Cache-Control: no-cache, private` for such pages, and `no-store` when a response must not be stored at all.\n\nAlso note that a missing `Cache-Control` header does not mean "do not cache": MDN explains that HTTP allows **heuristic caching** of responses without one. Set headers explicitly.',
        },
      ],
    },
  ],
  application: {
    heading: 'Caching in a real product, and its limits',
    blocks: [
      {
        type: 'text',
        md: "A typical store caches in layers: images and scripts at a CDN with long lifetimes, public product pages at the CDN with short lifetimes, product and category data in Redis using lazy loading with a TTL, and logged-in pages marked `private` so only the browser keeps them.\n\nAWS's ElastiCache guidance sums up why lazy loading with a TTL is a common starting point: only requested data is cached, a failed cache node is not fatal because misses fall back to the database, and the TTL keeps data from getting too stale. It is equally clear about the limits:\n\n- **Every miss is slower** than no cache at all: a cache check, a database query and a cache write.\n- **Cached data can be stale** until it expires or is updated.\n- **An empty cache shifts load to the database**, for example after a new node replaces a failed one, until it refills.\n\nOther limits: a cache only helps reads, not writes; memory is bounded, so a working set larger than the cache causes constant eviction; and caching personalised data in a shared layer can leak it. Keeping caches consistent when data changes (invalidation) and protecting the database when many requests miss at once are covered in Level 2.",
      },
    ],
  },
  misconceptions: [
    {
      claim: 'Data in the cache is safe, like data in a second database.',
      correction:
        'A cache holds copies and may evict them at any time to stay within memory, or lose them on restart. Keep the source of truth in a durable store and treat every cache read as possibly missing.',
    },
    {
      claim: 'Setting a TTL means users never see stale data.',
      correction:
        "A TTL only limits how long a stale copy can survive. Inside that window the cache keeps serving the old value after the source changes, as AWS's caching guidance notes.",
    },
    {
      claim:
        'A CDN can safely cache any response, because each URL always returns the same content.',
      correction:
        "Logged-in pages return different content for different users at the same URL. A shared cache could serve one user's page to another, so mark personalised responses `private` or `no-store`.",
    },
  ],
  questions: [
    {
      id: 'sd-caching-fundamentals-q1',
      objective: 'sd-caching-fundamentals-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt: "How is a cache's hit rate calculated?",
      options: [
        {
          id: 'a',
          text: 'Misses divided by hits',
          explanation:
            'This is a ratio of misses to hits, not the share of lookups served from the cache.',
        },
        {
          id: 'b',
          text: 'Hits divided by the number of keys stored',
          explanation:
            'The number of stored keys is about size, not about how many lookups succeeded.',
        },
        {
          id: 'c',
          text: 'Evicted keys divided by hits',
          explanation:
            'Evictions are a separate signal about memory pressure; they are not part of the hit rate.',
        },
        {
          id: 'd',
          text: 'Hits divided by hits plus misses',
          explanation:
            'Correct. The hit rate is the share of all lookups that the cache answered.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-caching-fundamentals-q2',
      objective: 'sd-caching-fundamentals-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'In HTTP caching terms, which of these is a private cache?',
      options: [
        {
          id: 'a',
          text: 'A CDN edge server near the user',
          explanation:
            'A CDN serves many users from the same stored responses, so it is a shared cache.',
        },
        {
          id: 'b',
          text: "The user's browser cache",
          explanation:
            'Correct. The browser cache belongs to one user, so it may store personalised responses.',
        },
        {
          id: 'c',
          text: 'A reverse proxy in front of the servers',
          explanation:
            'A reverse proxy serves every user who reaches the site, so it is a shared cache.',
        },
        {
          id: 'd',
          text: 'A proxy at the edge of a company network',
          explanation:
            'A company proxy serves all employees behind it, so it is a shared cache.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-caching-fundamentals-q3',
      objective: 'sd-caching-fundamentals-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A Redis instance has reached its `maxmemory` limit and uses the `noeviction` policy. What happens when the app runs a command that adds new data?',
      options: [
        {
          id: 'a',
          text: 'Redis evicts the least recently used key to make room',
          explanation:
            'That is `allkeys-lru`. With `noeviction`, no keys are removed.',
        },
        {
          id: 'b',
          text: 'Redis writes the new key to disk instead of memory',
          explanation:
            'Redis does not spill new keys to disk when memory is full; the policy decides the outcome.',
        },
        {
          id: 'c',
          text: 'Redis returns an error, while reads keep working',
          explanation:
            'Correct. Under `noeviction`, commands that would add data fail with an error, and commands that only read existing data work as normal.',
        },
        {
          id: 'd',
          text: 'Redis accepts the command and silently discards it',
          explanation:
            'Redis reports the failure to the client; it does not pretend the write succeeded.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-caching-fundamentals-q4',
      objective: 'sd-caching-fundamentals-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Under an LRU (least recently used) eviction policy, which entry is the first candidate for eviction?',
      options: [
        {
          id: 'a',
          text: 'The entry that has gone the longest since it was last accessed',
          explanation:
            'Correct. LRU evicts what has not been used for the longest time, betting that recently used data will be used again.',
        },
        {
          id: 'b',
          text: 'The entry that has been accessed the fewest times overall',
          explanation:
            'Counting accesses describes LFU (least frequently used), a different policy.',
        },
        {
          id: 'c',
          text: 'The entry with the shortest remaining time to live',
          explanation:
            "That describes a TTL-based policy such as Redis's `volatile-ttl`, not LRU.",
        },
        {
          id: 'd',
          text: 'The entry that takes up the most memory',
          explanation: 'LRU looks at recency of access, not entry size.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-caching-fundamentals-q5',
      objective: 'sd-caching-fundamentals-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A browser holds a response sent with `Cache-Control: max-age=3600` and an `ETag`. Two hours later the user requests it again. Which statement is accurate?',
      options: [
        {
          id: 'a',
          text: 'It is fresh for another hour, because each reuse restarts its `max-age`',
          explanation:
            'Reusing a stored response does not reset its age. After two hours it is past its 3,600-second freshness lifetime, so it is stale.',
        },
        {
          id: 'b',
          text: 'It is stale; the browser can revalidate, and a 304 makes it fresh again',
          explanation:
            'Correct. After an hour the response is stale. The browser sends `If-None-Match` with the ETag, and if nothing changed, `304 Not Modified` lets it reuse the stored copy.',
        },
        {
          id: 'c',
          text: 'It is still fresh, because a response with an ETag never goes stale',
          explanation:
            'An ETag is a validator for checking changes, not something that extends freshness.',
        },
        {
          id: 'd',
          text: 'It is stale and must be deleted and fully downloaded again',
          explanation:
            'Stale responses can be revalidated instead of re-downloaded; only a changed resource needs a full `200` response.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-caching-fundamentals-q6',
      objective: 'sd-caching-fundamentals-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Your "My orders" page HTML shows the logged-in user\'s name and order history, and your site sits behind a CDN. Which response header best keeps it out of shared caches while letting the browser reuse it after revalidating?',
      options: [
        {
          id: 'a',
          text: '`Cache-Control: public, max-age=86400`',
          explanation:
            '`public` with a day-long lifetime invites shared caches to store the page and serve it to other users.',
        },
        {
          id: 'b',
          text: '`Cache-Control: max-age=3600` with no other directives',
          explanation:
            "Without `private`, shared caches may store the page, so one user's orders could be served to another.",
        },
        {
          id: 'c',
          text: '`Cache-Control: no-cache, private`',
          explanation:
            'Correct. `private` keeps it out of shared caches, and `no-cache` makes the browser check with the server before each reuse. MDN recommends this for personalised pages.',
        },
        {
          id: 'd',
          text: 'No `Cache-Control` header, since caches skip such responses',
          explanation:
            'HTTP allows heuristic caching of responses without `Cache-Control`, so leaving it out is not a safe way to prevent caching.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-caching-fundamentals-q7',
      objective: 'sd-caching-fundamentals-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'You plan to cache data for 10 minutes in a shared application cache. Which item is the worst candidate?',
      options: [
        {
          id: 'a',
          text: "A user's available balance, shown just before they confirm a payment",
          explanation:
            'Correct. It changes with every transaction and a stale value can lead to a wrong payment decision, so 10 minutes of staleness is not acceptable.',
        },
        {
          id: 'b',
          text: 'The list of countries shown on the signup form',
          explanation:
            'It is read constantly and almost never changes, which makes it an ideal cache candidate.',
        },
        {
          id: 'c',
          text: 'A product description that editors update a few times a month',
          explanation:
            'A description up to 10 minutes old is harmless, and it is read far more often than it changes.',
        },
        {
          id: 'd',
          text: 'A published public blog post',
          explanation:
            'Public content that rarely changes is safe to cache and identical for every user.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-caching-fundamentals-q8',
      objective: 'sd-caching-fundamentals-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Your app uses lazy loading (cache-aside) with Redis. A failed cache node is replaced by a new, empty one. What happens next?',
      options: [
        {
          id: 'a',
          text: 'The app returns errors until someone reloads the cache by hand',
          explanation:
            'With lazy loading, a miss falls back to the database, so the app keeps working.',
        },
        {
          id: 'b',
          text: 'The new node serves stale values copied from the failed node',
          explanation:
            'The replacement node starts empty; nothing is copied from the failed one in this setup.',
        },
        {
          id: 'c',
          text: 'Nothing changes, because the cache copies the database at startup',
          explanation:
            'A lazy-loading cache fills only as data is requested; it does not preload the database.',
        },
        {
          id: 'd',
          text: 'Misses go to the database, so latency and load rise until it refills',
          explanation:
            'Correct. Each miss queries the database and writes the result back, so the cache warms up over time while the database carries more load.',
        },
      ],
      answer: 'd',
    },
  ],
  scenario: {
    prompt:
      'You run a news site. Pages: the homepage (top stories, changes every few minutes, same for everyone), article pages (rarely edited after publishing, but editors sometimes fix an error in a breaking story), a logged-in "Saved articles" page, and a live comment count shown under each article. Images and scripts never change once deployed (their filenames include a content hash). Traffic spikes sharply when a big story breaks.\n\nPropose a caching plan: what you cache, where (browser, CDN, application cache), roughly how long, and what you do not cache. Explain the staleness you are accepting for each item and one risk in your plan.',
    modelAnswer:
      'Go item by item, asking how often it is read, how stale it can be, and who may see it. Durations below are illustrative.\n\n**Images and scripts:** cache in the browser and CDN for a long time. Their URLs change whenever their content does, so a long lifetime never serves the wrong file.\n\n**Article pages:** cache at the CDN with a short lifetime (a few minutes) and revalidation with an `ETag`, so most readers during a spike are served by the CDN. Accepted staleness: a correction may take up to the lifetime to appear; if the CDN supports purging, purge the article URL when an editor saves a fix.\n\n**Homepage:** same for everyone, so cache at the CDN, with a shorter lifetime (around a minute) because top stories change often. Accepted staleness: a new story appears up to a minute late.\n\n**Article data behind the pages:** lazy loading in Redis with a TTL so CDN misses do not all hit the database.\n\n**"Saved articles":** personalised, so `Cache-Control: no-cache, private`. Never in the CDN or a shared cache keyed only by URL.\n\n**Comment count:** read constantly but changes often. Either cache it for a few seconds in Redis (a slightly old count is acceptable) or leave it uncached if exact counts matter to the product.\n\n**Risk:** when the cache is cold (after a deploy, or when a brand-new story spikes before it is cached), many requests miss at once and reach the database. Mitigations include keeping CDN lifetimes non-zero during spikes and sizing the database for some miss traffic; Level 2 covers stampede protection. Other plans are valid if they justify each duration by staleness tolerance and keep personalised content out of shared caches.',
    checklist: [
      'Places each item in a specific layer (browser, CDN, application cache) or excludes it',
      'Justifies each TTL by how stale that item may acceptably be',
      'Keeps personalised pages out of shared caches with `private` or `no-store`',
      'Uses long lifetimes only where content cannot change at the same URL',
      'Names a risk such as a cold cache, stale corrections or database load on misses',
    ],
  },
  takeaways: [
    'A cache stores copies of data closer to where they are used, so entries can be evicted and may be stale.',
    'Caches sit at several layers: the private browser cache, shared CDNs and proxies, and application caches such as Redis.',
    'Hit rate (hits divided by all lookups) decides how much a cache helps, and every miss still pays the full cost.',
    'TTLs limit how stale data can get, and eviction policies such as LRU decide what leaves a full cache.',
    'Cache data that is read often, tolerates some staleness, and is safe for whoever shares that cache layer.',
  ],
  references: [
    {
      title: 'HTTP caching',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching',
      kind: 'source',
    },
    {
      title: 'Key eviction',
      publisher: 'Redis',
      url: 'https://redis.io/docs/latest/develop/reference/eviction/',
      kind: 'source',
    },
    {
      title: 'Caching strategies (Amazon ElastiCache)',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}

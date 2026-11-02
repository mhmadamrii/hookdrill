import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'rate-limiting',
  title: 'Rate Limiting',
  summary:
    'A rate limiter caps how much work each client can ask for, so one buggy script or abusive user cannot slow the service for everyone. You choose who to count, an algorithm that decides how bursts are treated, and where the shared counters live.',
  minutes: 17,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-rate-limiting-1',
      text: 'explain why a service rate limits, and decide what to limit (request rate or concurrent requests), which key to count by, and where in the request path to enforce it.',
    },
    {
      id: 'sd-rate-limiting-2',
      text: 'compare fixed window, sliding window and token bucket limiters, and predict how each one treats a burst of requests.',
    },
    {
      id: 'sd-rate-limiting-3',
      text: 'design how a limiter answers rejected requests and shares its counters across many servers, using 429 responses, Retry-After and atomic operations in a shared store.',
    },
  ],
  concept: [
    {
      heading: 'One noisy client should not sink everyone',
      blocks: [
        {
          type: 'text',
          md: 'Every server has a ceiling: so many CPU cores, so many database connections, so many worker threads. Without limits, those resources go to whoever asks fastest. A customer with a retry loop that has no delay, a scraper, or a script someone forgot to stop can use up the capacity that every other user needs.\n\nA **rate limiter** sits in front of the work and asks one question for each request: has this client already used its share? If yes, the request is rejected cheaply, before it touches the database. If no, it goes through.\n\nRate limiting serves several goals at once:\n\n- **Protection:** a bug or attack from one client cannot overload shared resources.\n- **Fairness:** each customer gets a predictable share instead of a race.\n- **Cost control:** expensive endpoints, or calls to paid third-party APIs, stay within budget.\n- **Product tiers:** a free plan and a paid plan can have different limits.\n\nYou met shared caches such as Redis in Caching Fundamentals. Rate limiters reuse that idea: the counters that track each client usually live in a fast shared store, so every server sees the same count.',
        },
      ],
    },
    {
      heading: 'Who to count, what to count, and how',
      blocks: [
        {
          type: 'text',
          md: 'Designing a limiter means answering three questions.\n\n**1. Which key?** The key decides whose requests are counted together. Common keys are the **API key** or **user id** for authenticated traffic and the **client IP address** for anonymous traffic. IP addresses are a rough proxy: many people behind one office or mobile network can share an IP, and one attacker can spread requests across many IPs. Keys can be combined, for example per user per endpoint.\n\n**2. What to limit?** Usually **requests per unit of time**. For slow, expensive endpoints, the number of requests **in progress at the same time** (a concurrency limit) can matter more than the rate.\n\n**3. Which algorithm?** The common ones differ in how they treat bursts:\n\n- **Fixed window counter:** count requests in fixed intervals (for example each calendar minute) and reject once the count passes the limit. It is cheap: one counter per key per window. Its flaw is the boundary: a client can send a full allowance at the end of one window and another full allowance at the start of the next, so up to **twice the limit** can arrive in a short span.\n- **Sliding window log:** store a timestamp for every accepted request and count those inside the last N seconds. It is exact, but it stores one entry per request.\n- **Sliding window counter:** keep the counts for the current and previous fixed windows, and estimate the rolling count by weighting the previous window by how much of it still overlaps. It smooths the boundary problem at the cost of being an approximation.\n- **Token bucket:** each key has a bucket that holds up to **B** tokens and refills at **r** tokens per second. Each request takes a token; with no token, the request is rejected. A client that has been idle can send a burst of up to B requests, but over time it cannot average more than r per second.\n- **Leaky bucket:** requests join a queue that drains at a fixed rate, and new requests are dropped when the queue is full. The output is smooth, but bursts wait in the queue instead of being served at once.',
        },
        {
          type: 'example',
          title: 'A token bucket, second by second',
          md: 'Illustrative numbers: a bucket with capacity **B = 10** that refills at **r = 1 token per second**.\n\n- The client has been idle, so the bucket is full with 10 tokens.\n- At t = 0 it sends 12 requests at once. The first 10 take a token each and pass; the last 2 find the bucket empty and are rejected.\n- At t = 1 one token has refilled, so one more request can pass.\n- If the client then sends one request per second, each finds the token that just refilled. It can keep that pace forever.\n- If it pauses for 10 seconds, the bucket fills back up to 10 and it can burst again.\n\nCapacity sets the **largest burst**; refill rate sets the **long-run average**. Choosing them separately is what makes the token bucket a good fit for real clients, which tend to be bursty.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Rate limit',
              definition:
                'A cap on how many requests a client, identified by some key, may make in a period of time.',
            },
            {
              term: 'Limiter key',
              definition:
                'The value requests are grouped by when counting, such as an API key, user id or IP address.',
            },
            {
              term: 'Token bucket',
              definition:
                'A limiter where each key holds up to B tokens that refill at r per second; each request spends one token. B bounds bursts, r bounds the average rate.',
            },
            {
              term: 'Fixed window counter',
              definition:
                'A limiter that counts requests per fixed interval and resets the count when the interval ends. Cheap, but allows up to twice the limit around a window boundary.',
            },
            {
              term: 'Concurrency limit',
              definition:
                'A cap on how many of a client’s requests may be in progress at the same moment, regardless of how fast they arrive.',
            },
            {
              term: '429 Too Many Requests',
              definition:
                'The HTTP status code defined for rate limiting: the client sent too many requests in a given amount of time.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Where the limiter runs and how it answers',
      blocks: [
        {
          type: 'diagram',
          caption:
            'The limiter checks a shared counter store before any real work happens. Allowed requests continue to the API service; rejected ones get a 429 straight back.',
          nodes: [
            {
              id: 'client',
              label: 'API client',
              kind: 'client',
              col: 0,
              row: 2,
            },
            {
              id: 'lb',
              label: 'Gateway / LB',
              kind: 'balancer',
              col: 1,
              row: 2,
            },
            {
              id: 'limiter',
              label: 'Rate limiter',
              kind: 'service',
              col: 2,
              row: 2,
            },
            {
              id: 'redis',
              label: 'Counter store (Redis)',
              kind: 'cache',
              col: 2,
              row: 4,
            },
            {
              id: 'api',
              label: 'API service',
              kind: 'service',
              col: 3,
              row: 2,
            },
            { id: 'db', label: 'Database', kind: 'store', col: 4, row: 2 },
          ],
          edges: [
            { from: 'client', to: 'lb', label: 'request + API key' },
            { from: 'lb', to: 'limiter', label: 'check' },
            { from: 'limiter', to: 'redis', label: 'atomic take/incr' },
            { from: 'limiter', to: 'api', label: 'allowed' },
            { from: 'api', to: 'db', label: 'query' },
            {
              from: 'limiter',
              to: 'client',
              label: '429 + Retry-After',
              dashed: true,
            },
          ],
        },
        {
          type: 'text',
          md: '**Answering a rejected request.** RFC 6585 defines **`429 Too Many Requests`** for exactly this case. The response should explain the condition and *may* carry a **`Retry-After`** header saying how long to wait, either as a number of seconds or as an HTTP date. The same RFC says caches **must not store** 429 responses, so a CDN will not keep serving a rejection after the limit has reset. The RFC deliberately leaves *how* you count to you: per resource or per server, by credentials or by cookie.\n\nThere is also an IETF **draft** (not yet an RFC) that proposes standard `RateLimit` and `RateLimit-Policy` response headers to tell clients their quota and what remains. Some APIs send similar headers of their own; treat the exact names as API-specific until the draft is published.\n\n**Sharing state across servers.** If each of N app servers keeps its own in-memory counter and the load balancer spreads a client across all of them, the client can get roughly **N times** the limit. The usual fix is a shared store such as Redis, where every server updates the same counter.\n\nThe update must be **atomic**. Redis `INCR` increments a counter atomically, and the Redis docs show a rate limiter built on it. They also point out a trap: if you `INCR` a key and set its expiry with a separate `EXPIRE` call only when the count is 1, a crash between the two leaves a counter with no expiry. The fix is to send both in one `MULTI`/`EXEC` transaction or a single Lua script, so they happen together.\n\n**Where to enforce.** Limits can run at the edge (CDN or web application firewall, good for per-IP limits on anonymous traffic), in an API gateway, or in application middleware (good for limits that need the user, plan or endpoint). Larger systems layer several.',
        },
        {
          type: 'note',
          md: 'Shared counters are usually close to exact, not perfectly exact. Cloudflare’s documentation, for example, says its counters can lag by a few seconds and are scoped per data center, so some excess requests can reach the origin before enforcement starts. Design for a limit that is approximately right.',
        },
      ],
    },
    {
      heading: 'Rate limiting in real systems',
      blocks: [
        {
          type: 'text',
          md: '- **Stripe** describes running several limiters together: a **request rate limiter** per user built on the token bucket algorithm, a **concurrent requests limiter** that caps how many requests are in flight at once, and two **load shedders** that protect overall capacity by rejecting less critical traffic first. Its limiters are implemented on Redis. Stripe answers per-user limits with 429 and uses 503 when it sheds load for the whole fleet.\n- **Amazon API Gateway** throttles with a token bucket where one token is one request. Its *rate* setting is how many tokens are added per second and its *burst* setting is the bucket capacity. AWS says these limits are applied on a best-effort basis and should be treated as targets, not guaranteed ceilings.\n- **Cloudflare rate limiting rules** count matching requests by characteristics such as IP address, and on higher plans by headers, cookies, path or other values, then block or challenge clients over the limit for a mitigation period.\n- **Google’s SRE book** describes per-customer quotas, client-side throttling where clients stop sending requests that are likely to be rejected, and retry budgets so that retries do not multiply load during an overload.',
        },
      ],
    },
  ],
  application: {
    heading: 'Layering limits on a public API, and where they fall short',
    blocks: [
      {
        type: 'text',
        md: 'A typical public API combines a few limits, each answering a different threat:\n\n1. **At the edge, per IP:** a generous limit on anonymous traffic to absorb floods before they reach your servers.\n2. **In the API, per API key:** a token bucket per customer, with burst and rate set by plan. This is the limit customers see and plan around.\n3. **Per endpoint:** tighter limits, or a concurrency limit, on expensive endpoints such as search or report generation.\n4. **Global load shedding:** when the whole system is near capacity, reject low-priority work first.\n\nLimits to keep in mind:\n\n- **Per-client limits do not cap total load.** The SRE book notes that quotas can add up to more than total capacity, because not every customer hits its limit at once. When they do, you still need load shedding.\n- **IP keys are blunt.** They can punish many legitimate users behind one shared address and miss an attacker who rotates addresses.\n- **The counter store is now a dependency.** If Redis is down, you must choose: **fail open** (let traffic through, risk overload) or **fail closed** (reject everything, certain outage). Many teams fail open for ordinary limits; the right choice depends on what the limit protects.\n- **Clients must cooperate.** A client that retries a 429 immediately makes things worse. Document limits, send `Retry-After`, and ask clients to back off with jitter.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'With per-customer rate limits in place, the service can no longer be overloaded.',
      correction:
        'Each customer can be under its own limit while the sum still exceeds capacity, because limits are usually set so that they add up to more than the system can serve at once. Per-client limits give fairness; protecting total capacity also needs load shedding.',
    },
    {
      claim:
        'A fixed window limit of 100 requests per minute means no client ever gets more than 100 requests through in any 60 seconds.',
      correction:
        'A fixed window resets on the boundary. A client can send 100 at the end of one minute and 100 at the start of the next, getting about 200 through in a few seconds. Sliding windows and token buckets avoid this.',
    },
    {
      claim:
        'Each app server can keep its own in-memory counter; the limit works the same.',
      correction:
        'With N servers behind a load balancer, a client spread across all of them can get roughly N times the limit. Counters that must hold across servers belong in a shared store updated atomically.',
    },
  ],
  questions: [
    {
      id: 'sd-rate-limiting-q1',
      objective: 'sd-rate-limiting-3',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which HTTP status code is defined for a client that has sent too many requests in a given amount of time?',
      options: [
        {
          id: 'a',
          text: '403 Forbidden',
          explanation:
            '403 means the server refuses the request regardless of timing, typically for lack of permission. Waiting would not help, which is the wrong message for a rate limit.',
        },
        {
          id: 'b',
          text: '429 Too Many Requests',
          explanation:
            'Correct. RFC 6585 defines 429 for rate limiting, optionally with a Retry-After header.',
        },
        {
          id: 'c',
          text: '503 Service Unavailable',
          explanation:
            '503 says the server as a whole cannot handle requests right now. Some systems use it when shedding load, but it does not say this client exceeded its own limit.',
        },
        {
          id: 'd',
          text: '413 Content Too Large',
          explanation:
            '413 is about the size of one request body, not about how many requests arrived.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-rate-limiting-q2',
      objective: 'sd-rate-limiting-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'In a token bucket limiter, what does the bucket capacity control?',
      options: [
        {
          id: 'a',
          text: 'The average request rate a client can sustain over a long period',
          explanation:
            'The long-run average is set by the refill rate, not the capacity.',
        },
        {
          id: 'b',
          text: 'How long a client stays blocked after it runs out of tokens',
          explanation:
            'There is no separate block period in a basic token bucket; a request passes as soon as a token has refilled.',
        },
        {
          id: 'c',
          text: 'How many servers can share the same bucket for one client key',
          explanation:
            'Sharing is a storage decision (a shared store like Redis), unrelated to the bucket size.',
        },
        {
          id: 'd',
          text: 'The largest burst a client can send at once after being idle',
          explanation:
            'Correct. An idle client accumulates up to B tokens and can spend them all at once. Amazon API Gateway calls this setting the burst.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-rate-limiting-q3',
      objective: 'sd-rate-limiting-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why do authenticated public APIs usually key their main rate limit on the API key rather than the client IP address?',
      options: [
        {
          id: 'a',
          text: 'Many users can share one IP and one client can use many IPs, while a key maps to one account',
          explanation:
            'Correct. Shared networks make IP limits punish innocent users, and rotating addresses evades them. The API key identifies the customer the limit is meant for.',
        },
        {
          id: 'b',
          text: 'Servers behind a load balancer have no way to learn the client IP address at all',
          explanation:
            'Load balancers and proxies commonly pass the client address along in a header such as X-Forwarded-For, so IP keys are possible.',
        },
        {
          id: 'c',
          text: 'The HTTP specification for 429 requires limits to be counted per API key',
          explanation:
            'RFC 6585 deliberately does not specify how to identify or count clients; that is left to the server.',
        },
        {
          id: 'd',
          text: 'Counting by API key needs no stored state, unlike counting by IP address',
          explanation:
            'Both need a counter per key. The choice of key does not remove the need for state.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-rate-limiting-q4',
      objective: 'sd-rate-limiting-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A fixed window limiter allows 100 requests per calendar minute. A client sends 100 requests at 12:00:59 and 100 more at 12:01:00. What happens?',
      options: [
        {
          id: 'a',
          text: 'The second batch is rejected because 200 requests arrived within two seconds',
          explanation:
            'A fixed window does not look across the boundary. It only counts within the current minute, which has just reset.',
        },
        {
          id: 'b',
          text: 'The first batch is rejected because it arrived too close to the window boundary',
          explanation:
            'The first batch is the first 100 requests of the 12:00 window, so it is within the limit.',
        },
        {
          id: 'c',
          text: 'All 200 pass, because each batch falls in a different window with its own count',
          explanation:
            'Correct. This is the boundary weakness of fixed windows: up to twice the limit can pass in a short span.',
        },
        {
          id: 'd',
          text: 'Only 100 pass in total, because the limiter averages the two neighbouring windows',
          explanation:
            'Weighting the previous window is what a sliding window counter does, not a fixed window counter.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-rate-limiting-q5',
      objective: 'sd-rate-limiting-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Four app servers sit behind a round-robin load balancer. Each enforces "100 requests per minute per user" with its own in-memory counter. About how many requests per minute can one user get through?',
      options: [
        {
          id: 'a',
          text: 'About 100, because every server applies the same limit to the user',
          explanation:
            'Each server only sees its own share of the traffic, so none of them sees the user’s full count.',
        },
        {
          id: 'b',
          text: 'About 25, because each server allows a quarter of the limit',
          explanation:
            'Each server allows the full 100, not a quarter; nothing divides the limit between them.',
        },
        {
          id: 'c',
          text: 'Up to about 400, because each server counts only the requests it sees',
          explanation:
            'Correct. Round-robin gives each server about a quarter of the traffic, so each can accept 100 before blocking. A shared counter store fixes this.',
        },
        {
          id: 'd',
          text: 'No limit at all, because in-memory counters reset on every request',
          explanation:
            'In-memory counters persist between requests on the same server; they just are not shared across servers.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-rate-limiting-q6',
      objective: 'sd-rate-limiting-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Your limiter runs `INCR user:42` and then, as a separate command, `EXPIRE user:42 60` only when the result is 1. A server crashes between the two commands. What is the risk?',
      options: [
        {
          id: 'a',
          text: 'The counter has no expiry, so it never resets and the user can end up blocked indefinitely',
          explanation:
            'Correct. The Redis docs describe this race. Sending INCR and EXPIRE together in MULTI/EXEC or one Lua script prevents it.',
        },
        {
          id: 'b',
          text: 'Redis refuses later INCR commands on any key that has no expiry set',
          explanation:
            'INCR works on keys with or without a time to live; Redis does not require an expiry.',
        },
        {
          id: 'c',
          text: 'The counter is reset to zero, so the user gets a fresh allowance early',
          explanation:
            'Nothing resets the counter. The problem is the opposite: without an expiry, it never resets.',
        },
        {
          id: 'd',
          text: 'Two different users start sharing the same counter key from then on',
          explanation:
            'The key name is per user and does not change, so a crash cannot merge two users’ counters.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-rate-limiting-q7',
      objective: 'sd-rate-limiting-1',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A report endpoint takes up to 30 seconds per request. A few clients start dozens of reports at once and tie up every worker, even though each sends only a few requests per minute. Which limit addresses this most directly?',
      options: [
        {
          id: 'a',
          text: 'Lower the per-second request limit on every endpoint for all clients',
          explanation:
            'These clients already send few requests per second. A lower rate limit hurts everyone and does not cap how many slow requests run at once.',
        },
        {
          id: 'b',
          text: 'Raise the token bucket capacity so the bursts are absorbed smoothly',
          explanation:
            'A bigger bucket allows larger bursts, which lets even more slow reports start together.',
        },
        {
          id: 'c',
          text: 'Add a Retry-After header to every successful report response',
          explanation:
            'Retry-After is guidance on a rejected response. It does nothing to stop requests that are already running.',
        },
        {
          id: 'd',
          text: 'A per-client concurrency limit on reports that are in progress at once',
          explanation:
            'Correct. The scarce resource is workers held for a long time, so cap in-flight requests per client. Stripe runs this kind of concurrent requests limiter.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-rate-limiting-q8',
      objective: 'sd-rate-limiting-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A mobile app legitimately sends about 20 requests when it opens, then about one every few seconds. You want to allow that but cap the sustained rate at 1 request per second. Which configuration fits?',
      options: [
        {
          id: 'a',
          text: 'A fixed window that allows 1 request in each one-second window',
          explanation:
            'This rejects 19 of the 20 launch requests, breaking normal app start-up.',
        },
        {
          id: 'b',
          text: 'A token bucket that refills 1 token per second with a capacity of 20',
          explanation:
            'Correct. A full bucket covers the launch burst of 20, and the refill rate holds the long-run average to 1 per second.',
        },
        {
          id: 'c',
          text: 'A token bucket that refills 20 tokens per second with a capacity of 1',
          explanation:
            'This swaps the two settings: it allows a sustained 20 requests per second and no real burst.',
        },
        {
          id: 'd',
          text: 'A sliding window log that allows 1 request in any rolling second',
          explanation:
            'A rolling one-per-second limit is exact but still rejects most of the launch burst.',
        },
      ],
      answer: 'b',
    },
  ],
  scenario: {
    prompt:
      'You run a SaaS product with a public REST API on a free plan and a paid plan. Three app servers sit behind a load balancer, and Redis is already used as a cache. Last week a free-plan customer’s script called `GET /search` in a tight loop. Search queries are heavy, the database slowed down, and every customer saw timeouts.\n\nDesign rate limiting for this API. Decide what you count and by which key, which algorithm and settings you would use (illustrative numbers are fine), where the check runs and where the counters live, what a rejected client receives, and what happens if Redis is unavailable.',
    modelAnswer:
      'A good design limits each customer, gives heavy endpoints their own tighter limit, and keeps the counters shared.\n\n**Key.** Authenticated requests are counted by **API key**, so the limit follows the customer and is not confused by shared or rotating IPs. Unauthenticated requests (for example the login endpoint) fall back to the client IP with a stricter limit.\n\n**Algorithm and settings.** A **token bucket** per API key, because real clients are bursty. Illustrative settings: free plan refills 5 tokens per second with a capacity of 20; paid plan refills 50 per second with a capacity of 200. Search gets an extra, tighter bucket per key (say 1 per second, capacity 5 on free), plus a **concurrency limit** of a few in-flight searches per key, because one slow search holds database resources for a long time.\n\n**Where.** The check runs in API middleware before any handler work, since it needs the API key and plan. A generous per-IP limit at the edge or load balancer catches floods earlier. Counters live in **Redis**, shared by all three servers; per-server memory would let a client get about three times its limit. The token update runs as one **Lua script** so reading, refilling and taking a token are atomic.\n\n**Rejection.** Return **429 Too Many Requests** with **Retry-After** set to the time until the next token. Optionally include remaining-quota headers, documented as our own until the IETF RateLimit headers draft becomes a standard. Document the limits and ask clients to back off with jitter instead of retrying immediately.\n\n**Redis outage.** Choose deliberately. Here I would **fail open** for the general limit (an outage of the limiter should not become an outage of the API) but keep a small in-memory fallback limit per server on search, so the heaviest endpoint stays protected. Alert when the limiter fails open.\n\n**Beyond per-client limits.** Per-key limits do not cap total load. If many customers are busy at once, a global load shedder that rejects low-priority traffic first is the next layer.\n\nOther answers can be just as valid: a sliding window counter instead of a token bucket, enforcement in an API gateway, or failing closed for a security-sensitive endpoint, as long as the trade-offs are stated.',
    checklist: [
      'Counts authenticated traffic by API key or account, with IP only as a fallback for anonymous traffic',
      'Picks an algorithm and explains how it treats bursts (for example token bucket capacity versus refill rate)',
      'Gives the expensive search endpoint its own tighter limit or a concurrency limit',
      'Keeps counters in a shared store with atomic updates so the limit holds across all servers',
      'Returns 429 with Retry-After and expects clients to back off',
      'Decides explicitly between failing open and failing closed when the counter store is down',
    ],
  },
  takeaways: [
    'A rate limiter rejects a client’s excess requests cheaply, before they consume shared resources, which gives protection and fairness.',
    'The limiter key decides whose requests count together; API keys or user ids are more precise than IP addresses for authenticated traffic.',
    'Fixed windows are cheap but let up to twice the limit through at a boundary; token buckets allow bursts up to their capacity while capping the long-run average at the refill rate.',
    'Across many servers, counters must live in a shared store and be updated atomically, or each server enforces its own copy of the limit.',
    'Rejected requests get 429 Too Many Requests, ideally with Retry-After, and well-behaved clients back off instead of retrying at once.',
    'Per-client limits do not cap total load, so large systems add concurrency limits and load shedding on top.',
  ],
  references: [
    {
      title:
        'RFC 6585: Additional HTTP Status Codes (section 4, 429 Too Many Requests)',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc6585',
      kind: 'source',
    },
    {
      title: '429 Too Many Requests',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
      kind: 'source',
    },
    {
      title: 'Scaling your API with rate limiters',
      publisher: 'Stripe',
      url: 'https://stripe.com/blog/rate-limiters',
      kind: 'source',
    },
    {
      title:
        'Throttle requests to your REST APIs for better throughput in API Gateway',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html',
      kind: 'source',
    },
    {
      title: 'INCR (rate limiter pattern)',
      publisher: 'Redis',
      url: 'https://redis.io/docs/latest/commands/incr/',
      kind: 'source',
    },
    {
      title: 'Rate limiting rules',
      publisher: 'Cloudflare',
      url: 'https://developers.cloudflare.com/waf/rate-limiting-rules/',
      kind: 'source',
    },
    {
      title: 'Site Reliability Engineering, chapter 21: Handling Overload',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/handling-overload/',
      kind: 'source',
    },
    {
      title:
        'RateLimit header fields for HTTP (Internet-Draft, not yet an RFC)',
      publisher: 'IETF HTTPAPI Working Group',
      url: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}

import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'fault-tolerance',
  title: 'Fault Tolerance',
  summary:
    'Dependencies fail and slow down. Timeouts, careful retries, circuit breakers, load shedding and graceful degradation keep one failing part from taking the whole system down.',
  minutes: 19,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-fault-tolerance-1',
      text: 'set timeouts and design retries with limits, capped exponential backoff and jitter, and explain what each piece is for.',
    },
    {
      id: 'sd-fault-tolerance-2',
      text: 'explain how retries and slow dependencies turn a small failure into a cascading one, and how retry budgets, circuit breakers and load shedding contain it.',
    },
    {
      id: 'sd-fault-tolerance-3',
      text: 'choose a graceful-degradation strategy that keeps the core of a product working when a dependency fails.',
    },
  ],
  concept: [
    {
      heading: 'Failure is normal; spreading it is optional',
      blocks: [
        {
          type: 'text',
          md: "Once a request crosses several services, a database and a third-party API, something on that path will eventually be broken or slow. You cannot prevent that. What you can control is whether a fault in one part stays there or spreads.\n\nA **slow** dependency is often more dangerous than a dead one. A dead service fails fast with a connection error. A slow one holds your threads, connections and memory while you wait, and requests pile up behind it. Soon your service is also slow, and its callers start piling up too. Google's SRE book calls this a **cascading failure**: a failure that grows over time through positive feedback, where each failing part makes the next more likely to fail.\n\nFault tolerance is a toolkit for breaking that feedback loop:\n\n- **Timeouts** stop you waiting forever.\n- **Retries**, done carefully, ride out brief glitches.\n- **Circuit breakers** stop you calling something that is clearly down.\n- **Load shedding** and **graceful degradation** keep you doing useful work when you cannot do all of it.",
        },
      ],
    },
    {
      heading: 'Timeouts, retries, backoff and jitter',
      blocks: [
        {
          type: 'text',
          md: "**Timeouts.** Every remote call needs one, covering both connecting and waiting for the response. Without it, a hung dependency holds your resources indefinitely. The AWS Builders' Library suggests choosing a timeout from the dependency's latency distribution: decide what share of calls you can accept timing out by mistake (its example is 0.1%), then set the timeout near the matching percentile (p99.9 in that example). Google's SRE book adds **deadline propagation**: set an overall deadline at the top of the request and pass the remaining time down, so a backend does not keep working on a request whose caller has already given up.\n\n**Retries.** Many failures are transient: a dropped connection, one overloaded instance. A retry often succeeds. But a retry is extra work for a service that may already be struggling; AWS calls retries \"selfish\" for this reason. Rules that keep them safe:\n\n- **Only retry what is safe to repeat.** If the operation is not idempotent (repeating it can duplicate its effect, like a second charge), a retry after a timeout can do the work twice. Retry such calls only with an idempotency key or similar protection.\n- **Limit attempts**, per request and overall. Google's SRE book describes capping each request at three attempts and allowing a client to retry only while retries stay under 10% of its requests, a **retry budget**.\n- **Retry at one layer.** Retries multiply across layers: if three stacked layers each make up to three attempts, one user request can become 3 × 3 × 3 = 27 attempts at the bottom.\n- **Back off exponentially**, waiting longer after each failure, with a **cap** on the wait.\n- **Add jitter.** If many clients fail at the same moment and all wait exactly 100 ms, 200 ms, 400 ms, their retries arrive in synchronised waves. Randomising each wait spreads them out, so the recovering service sees a smoother load.",
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Timeout',
              definition:
                'The longest a caller will wait for a remote call before treating it as failed.',
            },
            {
              term: 'Exponential backoff',
              definition:
                'Waiting longer before each successive retry, typically doubling the wait, up to a maximum.',
            },
            {
              term: 'Jitter',
              definition:
                'Randomness added to retry waits so that many clients do not retry at the same instants.',
            },
            {
              term: 'Retry budget',
              definition:
                'A cap on retries as a share of all requests, so retries cannot multiply load during an outage.',
            },
            {
              term: 'Circuit breaker',
              definition:
                'A wrapper around a remote call that, after enough failures, fails calls immediately for a while instead of making them.',
            },
            {
              term: 'Cascading failure',
              definition:
                'A failure that spreads through positive feedback, as one overloaded or failing part pushes others into failure.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Circuit breakers, load shedding and degradation',
      blocks: [
        {
          type: 'text',
          md: "**Circuit breakers.** Martin Fowler's description has three states:\n\n- **Closed:** calls pass through. The breaker counts failures (timeouts, errors).\n- **Open:** after failures reach a threshold, the breaker trips. Calls fail **immediately**, without calling the dependency at all. This frees your threads and stops adding load to a service that is down.\n- **Half-open:** after a reset timeout, the breaker lets a trial call through. Success closes the breaker; failure opens it again.\n\nA breaker does not fix the dependency. It protects the caller and gives the dependency room to recover. Fowler also recommends logging every state change and letting operators trip or reset breakers by hand.\n\n**Load shedding.** When a server nears overload, it rejects some requests early, for example returning `503` when too many are in flight, so it can still serve the rest with reasonable latency instead of failing everything.\n\n**Graceful degradation.** Instead of rejecting work, do less of it per request: serve a cached or simpler result, or skip an optional feature. Google's SRE book gives the example of searching only a smaller in-memory index under load. Degradation is a **product decision**: you decide in advance which features are core and which can disappear.",
        },
        {
          type: 'diagram',
          caption:
            'The product API calls the reviews service through a timeout and circuit breaker. When reviews fail or the breaker is open, the page still renders from the product database, with cached or hidden reviews.',
          nodes: [
            {
              id: 'client',
              label: 'Shopper browser',
              kind: 'client',
              col: 0,
              row: 2,
            },
            {
              id: 'lb',
              label: 'Load balancer',
              kind: 'balancer',
              col: 1,
              row: 2,
            },
            {
              id: 'api',
              label: 'Product API',
              kind: 'service',
              col: 2,
              row: 2,
            },
            { id: 'db', label: 'Product DB', kind: 'store', col: 3, row: 1 },
            {
              id: 'reviews',
              label: 'Reviews service',
              kind: 'service',
              col: 3,
              row: 3,
            },
            {
              id: 'cache',
              label: 'Reviews cache',
              kind: 'cache',
              col: 4,
              row: 4,
            },
          ],
          edges: [
            { from: 'client', to: 'lb', label: 'GET product page' },
            { from: 'lb', to: 'api' },
            { from: 'api', to: 'db', label: 'core data' },
            { from: 'api', to: 'reviews', label: 'timeout + breaker' },
            { from: 'api', to: 'cache', label: 'fallback', dashed: true },
          ],
        },
        {
          type: 'example',
          title: 'A product page with a sick reviews service',
          md: 'Numbers here are illustrative.\n\nThe product API normally gets reviews in about 50 ms, with a p99.9 near 400 ms, so it uses a 400 ms timeout and no retries for reviews (the page can live without them). The reviews service starts timing out.\n\n- **Without protection:** each page request waits the full timeout, the API\'s worker pool fills with requests stuck on reviews, and soon product pages time out entirely, even though the product database is fine.\n- **With protection:** after a run of failures the breaker opens. Page requests skip the reviews call instantly and render with the last cached reviews, or with a "reviews unavailable" note. Every few seconds the breaker lets one trial call through; once reviews recover, it closes.\n\nThe shopper still sees the price and the **Add to cart** button, which is what the business actually needs.',
        },
      ],
    },
    {
      heading: 'Where these patterns come from',
      blocks: [
        {
          type: 'text',
          md: "- **Google's SRE book** treats cascading failures and overload at length: randomised exponential backoff on every retry, per-request retry limits and per-client retry budgets, servers that return an \"overloaded; don't retry\" error, deadline propagation, load shedding and degraded modes. It warns that degraded modes are rarely exercised and must be tested regularly.\n- **The AWS Builders' Library** recommends timeouts on every remote call chosen from latency percentiles, retrying at a single point in the stack, capped exponential backoff, jitter, token-bucket limits on retries, and idempotent APIs so retries are safe.\n- **Martin Fowler's CircuitBreaker** article describes the closed, open and half-open states and the monitoring a breaker needs.",
        },
      ],
    },
  ],
  application: {
    heading: 'Applying it to a request path, and the limits',
    blocks: [
      {
        type: 'text',
        md: 'Go through each dependency on a request path and ask: is it **core** (no useful response without it) or **optional**? How long can I wait for it? Is the call safe to retry? What do I show if it fails?\n\nTypical results: core reads get a timeout, a small number of jittered retries at one layer, and a breaker; optional features get a short timeout, no retries and a fallback; non-idempotent writes get retries only with an idempotency key; slow side effects such as email move to a queue, out of the request path.\n\nLimits to keep in mind:\n\n- **Timeouts that are too short** cause false failures and extra retries; too long and they protect nothing. Revisit them as latency changes.\n- **Retries hide problems.** A service that only works on the second try is broken; monitor retry rates.\n- **Breakers need tuning.** A threshold that trips on a brief blip cuts off a healthy dependency; one that trips too late lets the pile-up happen. Each caller instance usually sees only its own calls.\n- **Fallbacks rot.** A degraded path that never runs in normal operation may not work when you need it. Test it deliberately.\n- **Degradation must be visible.** If the system is quietly serving stale data, someone needs to know.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'More retries always make a system more reliable.',
      correction:
        'Retries add load. When a service is failing because it is overloaded, retries from every caller, multiplied across layers, can keep it down long after the original spike has passed.',
    },
    {
      claim: 'Jitter is there to make retries happen sooner.',
      correction:
        'Jitter randomises retry timing so clients that failed together do not retry together. Its purpose is spreading load, not speed.',
    },
    {
      claim: 'A circuit breaker fixes the failing service.',
      correction:
        'A breaker only changes what the caller does: it fails fast instead of waiting. That protects the caller and removes load from the dependency, but the dependency still has to recover or be fixed.',
    },
  ],
  questions: [
    {
      id: 'sd-fault-tolerance-q1',
      objective: 'sd-fault-tolerance-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'Why add jitter to exponential backoff?',
      options: [
        {
          id: 'a',
          text: 'To shorten each wait so the failed call is retried sooner',
          explanation:
            'Jitter randomises waits; it is not meant to shorten them. Speed is not its purpose.',
        },
        {
          id: 'b',
          text: 'To guarantee that every retried call eventually succeeds',
          explanation:
            'No retry policy guarantees success. A dependency that stays down keeps failing.',
        },
        {
          id: 'c',
          text: 'To spread retries from many clients so they do not arrive in waves',
          explanation:
            'Correct. Clients that fail at the same moment would otherwise retry at the same moments, creating synchronised spikes.',
        },
        {
          id: 'd',
          text: 'To tag each retry so the server can spot it as a duplicate',
          explanation:
            'Jitter adds no identifier. Recognising duplicates is the job of idempotency keys.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-fault-tolerance-q2',
      objective: 'sd-fault-tolerance-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What happens to calls while a circuit breaker is open?',
      options: [
        {
          id: 'a',
          text: 'They fail at once, without the protected call being made',
          explanation:
            'Correct. An open breaker returns an error immediately, saving the caller from waiting and the dependency from more load.',
        },
        {
          id: 'b',
          text: 'They are queued until the dependency becomes healthy again',
          explanation:
            'An open breaker does not hold calls; queueing them would tie up the caller just as waiting would.',
        },
        {
          id: 'c',
          text: 'They go through as normal while the failures are counted',
          explanation:
            'That is the closed state, where calls pass through and failures are counted.',
        },
        {
          id: 'd',
          text: 'One trial call goes through and the others are rejected',
          explanation:
            'That describes the half-open state, entered after the reset timeout.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-fault-tolerance-q3',
      objective: 'sd-fault-tolerance-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Each of these calls timed out. Which one should a client NOT retry automatically?',
      options: [
        {
          id: 'a',
          text: '`GET /products/42` to read a product',
          explanation:
            'GET is safe and idempotent; repeating it changes nothing on the server.',
        },
        {
          id: 'b',
          text: '`PUT /users/7/avatar` with the full image',
          explanation:
            'PUT replaces the resource with the same content each time, so repeats leave the same state.',
        },
        {
          id: 'c',
          text: '`DELETE /sessions/abc` to log a user out',
          explanation:
            'DELETE is idempotent: deleting an already-deleted session leaves the same state.',
        },
        {
          id: 'd',
          text: '`POST /payments` with no idempotency key',
          explanation:
            'Correct. The first attempt may have charged the card; without a key the server cannot tell a retry from a new payment.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-fault-tolerance-q4',
      objective: 'sd-fault-tolerance-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A service is overloaded by a traffic spike. Its clients retry every failed call immediately, up to five times. Why can the service stay down after the spike ends?',
      options: [
        {
          id: 'a',
          text: 'Retries take longer than first attempts, so they all time out',
          explanation:
            'Retries are not inherently slower. The issue is how many of them there are.',
        },
        {
          id: 'b',
          text: 'Each failure creates more requests, keeping load above capacity',
          explanation:
            'Correct. Failed calls come back as retries, so total load stays above what the service can handle even once new traffic falls.',
        },
        {
          id: 'c',
          text: 'Retried requests skip the load balancer and hit one instance',
          explanation:
            'Retries go through the same path as other requests; they do not bypass the balancer.',
        },
        {
          id: 'd',
          text: 'The server caches failed responses and replays them to retries',
          explanation:
            'Nothing in the scenario caches failures. The load from retries is enough to explain it.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-fault-tolerance-q5',
      objective: 'sd-fault-tolerance-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A gateway makes up to 3 attempts to call the orders service. Each orders call makes up to 3 attempts to call inventory. Each inventory call makes up to 3 attempts against the database. If the database fails every time, how many database attempts can one user request cause?',
      options: [
        {
          id: 'a',
          text: '27 attempts',
          explanation:
            'Correct. 3 gateway attempts × 3 orders attempts × 3 inventory attempts = 27. Retries multiply across layers.',
        },
        {
          id: 'b',
          text: '9 attempts',
          explanation:
            'This multiplies only two of the three layers. Each gateway attempt starts its own 3 × 3 below it.',
        },
        {
          id: 'c',
          text: '3 attempts',
          explanation:
            "This counts only the inventory layer's own attempts and ignores that the layers above repeat it.",
        },
        {
          id: 'd',
          text: '81 attempts',
          explanation:
            'That would be four layers of three. There are three retrying layers here, so it is 3 × 3 × 3.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-fault-tolerance-q6',
      objective: 'sd-fault-tolerance-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        "A dependency's latency is (illustratively) 40 ms at p50 and 300 ms at p99.9, and your request's whole deadline is 1 s. Following the AWS Builders' Library approach, which timeout fits best?",
      options: [
        {
          id: 'a',
          text: '40 ms, the median, so slow calls are cut off quickly',
          explanation:
            'About half of all normal calls take longer than the median, so they would time out and be retried for no reason.',
        },
        {
          id: 'b',
          text: '10 s, so that no call is ever cut off by mistake',
          explanation:
            'This exceeds the 1 s deadline and lets a hung dependency hold your resources far too long.',
        },
        {
          id: 'c',
          text: 'None; rely on whatever default the HTTP client ships with',
          explanation:
            'Client defaults are often very long or unlimited, which gives no protection against a hung dependency.',
        },
        {
          id: 'd',
          text: 'About 300 ms, accepting that roughly 0.1% of calls time out',
          explanation:
            'Correct. Picking an acceptable false-timeout rate and using the matching percentile is the method AWS describes, and it fits within the deadline.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-fault-tolerance-q7',
      objective: 'sd-fault-tolerance-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        "A product page shows product details from the product database and personalised recommendations from a separate service. The recommendations service is down. What should the page's backend do?",
      options: [
        {
          id: 'a',
          text: 'Return a 500 for the whole page so the outage is obvious',
          explanation:
            'This turns an optional feature failure into a full outage. Visibility belongs in monitoring, not in failed pages.',
        },
        {
          id: 'b',
          text: 'Render product details and hide or replace the recommendations',
          explanation:
            'Correct. Recommendations are optional, so the page degrades gracefully and keeps the core purchase path working.',
        },
        {
          id: 'c',
          text: 'Keep retrying recommendations until the service answers',
          explanation:
            'The page would hang while the service is down, and the retries add load to a service that needs to recover.',
        },
        {
          id: 'd',
          text: 'Raise the recommendations timeout so slow replies still arrive',
          explanation:
            'A down service will not reply however long you wait; a longer timeout only makes every page slower.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-fault-tolerance-q8',
      objective: 'sd-fault-tolerance-3',
      kind: 'concept',
      difficulty: 'easy',
      prompt:
        'Under heavy load, a search service starts searching a smaller in-memory index and returns somewhat less complete results. Which technique is this?',
      options: [
        {
          id: 'a',
          text: 'Load shedding, rejecting a share of incoming requests',
          explanation:
            'Load shedding drops requests. Here every request is still answered, just with less work.',
        },
        {
          id: 'b',
          text: 'Circuit breaking, failing fast on a broken dependency',
          explanation:
            'A breaker stops calls to a failing dependency. This service is choosing a cheaper way to answer.',
        },
        {
          id: 'c',
          text: 'Graceful degradation, doing less work for each request',
          explanation:
            "Correct. It lowers result quality to keep serving everyone. Google's SRE book uses this very example.",
        },
        {
          id: 'd',
          text: 'Exponential backoff, waiting longer between attempts',
          explanation:
            'Backoff is about retry timing on the caller side, not about how a server answers.',
        },
      ],
      answer: 'c',
    },
  ],
  scenario: {
    prompt:
      'Your checkout service handles `POST /checkout`. On each request it calls: an inventory service (to reserve stock), an external fraud-scoring vendor (which is sometimes slow for minutes at a time), a payment provider (which supports idempotency keys), and an email service (to send the receipt). Last week, while the fraud vendor was slow, checkout stopped working entirely and the inventory service was also overloaded by retries. Redesign how checkout calls its dependencies: timeouts, retries, circuit breakers and what happens when each dependency fails.',
    modelAnswer:
      'Start by classifying each dependency, because the right protection depends on whether checkout can work without it.\n\n**Fraud vendor (needed, but slow at times).** Timeout set from its latency percentiles, inside the overall checkout deadline. At most one retry with jittered backoff, and only in checkout itself, not also in a client library underneath. A circuit breaker so that when the vendor is slow, checkout fails fast instead of filling its worker pool. The fallback is a business decision I would raise explicitly: for example, accept low-value orders and queue them for a later fraud check, and hold high-value orders as "pending review". Silently skipping fraud checks is not acceptable.\n\n**Inventory (core).** Timeout and a breaker; no retry storms. Last week\'s overload came from retries piling up across layers, so retries happen at one layer only, with a retry budget. If inventory is down, checkout cannot honestly reserve stock, so it returns a clear "try again shortly" error rather than pretending.\n\n**Payment provider (core, not idempotent by default).** Timeout, and retries only with an idempotency key that stays the same across attempts, so a retry after a lost response cannot charge twice.\n\n**Email (optional).** Out of the request path entirely: put a "send receipt" message on a queue and let a worker send it with its own retries. Checkout succeeds even if email is down.\n\n**Observability.** Alert on breaker state changes, retry rates and how often fallbacks are used, and test the degraded paths regularly.\n\nOther designs can be right. Some teams would make the fraud check fully asynchronous for all orders; what matters is that a slow optional or semi-optional dependency can no longer exhaust checkout\'s resources, and that retries cannot multiply load.',
    checklist: [
      'Classifies each dependency as core or optional before choosing protections',
      'Gives every call a timeout that fits inside the overall request deadline',
      'Limits retries (one layer, capped, jittered backoff, budget) and retries the payment only with an idempotency key',
      'Uses a circuit breaker so a slow dependency fails fast instead of exhausting worker threads',
      'Defines explicit fallbacks, such as queueing email and a business-approved rule for fraud checks',
      'Adds monitoring for breaker trips, retry rates and fallback use',
    ],
  },
  takeaways: [
    'A slow dependency can exhaust a caller’s threads and spread the failure upward, so every remote call needs a timeout.',
    'Retry only operations that are safe to repeat, at one layer, with a cap, capped exponential backoff and jitter.',
    'Retries multiply across layers and add load to struggling services; retry budgets keep them from causing cascading failures.',
    'A circuit breaker fails calls fast while a dependency is down, protecting the caller and giving the dependency room to recover.',
    'Load shedding drops some work to serve the rest; graceful degradation does less work per request so the core product keeps working.',
  ],
  references: [
    {
      title: 'Timeouts, retries, and backoff with jitter',
      publisher: "Amazon Builders' Library",
      url: 'https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter',
      kind: 'source',
    },
    {
      title:
        'Site Reliability Engineering, chapter 22: Addressing Cascading Failures',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/addressing-cascading-failures/',
      kind: 'source',
    },
    {
      title: 'Site Reliability Engineering, chapter 21: Handling Overload',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/handling-overload/',
      kind: 'source',
    },
    {
      title: 'CircuitBreaker',
      publisher: 'Martin Fowler',
      url: 'https://martinfowler.com/bliki/CircuitBreaker.html',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}

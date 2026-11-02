import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `**Linkly** is a link-shortening service used by marketing teams, newsletters and individual users. A user pastes a long URL and gets back a short one such as \`lnk.ly/aZ3kQ9x\`. Anyone who opens the short link is redirected to the original URL.

Short links end up printed on posters, embedded in emails and shared on social media, so they must keep working for years, and redirects must be fast everywhere. Link owners also want to see how their links perform: how many clicks, from which countries, and from which referring sites.

Your job is to design the backend for creating links, redirecting, and collecting click analytics.`,
  requirements: [
    'Users can create a short link for any valid http(s) URL and get back a short code of at most 8 characters.',
    'Users can optionally choose a custom alias (for example lnk.ly/spring-sale); aliases are first come, first served and must be unique.',
    'Opening a short link redirects to the original URL. Unknown, expired or disabled links return a clear error page.',
    'Links can have an optional expiry date. Links without one stay active indefinitely.',
    'Link owners can see click counts per day, top countries and top referrers, updated within 5 minutes.',
    'The trust and safety team can disable a link reported as malicious, and the change must take effect within 1 minute.',
  ],
  scale: [
    '100 million new short links per month (about 40 per second on average, about 400 per second at peak).',
    'Redirects outnumber creations 100:1: about 10 billion redirects per month (about 3,900 per second on average, about 20,000 per second at peak).',
    'Plan storage for 5 years: about 6 billion links. A link record is about 500 bytes including the long URL (200 bytes on average), owner, timestamps and index overhead.',
    'Traffic is heavily skewed: links created in the last 7 days receive most clicks, and a small number of viral links can each receive thousands of redirects per second.',
    'Each click produces an analytics event of about 100 bytes. Raw events are kept for 90 days; daily aggregates are kept for the life of the link.',
  ],
  constraints: [
    'Redirect latency: p99 under 50 ms measured at the service (excluding the user’s network). Link creation: p99 under 300 ms.',
    'Availability: 99.99% for redirects, 99.9% for link creation and analytics.',
    'Short codes must not be sequential or otherwise easy to enumerate; someone should not be able to walk through every link by incrementing a code.',
    'A team of 6 engineers runs this on a public cloud; managed services are allowed and operational simplicity matters.',
    'Out of scope: user sign-up and login, billing, the analytics dashboard UI, and link-preview generation.',
  ],
  instructions: `Fill in every field of the submission form. Your design is graded against the rubric below, not compared with a reference answer: any well-reasoned architecture that meets the requirements can score well, whatever technologies you pick, as long as you justify the choice.

- **Capacity estimation:** show the arithmetic and state your assumptions (for example the peak-to-average ratio or bytes per record). A wrong number with visible working loses fewer marks than a bare number.
- **Key generation:** explain how short codes are produced, how uniqueness is guaranteed, and how custom aliases fit in.
- **Redirects:** say which HTTP status code you return and what that choice means for caching and analytics.
- **Failure handling:** name concrete failures (a cache node, a database replica, the analytics pipeline) and what users see when each happens.
- **Trade-offs:** name the alternatives you rejected and what your choice costs.`,
  rubric: {
    version: '1.0',
    passMark: 75,
    criteria: [
      {
        id: 'requirements_understanding',
        title: 'Requirements understanding',
        weight: 15,
        description:
          'Strong answers separate the hot path (redirect) from the cold path (creation) and the async path (analytics), and state non-functional targets that match the brief: very high redirect availability, low redirect latency, long-lived links, unique and non-enumerable codes, custom aliases, expiry, and disabling a link within 1 minute. They state what is out of scope. Penalize answers that ignore analytics, expiry or the abuse-disable requirement, or that invent requirements that change the problem (for example demanding strong global consistency for click counts).',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'Strong answers derive write and read rates from the given numbers (about 40 writes/s and 3,900 redirects/s on average, with peaks roughly 10x and 5x), storage for about 6 billion links (about 3 TB at 500 bytes each, before replication), analytics event volume (about 1 TB/month raw), and check that the code space is large enough (for example 62^7 is about 3.5 trillion, far more than 6 billion). Assumptions are stated and the arithmetic is shown. Penalize errors of an order of magnitude or more, missing peak estimates, and numbers with no working.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        description:
          'Strong answers describe a clear request flow for creation and redirect, a sound key-generation scheme that guarantees uniqueness (for example random codes with an atomic insert-if-absent and retry on collision, or a distributed counter or pre-allocated ID ranges passed through a reversible scrambling step so codes are not sequential), custom aliases that can never collide with generated codes (one shared uniqueness space, or disjoint namespaces that make a clash impossible), a cache in front of the link store for the read-heavy redirect path, and analytics recorded asynchronously so a slow analytics pipeline never delays a redirect. They justify the redirect status code: a 302 or 307 keeps clicks visible to the service, while a cacheable 301 hides repeat clicks from analytics. Any technology is acceptable if the reasoning holds. Penalize schemes that can silently produce duplicate codes (for example truncating a hash with no collision check), sequential codes that violate the enumeration constraint, and synchronous analytics writes on the redirect path.',
        minScore: 50,
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        description:
          'Strong answers give a data model keyed by short code (for example a key-value store keyed by code, or a relational table with the code as primary key or a unique index), state the main access pattern (point lookup by code), show how uniqueness is enforced at the storage layer, and keep click events separate from link records in a store suited to high-volume appends and aggregation. They address how expired and disabled links are represented and how the 3 TB data set grows (partitioning by code, or a justified reason it fits on one primary with replicas). Penalize designs that store click counters by updating the link row on every redirect, or that pick a store without relating it to the access pattern.',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        description:
          'Strong answers keep redirects working when parts of the system fail: replicated link storage, a cache that can be lost without losing data, stateless app servers behind a load balancer, and analytics that buffers or drops events rather than blocking redirects. They handle hot links (cache hit rates, CDN or edge caching with short TTLs so disabled links still stop within 1 minute, with clicks served at the edge still reaching analytics, for example from edge logs), cache misses for unknown codes (for example negative caching), and key-generation availability (no single counter that halts creation). Penalize single points of failure without mitigation, a cache treated as the only copy of data, and any design where an analytics outage takes redirects down.',
        minScore: 50,
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'Strong answers name real alternatives and their costs: random versus counter-based codes (collision retries versus a coordination point), 301 versus 302 (fewer server hits versus accurate analytics), cache TTL versus how fast a disabled link stops working, relational versus key-value storage, and exact versus approximate click counts. Reasoning ties back to the stated requirements. Penalize one-sided claims with no cost, and choices described as best practice with no reason.',
      },
    ],
  },
  remediation: {
    requirements_understanding: ['intro-to-system-design', 'rest-api-design'],
    capacity_estimation: ['intro-to-system-design', 'database-sharding'],
    architecture_design: [
      'client-server-architecture',
      'caching-fundamentals',
      'async-processing',
    ],
    database_design: ['sql-vs-nosql', 'database-indexing', 'database-sharding'],
    scalability_reliability: [
      'cache-strategies',
      'database-replication',
      'fault-tolerance',
    ],
    tradeoff_reasoning: ['caching-fundamentals', 'networking-basics'],
  },
  fieldHints: {
    capacity:
      'Estimate redirects per second at peak, total storage over 5 years, and check that your code length gives enough unique codes.',
    database:
      'How is a code guaranteed to be unique, including custom aliases? Where do click events live?',
    architecture:
      'Walk through both flows: creating a link and following one. Which HTTP status does a redirect return, and why?',
    failures:
      'What happens to redirects if the cache, the database leader or the analytics pipeline is down?',
  },
}

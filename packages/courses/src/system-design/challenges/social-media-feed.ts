import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `**Murmur** is a social app where people post short updates (text plus optional photos) and follow other accounts. The heart of the product is the **home timeline**: when a user opens the app, they see recent posts from the accounts they follow, newest first, and can scroll back through older posts.

Most accounts have a few hundred followers, but some (celebrities, news outlets) have tens of millions. The home timeline is the most-viewed screen in the app, so it must load quickly even when the followed accounts include some of these very large ones.

Design the backend for publishing posts, following accounts and serving the home timeline. Ranking by relevance is not part of this version: the timeline is reverse-chronological.`,
  requirements: [
    'Users can publish a post (up to 500 characters of text and up to 4 photo references) and delete their own posts.',
    'Users can follow and unfollow other accounts.',
    'The home timeline shows posts from followed accounts in reverse-chronological order, 20 at a time, with pagination for infinite scroll.',
    'A new post appears in followers’ home timelines within 10 seconds (p95).',
    'A deleted post disappears from all timelines within 1 minute; after an unfollow, that account’s posts stop appearing in new timeline pages.',
    'Each post in the timeline shows like and reply counts; these may lag by a few seconds.',
  ],
  scale: [
    '200 million daily active users; each opens the home timeline about 10 times per day: about 2 billion timeline requests per day, about 23,000 per second on average and about 70,000 per second at peak.',
    '20 million new posts per day (about 230 per second on average, about 700 per second at peak).',
    'Users follow 200 accounts on average. Follower counts are heavily skewed: the median account has under 100 followers, a few thousand accounts have more than 1 million, and the largest has 100 million.',
    'A post record (text, author, timestamps, photo references) is about 1 KB, about 20 GB per day or about 7 TB per year. Photos themselves are stored elsewhere.',
    'About 80% of timeline requests are for the first page; few users scroll back more than a few days.',
  ],
  constraints: [
    'Home timeline latency: p99 under 300 ms for the first page, measured at the service.',
    'Availability: 99.95% for reading the timeline; publishing may degrade (for example be delayed) before reading does.',
    'Eventual consistency is acceptable for timelines and counts, within the freshness targets above.',
    'Out of scope: relevance ranking, ads, photo upload and storage, search, and direct messages.',
  ],
  instructions: `Fill in every field of the submission form. Your design is graded against the rubric below, not compared with a reference answer. There are several valid ways to build a timeline (precomputing it when posts are written, assembling it when it is read, or a mix); any of them can score well if you show it meets the latency and freshness targets at this scale.

- **Capacity estimation:** show the arithmetic for timeline reads, post writes, and the work your timeline approach creates (for example timeline inserts per second, or lookups per timeline read), and state your assumptions.
- **Large accounts:** explain what happens when an account with 100 million followers posts.
- **Pagination:** say how a client asks for the next page without gaps or duplicates when new posts arrive.
- **Failure handling:** cover a cache or timeline store failure, a backlog in background work, and deletes.`,
  rubric: {
    version: '1.0',
    passMark: 75,
    criteria: [
      {
        id: 'requirements_understanding',
        title: 'Requirements understanding',
        weight: 15,
        description:
          'Strong answers identify the home timeline read as the dominant, latency-critical path, and capture publishing, deleting, following, pagination, the 10-second freshness target, the 1-minute delete target and eventually consistent counts. They note the skewed follower distribution as a central design driver and state that ranking is out of scope. Penalize answers that require strong consistency for timelines, ignore deletes or unfollows, or add ranking or other out-of-scope features as core requirements.',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'Strong answers derive timeline reads (about 23,000/s average, about 70,000/s peak), post writes (about 230/s average), post storage (about 20 GB/day, about 7 TB/year), and the cost of their chosen timeline approach: for precomputed timelines, inserts of roughly posts × average followers (about 4 billion per day, about 46,000/s on average, with one large account producing up to 100 million inserts for one post) plus memory for stored timelines; for read-time assembly, the number of author lookups per timeline read and the resulting load. Assumptions and arithmetic are shown. Penalize order-of-magnitude errors and estimates that ignore the cost of the chosen approach.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        description:
          'Strong answers describe a coherent timeline strategy and its request flows: fan-out on write (push posts into precomputed per-user timelines), fan-out on read (merge recent posts of followed accounts at request time), or a hybrid (push for ordinary accounts, pull for very large ones). Whatever the strategy, the answer must show how it meets the 300 ms read target and 10-second freshness, how accounts with millions of followers are handled without blocking the post request or overloading the system, that fan-out work runs asynchronously, and that timelines store post IDs and hydrate post content separately so edits, deletes and counts stay correct. Pagination uses a cursor (for example a post ID or timestamp plus ID), not offsets. Any technology is acceptable if the reasoning holds. Penalize synchronous fan-out to all followers inside the post request, per-request joins across all followed accounts with no caching or bound, and offset pagination on a changing list.',
        minScore: 50,
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        description:
          'Strong answers model posts (keyed by post ID, with a per-author index or list ordered by time), the follow graph in both directions (followers of X for fan-out, accounts followed by Y for pull and for checks), and timelines or per-author recent-post lists in a fast store, with partitioning keys explained: posts and author lists by author or post ID, timelines by user ID, follow edges by user ID. Post IDs that sort by time (for example time-prefixed unique IDs) simplify ordering and cursors. Counts are kept separately from post content (for example counters updated asynchronously). Any suitable store is acceptable if it matches the access pattern. Penalize a single unpartitioned store for all of this, and follow-graph designs that can only be read in one direction.',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        description:
          'Strong answers address the hot spots: very large accounts (hybrid or pull for them, or rate-limited background fan-out), hot posts (caching popular post content), fan-out backlog (queues with enough consumers, prioritizing active users, skipping or trimming timelines of inactive users), and timeline store or cache loss (rebuild from posts and the follow graph, serve a degraded timeline rather than an error). They keep reads available when publishing is degraded and explain how deletes reach precomputed timelines or are filtered at read time. Penalize single points of failure without mitigation, a timeline cache with no rebuild path, and designs where one celebrity post stalls everyone’s fan-out.',
        minScore: 50,
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'Strong answers compare fan-out on write, fan-out on read and hybrid on read latency, write amplification, memory, freshness and complexity, and explain where their chosen threshold or cache TTL comes from. They discuss what eventual consistency means for users here (a post appearing a few seconds late, counts lagging) and the cost of precomputing timelines for users who rarely log in. Penalize one-sided reasoning and claims that one approach is free of costs.',
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
    ],
    architecture_design: [
      'async-processing',
      'cache-strategies',
      'event-driven-architecture',
    ],
    database_design: ['database-sharding', 'database-indexing', 'sql-vs-nosql'],
    scalability_reliability: [
      'cache-strategies',
      'message-queues',
      'fault-tolerance',
    ],
    tradeoff_reasoning: ['consistency-models', 'cache-strategies'],
  },
  fieldHints: {
    capacity:
      'Estimate the work your timeline approach creates: timeline inserts per second if you precompute, or lookups per read if you assemble at read time.',
    architecture:
      'Trace a post from an account with 300 followers and one from an account with 100 million followers. Then trace a timeline read.',
    database:
      'How do you store the follow graph so you can ask both “who follows X?” and “who does Y follow?”',
    failures:
      'What does a user see if the timeline cache is lost, or if fan-out falls 10 minutes behind?',
  },
}

import type { LessonItem, ChallengeItem, LevelCourse } from '../types'
import { content } from './content'

const lesson = (
  slug: string,
  title: string,
  summary: string,
  prerequisites: string[] = [],
): LessonItem => ({ kind: 'lesson', slug, title, summary, prerequisites })

const challenge = (
  slug: string,
  title: string,
  summary: string,
  prerequisites: string[],
): ChallengeItem => ({ kind: 'challenge', slug, title, summary, prerequisites })

/**
 * The System Design curriculum. Items unlock by prerequisites, so learners can
 * follow their interests across levels instead of a fixed order. Lesson and
 * challenge content is attached to each item once written and reviewed.
 */
export const systemDesign: LevelCourse = {
  format: 'levels',
  slug: 'system-design',
  title: 'System Design',
  tagline: 'Design systems that scale, and defend every trade-off.',
  description:
    'From client-server basics to designing real products end to end. Concept lessons with knowledge checks build the vocabulary; design challenges are graded against a rubric that rewards sound reasoning, not one reference answer.',
  level: 'Intermediate',
  status: 'available',
  outcomes: [
    'Explain the building blocks: networking, APIs, databases, caches, queues',
    'Scale a system and reason about consistency and failure',
    'Estimate capacity and turn requirements into an architecture',
    'Defend design decisions with explicit trade-offs',
  ],
  prerequisites: [
    'Comfortable building a web app with a database',
    'No distributed systems background needed',
  ],
  rules: { lessonQuizSize: 5, examSize: 15, passMark: 0.8 },
  content,
  levels: [
    {
      number: 1,
      slug: 'fundamentals',
      title: 'System Design Fundamentals',
      summary: 'The building blocks every design is made of.',
      items: [
        lesson(
          'intro-to-system-design',
          'Introduction to System Design',
          'What system design is, how a design is judged, and how to approach an open-ended problem.',
        ),
        lesson(
          'client-server-architecture',
          'Client-Server Architecture',
          'How clients, servers and the network between them split the work.',
          ['intro-to-system-design'],
        ),
        lesson(
          'networking-basics',
          'HTTP, DNS, TCP, and Networking',
          'What happens between typing a URL and receiving a response.',
          ['client-server-architecture'],
        ),
        lesson(
          'rest-api-design',
          'REST API Design',
          'Resources, methods, status codes, versioning and pagination.',
          ['networking-basics'],
        ),
        lesson(
          'sql-vs-nosql',
          'SQL vs NoSQL',
          'Data models, query patterns and guarantees, and how to choose.',
          ['intro-to-system-design'],
        ),
        lesson(
          'database-indexing',
          'Database Indexing',
          'How indexes speed up reads, what they cost on writes, and when to add one.',
          ['sql-vs-nosql'],
        ),
        lesson(
          'caching-fundamentals',
          'Caching Fundamentals',
          'Where caches sit, hit rates, eviction and stale data.',
          ['client-server-architecture'],
        ),
        lesson(
          'load-balancing',
          'Load Balancing',
          'Spreading traffic across servers, health checks and balancing algorithms.',
          ['client-server-architecture', 'networking-basics'],
        ),
      ],
    },
    {
      number: 2,
      slug: 'scalability',
      title: 'Scalability',
      summary: 'Growing a system as traffic and data grow.',
      items: [
        lesson(
          'horizontal-vertical-scaling',
          'Horizontal vs Vertical Scaling',
          'Bigger machines or more machines, and what each demands of your design.',
          ['load-balancing'],
        ),
        lesson(
          'database-replication',
          'Database Replication',
          'Leaders, followers, replication lag and read scaling.',
          ['sql-vs-nosql', 'horizontal-vertical-scaling'],
        ),
        lesson(
          'database-sharding',
          'Database Sharding',
          'Partitioning data across nodes, choosing a shard key and rebalancing.',
          ['database-replication', 'database-indexing'],
        ),
        lesson(
          'message-queues',
          'Message Queues',
          'Decoupling producers and consumers, delivery guarantees and backpressure.',
          ['rest-api-design'],
        ),
        lesson(
          'rate-limiting',
          'Rate Limiting',
          'Protecting a service with token buckets, windows and quotas.',
          ['rest-api-design', 'caching-fundamentals'],
        ),
        lesson(
          'cdn-object-storage',
          'CDN and Object Storage',
          'Serving large files and static content close to users.',
          ['caching-fundamentals', 'networking-basics'],
        ),
        lesson(
          'cache-strategies',
          'Cache Strategies',
          'Cache-aside, write-through, write-back, invalidation and stampedes.',
          ['caching-fundamentals', 'database-replication'],
        ),
        lesson(
          'async-processing',
          'Asynchronous Processing',
          'Background jobs, workers and keeping slow work out of the request path.',
          ['message-queues'],
        ),
      ],
    },
    {
      number: 3,
      slug: 'distributed-systems',
      title: 'Distributed Systems',
      summary: 'Correctness and reliability when one machine is not enough.',
      items: [
        lesson(
          'cap-theorem',
          'CAP Theorem',
          'What network partitions force you to give up, and what CAP does not say.',
          ['database-replication'],
        ),
        lesson(
          'consistency-models',
          'Consistency Models',
          'Strong, eventual, read-your-writes and causal consistency in practice.',
          ['cap-theorem'],
        ),
        lesson(
          'distributed-transactions',
          'Distributed Transactions',
          'Two-phase commit, sagas and compensating actions.',
          ['consistency-models', 'database-sharding'],
        ),
        lesson(
          'event-driven-architecture',
          'Event-Driven Architecture',
          'Events, event logs and services that react instead of call.',
          ['message-queues', 'async-processing'],
        ),
        lesson(
          'idempotency',
          'Idempotency',
          'Making retries safe with idempotency keys and deduplication.',
          ['rest-api-design', 'message-queues'],
        ),
        lesson(
          'fault-tolerance',
          'Fault Tolerance',
          'Timeouts, retries, circuit breakers and graceful degradation.',
          ['load-balancing', 'database-replication'],
        ),
        lesson(
          'service-discovery',
          'Service Discovery',
          'How services find each other as instances come and go.',
          ['load-balancing'],
        ),
        lesson(
          'multi-region-architecture',
          'Multi-Region Architecture',
          'Serving users worldwide and surviving the loss of a region.',
          ['consistency-models', 'cdn-object-storage', 'fault-tolerance'],
        ),
      ],
    },
    {
      number: 4,
      slug: 'real-world',
      title: 'Real-World System Design',
      summary:
        'Design real products end to end, graded against a rubric. These challenges are the final assessments.',
      items: [
        challenge(
          'url-shortener',
          'URL Shortener',
          'Short links at scale: key generation, redirects and analytics.',
          [
            'rest-api-design',
            'database-indexing',
            'caching-fundamentals',
            'load-balancing',
          ],
        ),
        challenge(
          'chat-application',
          'Chat Application',
          'One-to-one and group messaging like WhatsApp or Slack.',
          [
            'message-queues',
            'consistency-models',
            'horizontal-vertical-scaling',
          ],
        ),
        challenge(
          'social-media-feed',
          'Social Media Feed',
          'A home timeline like Instagram or Twitter.',
          ['cache-strategies', 'database-sharding', 'async-processing'],
        ),
        challenge(
          'notification-system',
          'Notification System',
          'Push, email and SMS delivery with preferences and retries.',
          ['message-queues', 'idempotency', 'rate-limiting'],
        ),
        challenge(
          'ecommerce-system',
          'E-commerce System',
          'Catalog, cart, inventory and checkout under load.',
          ['distributed-transactions', 'cache-strategies', 'rate-limiting'],
        ),
        challenge(
          'payment-system',
          'Payment System',
          'Moving money correctly: ledgers, retries and reconciliation.',
          ['idempotency', 'distributed-transactions', 'fault-tolerance'],
        ),
        challenge(
          'video-streaming',
          'Video Streaming',
          'Upload, transcode and stream video like YouTube or Netflix.',
          [
            'cdn-object-storage',
            'async-processing',
            'multi-region-architecture',
          ],
        ),
        challenge(
          'ride-sharing',
          'Ride-Sharing System',
          'Matching riders and drivers in real time like Uber.',
          [
            'consistency-models',
            'event-driven-architecture',
            'multi-region-architecture',
          ],
        ),
      ],
    },
  ],
  sources: [
    {
      title: 'Designing Data-Intensive Applications',
      publisher: 'Martin Kleppmann, O’Reilly',
      url: 'https://dataintensive.net/',
      kind: 'source',
    },
    {
      title: 'Site Reliability Engineering',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/table-of-contents/',
      kind: 'source',
    },
    {
      title: 'AWS Well-Architected Framework',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
      kind: 'source',
    },
    {
      title: 'HTTP',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
      kind: 'source',
    },
  ],
}

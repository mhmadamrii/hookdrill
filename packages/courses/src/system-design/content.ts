import type { CourseContent } from '../types'

/**
 * Loaders for written content. Each import becomes its own chunk, so the
 * curriculum pages never download lesson text. Register a file here once it
 * passes `check-file` and review. Calibration samples are server-only and
 * never registered.
 */
export const content: CourseContent = {
  lessons: {
    'async-processing': () =>
      import('./lessons/async-processing').then((m) => m.lesson),
    'cache-strategies': () =>
      import('./lessons/cache-strategies').then((m) => m.lesson),
    'caching-fundamentals': () =>
      import('./lessons/caching-fundamentals').then((m) => m.lesson),
    'cap-theorem': () => import('./lessons/cap-theorem').then((m) => m.lesson),
    'cdn-object-storage': () =>
      import('./lessons/cdn-object-storage').then((m) => m.lesson),
    'client-server-architecture': () =>
      import('./lessons/client-server-architecture').then((m) => m.lesson),
    'consistency-models': () =>
      import('./lessons/consistency-models').then((m) => m.lesson),
    'database-indexing': () =>
      import('./lessons/database-indexing').then((m) => m.lesson),
    'database-replication': () =>
      import('./lessons/database-replication').then((m) => m.lesson),
    'database-sharding': () =>
      import('./lessons/database-sharding').then((m) => m.lesson),
    'distributed-transactions': () =>
      import('./lessons/distributed-transactions').then((m) => m.lesson),
    'event-driven-architecture': () =>
      import('./lessons/event-driven-architecture').then((m) => m.lesson),
    'fault-tolerance': () =>
      import('./lessons/fault-tolerance').then((m) => m.lesson),
    'horizontal-vertical-scaling': () =>
      import('./lessons/horizontal-vertical-scaling').then((m) => m.lesson),
    idempotency: () => import('./lessons/idempotency').then((m) => m.lesson),
    'intro-to-system-design': () =>
      import('./lessons/intro-to-system-design').then((m) => m.lesson),
    'load-balancing': () =>
      import('./lessons/load-balancing').then((m) => m.lesson),
    'message-queues': () =>
      import('./lessons/message-queues').then((m) => m.lesson),
    'multi-region-architecture': () =>
      import('./lessons/multi-region-architecture').then((m) => m.lesson),
    'networking-basics': () =>
      import('./lessons/networking-basics').then((m) => m.lesson),
    'rate-limiting': () =>
      import('./lessons/rate-limiting').then((m) => m.lesson),
    'rest-api-design': () =>
      import('./lessons/rest-api-design').then((m) => m.lesson),
    'service-discovery': () =>
      import('./lessons/service-discovery').then((m) => m.lesson),
    'sql-vs-nosql': () =>
      import('./lessons/sql-vs-nosql').then((m) => m.lesson),
  },
  // Each level exam is written in two halves; the exam uses both.
  exams: {
    fundamentals: async () => [
      ...(await import('./exams/fundamentals-a')).examQuestions,
      ...(await import('./exams/fundamentals-b')).examQuestions,
    ],
    scalability: async () => [
      ...(await import('./exams/scalability-a')).examQuestions,
      ...(await import('./exams/scalability-b')).examQuestions,
    ],
    'distributed-systems': async () => [
      ...(await import('./exams/distributed-systems-a')).examQuestions,
      ...(await import('./exams/distributed-systems-b')).examQuestions,
    ],
  },
  challenges: {
    'chat-application': () =>
      import('./challenges/chat-application').then((m) => m.challenge),
    'ecommerce-system': () =>
      import('./challenges/ecommerce-system').then((m) => m.challenge),
    'notification-system': () =>
      import('./challenges/notification-system').then((m) => m.challenge),
    'payment-system': () =>
      import('./challenges/payment-system').then((m) => m.challenge),
    'ride-sharing': () =>
      import('./challenges/ride-sharing').then((m) => m.challenge),
    'social-media-feed': () =>
      import('./challenges/social-media-feed').then((m) => m.challenge),
    'url-shortener': () =>
      import('./challenges/url-shortener').then((m) => m.challenge),
    'video-streaming': () =>
      import('./challenges/video-streaming').then((m) => m.challenge),
  },
}

import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `**Tally** is a company with several consumer products (a shopping app, a wallet and a loyalty program). Today every product team sends its own push notifications, emails and text messages, with duplicated code, inconsistent opt-out handling and frequent incidents when a marketing blast delays password-reset codes.

You are designing a shared **notification platform**. Product services call it to notify a user; the platform decides which channels to use based on the user’s preferences, renders the message from a template, hands it to third-party providers (mobile push gateways, an email provider, an SMS provider) and tracks what happened.

Two kinds of traffic share the platform: **transactional** notifications (one-time passcodes, order updates, security alerts), which are urgent, and **marketing** campaigns, which are large but can wait.`,
  requirements: [
    'Internal services send a notification through an API with a recipient user, a notification type (which selects a template), template data, an idempotency key and a priority (transactional or marketing).',
    'Each user has preferences per notification category and channel (push, email, SMS). Opt-outs take effect within 1 minute. Security notifications such as one-time passcodes cannot be opted out of.',
    'Messages are rendered from templates in the user’s language.',
    'Marketing campaigns can be scheduled and sent to up to 30 million users, and must not reach users during their local quiet hours (21:00–08:00).',
    'Provider failures are retried, and a user never receives the same notification twice for the same idempotency key under normal operation.',
    'The status of each notification (accepted, sent to provider, delivered, failed, and the reason) can be queried for 90 days.',
  ],
  scale: [
    '120 million registered users, 40 million daily active.',
    '500 million notifications per day: 400 million push, 90 million email, 10 million SMS (about 5,800 per second on average).',
    'About 20% of volume is transactional (about 100 million per day). The rest comes from marketing campaigns, which create bursts of up to 20,000 notifications per second when several large campaigns run at once.',
    'Provider limits on Tally’s accounts: the SMS provider accepts up to 1,000 messages per second and the email provider up to 5,000 per second. SMS costs about $0.008 per message.',
    'A delivery record is about 500 bytes, about 250 GB per day or about 22 TB for 90 days of retention. User preferences are about 200 bytes per user.',
  ],
  constraints: [
    'Transactional notifications must be handed to the provider within 5 seconds (p99) of the API call, including while large campaigns are running.',
    'Availability: 99.95% for the send API. A notification the API has accepted must not be lost.',
    'One-time passcodes and other secrets must not be stored in delivery logs or other long-term records.',
    'Out of scope: building our own push, email or SMS delivery infrastructure (use the third-party providers), the campaign authoring UI, and audience segmentation (campaigns arrive as a list of user IDs).',
  ],
  instructions: `Fill in every field of the submission form. Your design is graded against the rubric below, not compared with a reference answer. Queue-based pipelines, database-backed job tables and other approaches can all score well if they meet the requirements and you justify them.

- **Capacity estimation:** show the arithmetic for average and peak rates per channel, provider limits, campaign duration and storage, and state your assumptions.
- **Priorities:** explain how a one-time passcode gets through quickly while a 30-million-user campaign is sending.
- **Duplicates and retries:** explain how retries work, how duplicates are prevented, and what guarantees you can and cannot give when a third-party provider is involved.
- **Preferences and compliance:** say where and when preferences, opt-outs and quiet hours are checked.
- **Failure handling:** cover a provider outage, a worker crash mid-send and a backlog.`,
  rubric: {
    version: '1.0',
    passMark: 75,
    criteria: [
      {
        id: 'requirements_understanding',
        title: 'Requirements understanding',
        weight: 15,
        description:
          'Strong answers distinguish transactional from marketing traffic and treat the 5-second transactional target as a primary design driver. They cover multi-channel delivery, preferences and fast opt-outs (with non-optional security messages), templates and localization, scheduled campaigns with quiet hours in the user’s time zone, idempotent sends, status tracking for 90 days, and keeping secrets out of logs. They recognize the providers as external systems with their own limits and failure modes. Penalize answers that treat all notifications identically, ignore preferences or quiet hours, or plan to build delivery infrastructure that is out of scope.',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'Strong answers compute average rates (about 5,800/s overall; about 4,600/s push, 1,000/s email, 120/s SMS), peak campaign bursts (up to about 20,000/s), and compare them with provider limits (SMS 1,000/s, email 5,000/s), concluding that bursts must be queued and drained at the provider rate (for example a 30-million email campaign takes at least about 100 minutes at 5,000/s, less what transactional traffic needs). They estimate delivery-log storage (about 250 GB/day, about 22 TB for 90 days) and note the cost of duplicate SMS. Assumptions and arithmetic are shown. Penalize order-of-magnitude errors and ignoring provider limits.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        description:
          'Strong answers describe an accept-then-process flow: the API validates, deduplicates on the idempotency key, durably records or enqueues the notification, and returns quickly; asynchronous workers check preferences and quiet hours at send time, render templates, and call providers through per-channel senders. Transactional and marketing traffic are isolated (separate queues, partitions or reserved capacity) so a campaign cannot delay passcodes. Campaigns are expanded in batches by a scheduler rather than in one request. Provider callbacks or polling update delivery status. Any technology is acceptable (a message broker, a database-backed job table, a managed workflow service) if the reasoning holds. Penalize a single shared FIFO queue for all traffic, synchronous provider calls in the API request, preference checks only at campaign creation time, and no idempotency mechanism.',
        minScore: 50,
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        description:
          'Strong answers model notifications and their status history (keyed by notification ID, queryable by user and time), idempotency records (a unique key with an expiry that covers the retry window), user preferences (point lookups by user ID, cached, with a way to invalidate within 1 minute), templates (versioned, per language) and campaigns. Storage choices fit the access pattern: high-volume appends with 90-day expiry for delivery records, fast point reads for preferences. Payloads with secrets are not persisted in plain form, or are redacted. Penalize storing everything in one table with no partitioning or expiry plan, and idempotency checks that are not atomic (check-then-insert races).',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        description:
          'Strong answers rate-limit each provider (for example a token bucket shared across workers) with transactional traffic given priority within the limit, retry transient failures with exponential backoff and jitter, stop retrying on permanent errors (invalid token, bounced address), move exhausted messages to a dead-letter store, and fail over to a secondary provider or degrade gracefully during an outage. They acknowledge that delivery to an external provider is at-least-once: a worker can crash after the provider accepted a message but before recording it, so true exactly-once is not achievable; they reduce duplicates with idempotency keys passed to providers where supported and a sent-record check before each attempt. Workers scale horizontally and backlogs drain without starving transactional traffic. Penalize claims of guaranteed exactly-once delivery to providers, immediate retries without backoff, and no protection against exceeding provider limits.',
        minScore: 50,
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'Strong answers weigh real choices: a message broker versus a database-backed job table (throughput and replay versus transactional simplicity and queryability), at-least-once with deduplication versus at-most-once (a duplicate passcode versus a missing one, and the cost of duplicate SMS), checking preferences at enqueue time versus send time, reserved capacity for transactional traffic versus utilization, and provider failover versus cost and consistency of sender identity. Reasoning ties back to the stated latency, cost and compliance constraints. Penalize one-sided claims and choices justified only by popularity.',
      },
    ],
  },
  remediation: {
    requirements_understanding: ['intro-to-system-design', 'rest-api-design'],
    capacity_estimation: ['intro-to-system-design', 'rate-limiting'],
    architecture_design: ['message-queues', 'async-processing', 'idempotency'],
    database_design: ['sql-vs-nosql', 'database-indexing', 'cache-strategies'],
    scalability_reliability: [
      'rate-limiting',
      'fault-tolerance',
      'idempotency',
    ],
    tradeoff_reasoning: ['message-queues', 'consistency-models'],
  },
  fieldHints: {
    capacity:
      'Compare peak rates per channel with each provider’s limit. How long does a 30-million-user email campaign take to send?',
    architecture:
      'Trace a one-time passcode request through the system while a 30-million-user campaign is in progress.',
    failures:
      'A worker crashes right after the SMS provider accepted a message but before you recorded it. What happens next, and what can you guarantee?',
  },
}

import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'notification-system-pass-broker',
    label: 'Message broker with per-channel, per-priority topics',
    expect: 'pass',
    note: 'A complete queue-based design: atomic idempotency on accept, separate transactional and marketing topics per channel, send-time preference and quiet-hour checks, shared token-bucket rate limits with transactional priority, backoff, dead-letter handling, provider failover, and an honest at-least-once guarantee. Capacity math matches the scale and provider limits.',
    answers: {
      functional: `In scope: a send API for internal services (user, type, data, idempotency key, priority); channel selection from user preferences; opt-outs within 1 minute, with security messages always sent; localized templates; scheduled campaigns up to 30M users that respect local quiet hours; retries without duplicates; status queries for 90 days. Out of scope: our own delivery infrastructure, campaign UI, segmentation.`,
      nonFunctional: `- Transactional: handed to the provider within 5 s p99, even during campaigns.
- Send API 99.95% available; once accepted (202), a notification is durable.
- Delivery to providers is at-least-once with deduplication; duplicates should be rare, not impossible.
- Marketing is throughput-oriented: minutes of delay are fine.
- Passcodes never written to logs or long-term storage.`,
      capacity: `Average: 500M/day ÷ 86,400 ≈ 5,800/s (push ~4,600, email ~1,040, SMS ~120). Transactional ≈ 1,160/s.
Peak campaigns: up to 20k/s offered, but email is capped at 5,000/s and SMS at 1,000/s by providers, so the queue absorbs the burst. A 30M-user email campaign at, say, 4,000/s (leaving 1,000/s for transactional email) takes 30M / 4,000 = 7,500 s ≈ 2 hours.
Storage: 500M × 500 B = 250 GB/day; 90 days ≈ 22.5 TB before replication. Preferences: 120M × 200 B = 24 GB, small enough to cache fully.
Cost: a 1% duplicate rate on SMS would be 100k × $0.008 = $800/day, so SMS dedupe matters.`,
      api: `POST /v1/notifications
{userId, type, data, idempotencyKey, priority: "transactional"|"marketing", channels?}
→ 202 {notificationId} (or the original notificationId if the key was already used)
→ 400 unknown type or missing template data; 429 per-caller rate limit.
POST /v1/campaigns {type, userListUri, sendAt} → 202 {campaignId}
GET /v1/notifications/{id} → status history per channel.
GET /v1/users/{userId}/notifications?from&to → recent notifications.
POST /internal/providers/{name}/callbacks for delivery receipts and bounces.`,
      database: `Idempotency: a key-value store with conditional insert: put (callerId, idempotencyKey) → notificationId if absent, TTL 7 days. Atomic, so two concurrent retries cannot both create a notification.
Notifications and status events: a wide-column store, partition key (userId, day), clustered by notificationId, TTL 90 days. Template data for secret-bearing types is stored only in the queue message, encrypted, and never in this table.
Preferences: relational table (userId, category, channel, enabled, quietHoursTz) as the source of truth, cached in an in-memory store; updates write through and publish an invalidation, so opt-outs apply within seconds.
A small lookup table maps notificationId and providerMsgId to (userId, day), so status queries by id and provider callbacks can find the partition.
Templates: relational, versioned per type and locale. Campaigns: relational with progress counters.`,
      architecture: `1. API validates, performs the idempotency put, writes the notification record, publishes to the topic for its priority, marks the record published, and returns 202. If a retry finds the key already used but the record not yet marked published (the API crashed between steps), it publishes again before answering; downstream dedupe on notificationId makes the second publish harmless, and an accepted notification is never stranded.
2. Router workers consume, load preferences (cache), pick channels, check quiet hours for marketing (if inside, re-enqueue with a delay until 08:00 local), render the template, and publish to per-channel topics: push-tx, push-mkt, email-tx, email-mkt, sms-tx, sms-mkt.
3. Channel senders take a token from that provider’s shared bucket and call the provider. Transactional consumers always run; marketing consumers only take tokens left over after a reserved share.
4. Senders record “sent” with the provider’s message ID; provider callbacks update to delivered or failed.
5. Campaigns: a scheduler reads the user list in chunks of 10k and enqueues marketing notifications at a controlled rate; preferences are checked per user when each message is sent, not at campaign creation.`,
      scalability: `All workers are stateless and scale with topic partitions. Transactional topics are separate, so a 30M-message marketing backlog never sits in front of a passcode. The rate limiter is a shared token bucket per provider in an in-memory store, with a reserved 20% for transactional; marketing senders back off when the bucket is empty instead of hammering the provider. Preference reads hit the cache (24 GB fits in memory). The status store scales by adding nodes; partitioning by (userId, day) spreads writes evenly.`,
      failures: `Provider 5xx or timeout: retry with exponential backoff and jitter (1 s, 2 s, 4 s ... up to 5 attempts for transactional, longer schedule for marketing), then dead-letter with alerting. Permanent errors (invalid device token, hard bounce) are not retried and update the user’s channel state. Provider outage: a circuit breaker opens and transactional SMS and email fail over to a secondary provider; marketing pauses. Worker crash mid-send: the message is redelivered; before calling the provider the sender checks for a “sent” record and passes the notificationId as the provider’s idempotency key where supported. A crash after the provider accepted but before recording can still produce a duplicate, so delivery is at-least-once; I accept that rather than risk losing a passcode.`,
      tradeoffs: `Broker vs DB job table: the broker gives high throughput and easy fan-out to channel topics, but status queries need a separate store. Checking preferences at send time costs a cache read per message but makes opt-outs effective within a minute even for queued campaigns. Reserving 20% of provider capacity for transactional wastes some throughput during campaigns, but guarantees the 5 s target. Failing over transactional traffic to a second provider costs more per message and a second sender identity to manage, which is worth it for passcodes but not for marketing.`,
    },
  },
  {
    id: 'notification-system-pass-job-table',
    label: 'Sharded relational job table with priority claiming',
    expect: 'pass',
    note: 'A genuinely different valid design: no message broker; notifications are rows in a sharded relational job table, a unique constraint enforces idempotency, workers claim due rows by priority with row locking that skips locked rows, and status lives in the same rows. Write load is estimated and sharded to fit; rate limits, retries, quiet hours and the at-least-once limit are handled.',
    answers: {
      functional: `Send API with userId, type, data, idempotency key and priority; channels from preferences; opt-out within 1 minute except security messages; localized templates; scheduled campaigns up to 30M users with quiet hours; retries with no duplicates per key; status history for 90 days. Not building providers, campaign UI or segmentation.`,
      nonFunctional: `Transactional p99 ≤ 5 s to provider handoff. Accepted notifications are durable (committed to a replicated database) before 202. API availability 99.95%. Duplicates minimized; I can guarantee at most one notification record per idempotency key, but delivery to providers is at-least-once. Passcodes are not retained.`,
      capacity: `5,800/s average, ~20k/s peak inserts during campaigns.
Each notification row changes ~3 times (claimed, sent, delivered/failed), so peak writes ≈ 20k inserts + 60k updates ≈ 80k writes/s. A single relational primary will not do that comfortably; I shard by userId hash across 16 shards → ~5k writes/s per shard, which a well-provisioned primary handles.
Provider-bound: email 5,000/s and SMS 1,000/s cap the drain rate; a 30M email campaign needs at least 100 minutes.
Storage: 250 GB/day; 90 days ≈ 22.5 TB → ~1.4 TB per shard, using daily partitions so old data is dropped, not deleted row by row.`,
      api: `POST /notifications {userId, type, data, idempotencyKey, priority} → 202 {id}; repeating the key returns 200 with the same id.
POST /campaigns {type, userIds file, sendAt} → 202 {campaignId}
GET /notifications/{id}, GET /users/{userId}/notifications?since=
Provider webhooks: POST /webhooks/{provider} updates status by provider message ID.
Errors: 400 bad payload, 403 caller not allowed to send this type, 429 per-caller quota.`,
      database: `Sharded relational database (by userId). Table notifications(id, userId, callerId, idempotencyKey, type, channel, priority, status, notBefore, attempts, providerMsgId, createdAt, payloadRef) with UNIQUE(callerId, idempotencyKey, channel) per shard (the API inserts all of a request’s channel rows in one transaction); since the shard is chosen by userId, the key is unique per user, which is the scope callers need. The insert either succeeds or hits the constraint, so there is no check-then-insert race. Index (status, priority, notBefore) for claiming. Daily partitions dropped after 90 days.
Secrets: payloads for passcode types are kept only in an encrypted short-TTL key-value entry (payloadRef), deleted after sending.
Preferences: a separate table per shard plus a cache with 30 s TTL and explicit invalidation on change.`,
      architecture: `1. API inserts one row per selected channel (status=queued, notBefore=now or the scheduled time) and returns 202.
2. Workers on each shard claim work with SELECT ... WHERE status='queued' AND notBefore <= now() ORDER BY priority, notBefore LIMIT 100 FOR UPDATE SKIP LOCKED, mark rows claimed with a lease expiry, and commit. Transactional rows sort first, so a campaign never blocks them.
3. For each row: check preferences and quiet hours (if quiet, set notBefore to 08:00 local and release), render, take a token from the provider’s rate limiter, call the provider, store providerMsgId and status=sent.
4. Webhooks update delivered/failed.
5. Campaign scheduler inserts rows for the user list in batches of 5k per shard, spread over time to avoid flooding.`,
      scalability: `Throughput scales by adding shards (rebalancing by userId ranges) and workers per shard. SKIP LOCKED lets many workers claim from the same table without contention. Dedicated transactional workers only claim priority=transactional rows, so they always have capacity. Provider limits are enforced by a shared token bucket per provider in an in-memory store, with 20% reserved for transactional. Campaign inserts are paced so the database keeps headroom for transactional writes.`,
      failures: `Worker dies holding rows: the lease expires (30 s) and another worker reclaims them. Before sending, a worker re-reads the row; if it is already sent, it skips it. A crash after the provider accepted but before the status update can still cause a duplicate; where providers accept an idempotency key we pass the row id. Provider error: attempts++, notBefore = now + backoff with jitter; after the maximum attempts, status=dead with the reason, alerting on the dead rate. Provider outage: circuit breaker, failover to a secondary provider for transactional SMS and email. Shard primary failure: synchronous replica is promoted; the API returns 503 for that shard briefly and callers retry with the same key safely.`,
      tradeoffs: `A job table instead of a broker gives me atomic idempotency, status and scheduling in one place, plus easy queries for support, at the cost of database write load (80k writes/s needs 16 shards) and polling overhead. A broker would scale writes more cheaply but needs a separate status store and dedupe store. Send-time preference checks cost a cache read but satisfy the 1-minute opt-out rule. At-least-once over at-most-once: a rare duplicate passcode is better than a missing one.`,
    },
  },
  {
    id: 'notification-system-fail-shallow',
    label: 'Shallow: generic queue, no mechanisms',
    expect: 'fail',
    note: 'Names a queue and workers but gives no numbers, no priority isolation, no idempotency mechanism, no rate limiting against provider limits, and only "retry" as failure handling. Misses the transactional latency driver entirely.',
    answers: {
      functional: `Send push, email and SMS notifications to users. Users can choose which notifications they want. Support campaigns.`,
      nonFunctional: `The system must be reliable, scalable and fast. Notifications should not be lost.`,
      capacity: `There are 500 million notifications a day, which is a lot, so we need a queue and many workers.`,
      api: `POST /notify with the user and the message. GET /status/{id}.`,
      database: `We store notifications and user preferences in a database. MongoDB works well because the data is flexible.`,
      architecture: `Services call the notification API, which puts the notification on a queue. Workers read from the queue, check the user's preferences and send it through the right provider.`,
      scalability: `Add more workers when the queue gets long. Use a cache for preferences.`,
      failures: `If sending fails, retry it. Use a dead letter queue for failed messages.`,
      tradeoffs: `Using a queue makes the system asynchronous, which is more scalable but adds some latency.`,
    },
  },
  {
    id: 'notification-system-fail-wrong',
    label: 'Confident but technically wrong',
    expect: 'fail',
    note: 'Confident but wrong in important ways: average rate understated about 10x, a claim that broker exactly-once semantics guarantee exactly-once SMS delivery, one shared FIFO queue so passcodes wait behind campaigns, immediate tight-loop retries with no rate limiting against provider caps, opt-outs checked only at campaign creation, and passcodes logged in plain text.',
    answers: {
      functional: `Send API, preferences, templates, campaigns, retries, status tracking. Every notification is delivered exactly once on every channel.`,
      nonFunctional: `Exactly-once delivery to users is guaranteed end to end. Transactional within 5 s. 99.95% availability.`,
      capacity: `500M notifications per day is about 580 per second, well under the SMS limit of 1,000/s and the email limit of 5,000/s, so we never need to throttle. Storage is about 250 MB per day.`,
      api: `POST /send {userId, message, channel} → 200 after the provider responds, so the caller knows it was delivered. No idempotency key is needed because the broker guarantees exactly-once.`,
      database: `A single relational database holds notifications, preferences and full payloads, including passcodes, so support can see exactly what was sent. Preferences for a campaign are loaded once when the campaign is created and stored with it.`,
      architecture: `The API calls the provider synchronously, and if that fails it writes the notification to one FIFO queue shared by all channels and priorities. We enable the broker's exactly-once mode, so each message is consumed once, which means each SMS is sent exactly once. Campaigns are pushed into the same queue all at once when they start, so they are delivered as fast as possible.`,
      scalability: `FIFO ordering is fair: everything is sent in the order it arrived. More consumers make the queue drain faster, so during a campaign we add consumers to send faster.`,
      failures: `If the provider returns an error, the worker retries immediately up to 20 times in a loop so the user gets the message as soon as possible. Because of exactly-once mode, a worker crash cannot cause a duplicate.`,
      tradeoffs: `Exactly-once mode is slightly slower but removes the need for deduplication. One queue is simpler than many. Logging full payloads helps debugging.`,
    },
  },
]

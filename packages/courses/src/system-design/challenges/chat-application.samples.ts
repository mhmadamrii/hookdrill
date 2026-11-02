import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'chat-application-pass-conversation-store',
    label: 'Per-conversation sequence, wide-column store, session registry',
    expect: 'pass',
    note: 'Sound design: WebSocket gateways, a session registry for routing, a conversation owner assigning sequence numbers, durable write before ack, client message IDs for dedupe, per-device cursors for sync, and a wide-column store partitioned by conversation. Capacity math is correct and failures are handled concretely.',
    answers: {
      functional: `In scope: 1:1 and group chats (≤500 members), real-time delivery to online devices, delivery on reconnect for offline ones, the same order for all members, sent/delivered/read receipts, up to 3 devices per user with shared history, and online/last-seen presence. Out of scope: media, calls, E2E key management, and the push notification service itself (we call it for offline users).`,
      nonFunctional: `- Delivery p99 < 500 ms when both online in one region.
- No loss after the server acks to the sender: the ack happens only after a replicated write.
- 99.99% availability for messaging; presence can be stale or briefly unavailable.
- Order is per conversation, not global.
- At-least-once delivery with dedupe, because mobile clients retry.
- History retained 1 year.`,
      capacity: `Messages: 50M DAU × 40 = 2B/day ÷ 86,400 ≈ 23k/s, peak ×3 ≈ 70k/s.
Fan-out: 0.7 × 1 + 0.3 × 19 ≈ 6.4 recipients → ~150k deliveries/s average, ~450k/s peak; with ~1.5 devices per user ≈ 675k device pushes/s peak.
Connections: 20M concurrent. Assuming ~100k connections per gateway server (mostly idle sockets), that is 200 servers; I would run ~300 for headroom and zone loss.
Storage: 2B × 300 B = 600 GB/day ≈ 220 TB/year, ×3 replication ≈ 660 TB.
Receipts: if each delivery produces a delivered and a read receipt, that is up to 2× the delivery rate in small updates, so receipts must be batched.`,
      api: `Over the WebSocket (JSON or binary frames):
- send {clientMsgId, conversationId, text} → ack {clientMsgId, seq, serverTs} or error {code: NOT_MEMBER | RATE_LIMITED}.
- server push message {conversationId, seq, senderId, text, ts}.
- receipt {conversationId, seq, type: delivered|read} (client sends the highest seq, not one per message).
HTTP:
- GET /v1/sync?since=<cursor per conversation> → missed messages, paginated.
- POST /v1/conversations, POST /v1/conversations/{id}/members for group management.
Presence: client sends a heartbeat every 30 s; subscribe {userIds} returns online/lastSeen.`,
      database: `Messages: a wide-column store, partition key = (conversationId, monthBucket), clustering key = seq ascending. “Give me messages after seq N” is one range read in one partition, writes are appends, and the month bucket keeps very busy group partitions bounded. A table-level TTL of 1 year handles retention.
Conversation metadata and membership: a relational database (small, transactional, changes rarely), cached.
Per-device read/delivered cursors: key-value (userId, deviceId, conversationId) → lastSeq.
Session registry and presence: in-memory key-value with TTL (userId → gatewayId list; userId → lastSeen). This data can be rebuilt from heartbeats, so it does not need strong durability.`,
      architecture: `1. Device opens a WebSocket via the load balancer to a gateway; the gateway writes userId → gatewayId (TTL 60 s, refreshed by heartbeat) to the session registry.
2. Device sends {clientMsgId, ...}. The gateway forwards it to the chat service instance that owns that conversation (consistent hashing on conversationId).
3. The owner checks (conversationId, clientMsgId) in a dedupe cache; if seen, it returns the original seq. Otherwise it assigns seq = last + 1, writes the message with quorum to the store, and only then acks the sender.
4. The owner looks up members’ gateways in the session registry and sends the message to each gateway, which pushes it to devices. Offline members get a push notification via the existing service.
5. A reconnecting device calls sync with its cursors and gets everything after them.`,
      scalability: `Gateways scale horizontally and hold no durable state. The chat service is partitioned by conversationId, so each conversation’s sequence is assigned in one place without global coordination; adding instances moves a slice of conversations. The store scales by adding nodes; partitions are spread by conversationId. For large groups (hundreds of members), the owner groups recipients by gateway and sends one batch per gateway. Receipts and presence are batched (send highest seq; presence only to contacts with the chat open) to keep them below message volume.`,
      failures: `Gateway crash: its clients reconnect with jittered exponential backoff to other gateways and call sync with their cursors, so nothing is lost; registry entries expire after 60 s. Chat service instance crash: ownership moves to another instance, which reads the latest seq from the store before assigning new ones (a lease with a fencing token prevents two owners). Store node failure: replication factor 3 with quorum writes, so acked messages survive. Client retry: same clientMsgId → dedupe returns the original seq. Delivery to a gateway fails: the recipient still gets the message on next sync.`,
      tradeoffs: `Per-conversation storage vs per-user inbox fan-out: I store each message once and each device reads conversations by cursor; the cost is that sync touches many conversations for a user in many chats, which I mitigate by keeping a small per-user “conversations changed since” list. A single owner per conversation makes ordering simple but adds a hop and a failover step. WebSockets mean stateful gateways and reconnect storms, but polling at this scale would be far more expensive and slower. Presence is eventually consistent; showing someone as online for an extra minute is acceptable.`,
    },
  },
  {
    id: 'chat-application-pass-log-inbox',
    label:
      'Partitioned log plus per-user inboxes in a sharded relational store',
    expect: 'pass',
    note: 'A genuinely different valid design: messages enter a replicated, partitioned log keyed by conversation (ordering from the single partition consumer), then are fanned out to per-user inboxes in a sharded relational database, and every device syncs a single inbox by cursor. Write amplification is acknowledged and quantified; failures and dedupe are handled.',
    answers: {
      functional: `Send and receive text in 1:1 and group chats up to 500 members; online delivery in real time; offline delivery on reconnect; consistent order inside a conversation; delivered/read receipts per member; multi-device (max 3) history sync; presence. Not doing: attachments, calls, E2E encryption keys, push notification delivery (existing service).`,
      nonFunctional: `p99 delivery under 500 ms online-to-online. An acked message is durable (written to a replicated log). 99.99% availability for messaging. Ordering only within a conversation. Duplicate sends from retries must not create duplicate messages. Presence is best-effort.`,
      capacity: `2B messages/day ≈ 23k/s avg, 70k/s at a 3× peak.
Inbox writes: each message goes to every member’s inbox including the sender (for their other devices): 0.7 × 2 + 0.3 × 20 = 7.4 inbox rows per message → ~170k rows/s average, ~520k/s peak.
Storage: message bodies 2B × 300 B = 600 GB/day. Inbox rows are small (userId, inboxSeq, conversationId, messageId ≈ 40 B): 2B × 7.4 × 40 B ≈ 600 GB/day. Total ~1.2 TB/day ≈ 440 TB/year before replication.
Connections: 20M concurrent at ~50k per server (being conservative about memory and TLS) = 400 connection servers.`,
      api: `WebSocket messages:
- SEND {clientMsgId, conversationId, body} → SENT {clientMsgId} (the sender’s devices later receive the stored message with its convSeq like any member)
- DELIVER {inboxSeq, conversationId, convSeq, messageId, body} pushed to devices
- ACK {inboxSeq} from device (its cursor advances)
- READ {conversationId, convSeq}
REST: GET /inbox?after=<inboxSeq>&limit=200 for catch-up; group management endpoints. Errors: 403 not a member, 429 rate limit, 409 duplicate clientMsgId returns the original message.`,
      database: `A sharded relational database (sharded by userId) holds inboxes: inbox(userId, inboxSeq, conversationId, convSeq, messageId), primary key (userId, inboxSeq). A device syncs with one indexed range scan: WHERE userId = ? AND inboxSeq > cursor. Message bodies live in a separate table sharded by conversationId with primary key (conversationId, convSeq), plus a unique index on (conversationId, clientMsgId) for dedupe. Tables are partitioned by month, so dropping a month’s partition handles 1-year retention cheaply. Device cursors live in a small table (userId, deviceId) → inboxSeq. Presence and routing are in an in-memory store with TTLs.`,
      architecture: `1. Gateway receives SEND and appends it to a replicated, partitioned log keyed by conversationId. Once the log confirms a replicated write, the gateway replies SENT. Ordering within a conversation follows because one partition has one consumer at a time.
2. The sequencer consumer for that partition checks the unique (conversationId, clientMsgId) index and skips a retried message, otherwise assigns the next convSeq, inserts the message row and emits fan-out tasks.
3. Fan-out workers look up members and append an inbox row per member; each user’s inboxSeq comes from a per-user counter on that user’s shard.
4. After writing, a worker looks up the user’s gateways in the routing store and pushes DELIVER. Devices ACK, advancing their cursor.
5. Offline or reconnecting devices call GET /inbox with their cursor.`,
      scalability: `Log partitions and sequencer consumers scale with conversation volume; fan-out workers scale independently. Inbox shards are split by userId range as data grows. Every device reads exactly one inbox no matter how many conversations the user is in, which makes sync cheap. Big groups are the costly case (500 inbox rows per message), so groups over 100 members are fanned out in batches and rate-limited per group. Gateways are stateless apart from sockets.`,
      failures: `Log broker failure: partitions are replicated 3 ways and a follower takes over leadership; producers retry with the same clientMsgId, and the unique index makes the retry harmless. Sequencer crash: the consumer group reassigns the partition and resumes from the last committed offset; reprocessed messages hit the unique index. Fan-out worker crash: tasks are redelivered; the inbox insert is idempotent on (userId, messageId). Gateway crash: devices reconnect with backoff and jitter and resume from their cursor. Inbox shard failover: a synchronous replica is promoted, so acknowledged inbox rows are not lost.`,
      tradeoffs: `Fan-out on write to inboxes vs storing per conversation: I pay about 7× more writes and roughly double the storage, but sync is a single range read per device and delivery state is simple. Acking after the log write (not after fan-out) gives low send latency, at the cost of recipients seeing the message a little later than the sender sees “sent”. A relational database with manual sharding is more operational work than a wide-column store but gives transactions and unique indexes for dedupe. Presence is best-effort to protect messaging capacity.`,
    },
  },
  {
    id: 'chat-application-fail-shallow',
    label: 'Shallow: components without mechanisms',
    expect: 'fail',
    note: 'Mentions WebSockets and a database but gives no numbers, no routing between servers, no ordering or dedupe mechanism, no offline or multi-device sync, and no failure handling beyond "replicas". Well below the pass mark.',
    answers: {
      functional: `Users can chat one-on-one and in groups. Messages should be delivered in real time. Users can see read receipts and online status.`,
      nonFunctional: `Low latency, high availability and scalability. Messages should not be lost.`,
      capacity: `There are 50 million users who send a lot of messages, so we need many servers and a big database.`,
      api: `sendMessage(to, text) and getMessages(conversationId). We use WebSockets for real time.`,
      database: `Cassandra, because it is good for chat apps and handles large amounts of data.`,
      architecture: `Clients connect to chat servers using WebSockets. When a user sends a message, the server saves it to the database and sends it to the other user. A load balancer distributes users across chat servers.`,
      scalability: `Add more chat servers when there are more users. Use caching for recent messages. The database is distributed.`,
      failures: `The database has replicas. If a server goes down, users will reconnect.`,
      tradeoffs: `WebSockets are better than polling for real time. Cassandra is better than MySQL for scale.`,
    },
  },
  {
    id: 'chat-application-fail-wrong',
    label: 'Confident but technically wrong',
    expect: 'fail',
    note: 'Specific and assured, but wrong in critical ways: message rate understated about 10x and storage about 1,000x, global ordering by client timestamps, acking before anything is durable, one unreplicated pub/sub node carrying all traffic, 1-second polling for 20 million connected users, and a CAP misconception ("choose CA").',
    answers: {
      functional: `1:1 and groups up to 500, real-time and offline delivery, receipts, multi-device, presence. Messages are globally ordered across the whole system so every user sees a consistent timeline.`,
      nonFunctional: `Under 500 ms delivery, 99.99% availability. We choose CA from the CAP theorem: consistent and available, since our data centers are reliable enough that partitions don’t happen.`,
      capacity: `2B messages a day is about 2,300 messages per second, which a few servers can handle. At 300 bytes each that is 600 MB per day, so storage is not a concern for years.`,
      api: `POST /messages {to, text, clientTimestamp}. GET /messages/poll every 1 second to fetch new messages. This is simpler than WebSockets and works everywhere.`,
      database: `One MySQL database with a messages table indexed by clientTimestamp. Because data volume is small (under 1 TB per year), a single primary is enough and sharding is unnecessary.`,
      architecture: `The client sends the message with its own timestamp. The API server immediately acks the sender and publishes the message to a single Redis pub/sub channel; a writer process subscribes and saves to MySQL in the background. Recipients poll every second and the server returns messages ordered by clientTimestamp, which gives a global order. Multi-device works because all devices poll the same endpoint.`,
      scalability: `Polling servers are stateless and scale behind a load balancer. Redis pub/sub is in-memory and very fast, so one instance can carry all traffic.`,
      failures: `If Redis restarts, the writer reconnects and continues. If the API server crashes, the client sends again; duplicates are fine because the timestamps will be identical. MySQL is backed up nightly.`,
      tradeoffs: `Polling over WebSockets: simpler and stateless. Client timestamps over server sequence numbers: no coordination needed and they give a total order. One database instead of sharding: simpler operations.`,
    },
  },
]

import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `**Parley** is a mobile and desktop messaging app. People use it for one-to-one conversations and small group chats with family, friends and coworkers. Messages must arrive within a second when both people are online, must never be lost once the sender sees them as sent, and must show up in the same order for everyone in a conversation.

Users often have the app on more than one device (a phone and a laptop), and they expect every device to show the same history. They also expect to see when a message was delivered and read, and whether a contact is online.

Design the backend for sending, delivering, storing and syncing text messages.`,
  requirements: [
    'Users can send text messages in one-to-one conversations and in groups of up to 500 members.',
    'Messages are delivered in real time to recipients who are online, and delivered on reconnect to recipients who were offline.',
    'Every member of a conversation sees its messages in the same order.',
    'Senders see sent, delivered and read status for each message (per member in groups).',
    'A user can be signed in on up to 3 devices; all devices show the same conversation history, including messages sent from the other devices.',
    'Users can see whether a contact is online or when they were last seen.',
  ],
  scale: [
    '50 million daily active users, with up to 20 million connected at the same time at peak.',
    'Each daily active user sends 40 messages per day on average: about 2 billion messages per day, about 23,000 per second on average and about 70,000 per second at peak.',
    '70% of messages are one-to-one and 30% go to groups with 20 members on average, so each message is delivered to about 6.4 recipients on average (about 450,000 deliveries per second at peak, before counting multiple devices).',
    'A stored message is about 300 bytes including metadata (the text itself averages 100 bytes): about 600 GB per day, or about 220 TB per year before replication.',
    'Message history is kept on the server for 1 year, then deleted.',
  ],
  constraints: [
    'Delivery latency: p99 under 500 ms from send to recipient device when both are online in the same region.',
    'Durability: once the server acknowledges a message to the sender, it must not be lost.',
    'Availability: 99.99% for sending and receiving messages. Presence may degrade before messaging does.',
    'Mobile clients lose connectivity often; the design must tolerate reconnects and duplicate sends from client retries.',
    'Out of scope: media attachments, voice and video calls, end-to-end encryption key management, and push notification delivery for offline users (assume an existing push service you can call).',
  ],
  instructions: `Fill in every field of the submission form. Your design is graded against the rubric below, not compared with a reference answer: different architectures (for example, per-conversation storage versus per-user inboxes) can all score well if the reasoning holds and the requirements are met.

- **Capacity estimation:** show the arithmetic for message rates, delivery fan-out, concurrent connections and storage, and state your assumptions.
- **Real-time delivery:** explain how a message gets from the sender’s server to the server holding each recipient’s connection.
- **Ordering and duplicates:** explain how you assign order within a conversation and how a retried send is not stored twice.
- **Offline and multi-device:** explain how a device that reconnects finds out what it missed.
- **Failure handling:** cover a connection server crashing, a storage node failing and a client retrying.`,
  rubric: {
    version: '1.0',
    passMark: 75,
    criteria: [
      {
        id: 'requirements_understanding',
        title: 'Requirements understanding',
        weight: 15,
        description:
          'Strong answers cover one-to-one and group messaging, online and offline delivery, per-conversation ordering, delivery and read receipts, multi-device sync and presence, and translate the brief into targets: sub-second delivery, no loss after acknowledgment, 99.99% availability, and tolerance of flaky mobile connections. They recognize that ordering is needed within a conversation, not globally, and that presence can be weaker than message delivery. Penalize answers that drop multi-device sync or offline delivery, or that require a global total order across all conversations.',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'Strong answers derive message writes (about 23,000/s average, about 70,000/s peak), delivery fan-out (several hundred thousand deliveries per second at peak, more with multiple devices), concurrent persistent connections (about 20 million, and how many connection servers that implies under a stated per-server limit), and storage (about 600 GB/day, about 220 TB/year before replication). Assumptions and arithmetic are shown. Penalize order-of-magnitude errors, ignoring group fan-out, and ignoring the number of open connections.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        description:
          'Strong answers use persistent client connections (for example WebSockets or a similar long-lived protocol) terminated on connection servers, a way to route a message to whichever server holds each recipient connection (a session registry, a pub/sub layer, or partitioned routing), durable storage before the sender is acknowledged, and a sync mechanism for offline and additional devices (for example per-device cursors over a per-conversation sequence or a per-user inbox). Ordering comes from a per-conversation sequence number assigned in one place (a conversation owner, a partitioned log, or an atomic counter), not from client or server wall clocks. Retries are made safe with a client-generated message ID and deduplication. Any technology is acceptable if the reasoning holds. Penalize HTTP polling at high frequency for 20 million users without justification, ordering by timestamps from many machines, acknowledging before the message is durable, and designs with no path for offline delivery.',
        minScore: 50,
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        description:
          'Strong answers choose storage for a write-heavy, append-mostly workload read in ranges: messages partitioned by conversation (or per-user inbox) and sorted by sequence, so “messages after N in conversation C” is one range read. Suitable choices include a wide-column store, a sharded relational database, or a key-value store with sorted keys, as long as partitioning and access patterns are explained. They separate fast-changing state (presence, session routing, read cursors) from message history, address the 1-year retention (for example time-based expiry or partition dropping), and avoid hot partitions for very large groups. Penalize a single unsharded database for 220 TB/year, and storage choices not tied to access patterns.',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        description:
          'Strong answers scale connection servers horizontally, handle a connection server crash (clients reconnect to another server and resync from their cursor, stale routing entries expire), replicate message storage so an acknowledged message survives a node loss, deliver at least once with deduplication on the client or server, retry delivery with backoff, and keep presence cheap (heartbeats with expiry, updates batched or limited to contacts who are looking). They address reconnect storms after an outage (for example jittered backoff) and large-group fan-out. Penalize single points of failure such as one routing or pub/sub node with no replica, storing undelivered messages only in memory, and claims of exactly-once delivery over an unreliable network without explaining deduplication.',
        minScore: 50,
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'Strong answers weigh real alternatives: per-conversation storage versus fan-out to per-user inboxes (write amplification versus simpler sync), push over persistent connections versus polling (server state versus latency and battery), where the sequence number is assigned (coordination versus throughput), and how much consistency presence and read receipts need. Reasoning ties back to the stated latency, durability and availability targets. Penalize one-sided claims and misuse of CAP or consistency terms.',
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
      'message-queues',
      'event-driven-architecture',
      'service-discovery',
    ],
    database_design: ['sql-vs-nosql', 'database-sharding'],
    scalability_reliability: [
      'horizontal-vertical-scaling',
      'fault-tolerance',
      'idempotency',
    ],
    tradeoff_reasoning: ['consistency-models', 'cap-theorem'],
  },
  fieldHints: {
    capacity:
      'Besides messages per second, estimate deliveries per second after group fan-out, concurrent connections, and storage per year.',
    architecture:
      'Trace one message from the sender’s device to a recipient on a different connection server, and to a recipient who is offline.',
    database:
      'What is the partition key and sort order for messages? Where do presence and “last read” positions live?',
    failures:
      'What happens when a connection server dies with 100,000 clients on it, and when a client resends a message it already sent?',
  },
}

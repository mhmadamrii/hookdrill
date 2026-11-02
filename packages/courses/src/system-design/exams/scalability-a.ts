import type { Question } from '../../types'

export const examQuestions: Question[] = [
  {
    id: 'sd-scalability-x1',
    objective: 'sd-database-replication-1',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'A team scaled its stateless app tier from 2 to 10 servers. Now the single PostgreSQL server sits near full CPU, and almost all of its queries are reads. Which next step adds read capacity without changing how the data is divided?',
    options: [
      {
        id: 'a',
        text: 'Add 10 more app servers behind the load balancer',
        explanation:
          'The database is the bottleneck. More app servers send it even more queries.',
      },
      {
        id: 'b',
        text: 'Shard the tables across several database servers',
        explanation:
          'Sharding does spread load, but it divides the data across servers, which the question rules out, and it targets write and storage limits more than read load.',
      },
      {
        id: 'c',
        text: 'Add read replicas and route read-only queries to them',
        explanation:
          'Correct. Followers hold full copies and serve reads in parallel. The app must handle replication lag, for example by reading a user’s own recent writes from the leader.',
      },
      {
        id: 'd',
        text: 'Turn on synchronous replication to one standby',
        explanation:
          'Synchronous replication changes when commits are confirmed. It does not by itself move any reads off the primary, and it slows commits.',
      },
    ],
    answer: 'c',
  },
  {
    id: 'sd-scalability-x2',
    objective: 'sd-database-sharding-1',
    kind: 'concept',
    difficulty: 'hard',
    prompt:
      'A database is hash-sharded across four shards, and each shard is a single server with no replicas. One shard’s server fails. What is the effect, and what design change prevents it?',
    options: [
      {
        id: 'a',
        text: 'That shard’s data is unavailable; replicate each shard so a follower can take over',
        explanation:
          'Correct. Each record lives on exactly one shard, so its data is unreachable while the others keep serving. Giving each shard a leader and followers allows failover.',
      },
      {
        id: 'b',
        text: 'The whole database goes down; add a fifth shard as a spare',
        explanation:
          'The other three shards keep serving their own keys. An empty extra shard holds none of the failed shard’s data.',
      },
      {
        id: 'c',
        text: 'Nothing is lost; the other shards automatically serve its keys',
        explanation:
          'The other shards do not hold copies of that shard’s records, so they cannot serve them.',
      },
      {
        id: 'd',
        text: 'Nothing is lost; sharding stores every record on two shards',
        explanation:
          'Sharding splits data without copying it. Keeping copies is replication, which this setup lacks.',
      },
    ],
    answer: 'a',
  },
  {
    id: 'sd-scalability-x3',
    objective: 'sd-message-queues-3',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'Image-processing workers autoscale on queue depth. During a spike they grow from 2 to 40 instances, and the database they write results to starts refusing connections. Failed jobs are retried, so the queue grows further and even more workers start. What is the best response?',
    options: [
      {
        id: 'a',
        text: 'Raise the autoscaler’s maximum so the backlog drains faster',
        explanation:
          'More workers open more connections to the database that is already refusing them, so failures and retries increase.',
      },
      {
        id: 'b',
        text: 'Shorten the visibility timeout so failed jobs retry sooner',
        explanation:
          'Faster retries add load to the overloaded database and can duplicate jobs that are still running.',
      },
      {
        id: 'c',
        text: 'Switch the workers to at-most-once processing',
        explanation:
          'Acknowledging before processing would silently drop the jobs that fail, losing work instead of fixing the overload.',
      },
      {
        id: 'd',
        text: 'Cap workers at what the database can take and let the queue hold the rest',
        explanation:
          'Correct. Scaling out consumers only helps while their downstream keeps up. Limiting concurrency and pooling connections is backpressure; the queue absorbs the backlog, and the database can be scaled separately.',
      },
    ],
    answer: 'd',
  },
  {
    id: 'sd-scalability-x4',
    objective: 'sd-message-queues-2',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'A consumer receives “order placed” messages with at-least-once delivery and inserts each order into an `orders` table hash-sharded by `customer_id`. To drop duplicates, it relies on a unique constraint on `(customer_id, message_id)`, which each shard enforces only for its own rows. Every redelivery carries the same message body. Does this deduplicate correctly?',
    options: [
      {
        id: 'a',
        text: 'No: a redelivered message can be routed to a different shard',
        explanation:
          'Routing hashes the shard key, and a redelivery carries the same `customer_id`, so it always goes to the same shard.',
      },
      {
        id: 'b',
        text: 'Yes: a duplicate has the same `customer_id`, so it hits the same shard’s constraint',
        explanation:
          'Correct. Because the constraint includes the shard key, both copies of a message land on one shard, and that shard rejects the second insert.',
      },
      {
        id: 'c',
        text: 'No: at-least-once delivery makes the database reject every insert',
        explanation:
          'Only the second and later copies of a message violate the constraint; the first insert succeeds.',
      },
      {
        id: 'd',
        text: 'Yes: sharded databases enforce uniqueness on any column globally',
        explanation:
          'Uniqueness is generally enforced per shard. It works here because the constraint includes the shard key, not because of a global check.',
      },
    ],
    answer: 'b',
  },
]

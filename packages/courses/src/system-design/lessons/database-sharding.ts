import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'database-sharding',
  title: 'Database Sharding',
  summary:
    'Partitioning data across nodes, choosing a shard key and rebalancing.',
  minutes: 18,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-database-sharding-1',
      text: 'explain what sharding is, why it scales writes and storage where replication cannot, and how the two are combined.',
    },
    {
      id: 'sd-database-sharding-2',
      text: 'compare range-based and hash-based sharding and judge a shard key by cardinality, skew, write hotspots and query patterns.',
    },
    {
      id: 'sd-database-sharding-3',
      text: 'describe how queries are routed to shards, why rebalancing with `hash(key) mod N` is costly, and what sharding makes harder, such as cross-shard queries and transactions.',
    },
  ],
  concept: [
    {
      heading: 'When one leader is not enough',
      blocks: [
        {
          type: 'text',
          md: "Replication gave you more copies of the data, which helps reads. But every copy still holds **all** the data and applies **every** write. Two things eventually break that model:\n\n- **Write load.** One leader must accept every insert and update. When that machine is saturated, adding followers does not help.\n- **Data size.** The full dataset, plus its indexes, must fit on every node.\n\n**Sharding** solves both by splitting the data. Each record lives on exactly one of several nodes, called **shards**, and each shard holds only its part. Ten shards each take roughly a tenth of the writes and a tenth of the storage, so write capacity and storage grow as you add shards. Different systems use different words for the same idea: MongoDB says *shards*, Cassandra and many textbooks say *partitions*.\n\nSharding and replication are not alternatives; they are combined. Each shard is usually replicated, a leader with followers, so losing one machine does not make that shard's data unavailable.",
        },
      ],
    },
    {
      heading: 'Choosing how to split: the shard key',
      blocks: [
        {
          type: 'text',
          md: 'The database decides where a record lives from its **shard key**: one field, or a combination of fields, present in every record. There are two main ways to map a key to a shard.\n\n**Range-based sharding** gives each shard a contiguous range of key values: users `A–F` on shard 1, `G–M` on shard 2, and so on. Keys that are close together live together, so a range query (`WHERE created_at BETWEEN ...`) can go to one or a few shards. The risk is uneven load. If the key grows steadily, such as a timestamp or an auto-increment ID, every new record falls into the newest range, and **one shard takes all the inserts**: a write hotspot.\n\n**Hash-based sharding** runs the key through a hash function and assigns ranges of hash values to shards. Neighbouring keys end up scattered, which spreads data and writes evenly, even for keys that grow steadily. The cost is the mirror image: a range query on the key can no longer go to one shard and must usually ask many.\n\nWhatever the method, judge a candidate key on four things:\n\n- **Cardinality.** How many distinct values it has. A key like `country` has too few values to spread across many shards; all records for one value must live together.\n- **Frequency, or skew.** Whether a few values hold most of the records or traffic. One giant customer or one celebrity account can overload its shard.\n- **Monotonic growth.** Steadily increasing keys create a write hotspot under range sharding.\n- **Query patterns.** The queries you run most should include the shard key, so they can go to one shard.\n\nHigh cardinality alone is not enough: a timestamp has huge cardinality and still sends every new insert to one range shard.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Shard (partition)',
              definition:
                'One of the nodes, or groups of replicated nodes, that together hold a dataset, each holding a distinct subset of the records.',
            },
            {
              term: 'Shard key',
              definition:
                'The field or fields used to decide which shard a record belongs to.',
            },
            {
              term: 'Hotspot',
              definition:
                'A shard that receives a disproportionate share of reads or writes, so it saturates while others sit idle.',
            },
            {
              term: 'Scatter-gather query',
              definition:
                'A query that does not include the shard key, so it is sent to every shard and the results are merged.',
            },
            {
              term: 'Rebalancing',
              definition:
                'Moving data between shards so load and storage stay even, for example after adding a shard.',
            },
          ],
        },
        {
          type: 'example',
          title: 'Picking a key for a multi-tenant app',
          md: 'A project-management SaaS stores tasks for many companies. Almost every query is "tasks for company X", so `company_id` looks like a natural shard key: each company\'s tasks live on one shard and its queries go to one place.\n\nThen one customer grows far larger than the rest (illustrative: it holds a big share of all tasks and traffic). Every one of its tasks has the same `company_id`, so they can never be split across shards, and its shard becomes a hotspot. A compound key such as `(company_id, project_id)` lets that customer\'s data spread over several shards, at the price that a query across all of its projects now visits more than one shard.\n\nIf the team had instead chosen `created_at` with range sharding, every new task in the whole system would land on the newest shard. If they had hashed `task_id`, writes would be even, but every "tasks for company X" page would query all shards.',
        },
      ],
    },
    {
      heading: 'Routing, rebalancing and what you give up',
      blocks: [
        {
          type: 'diagram',
          caption:
            'A sharded database. A router reads the shard map to send each query to the shard that owns its key. Queries without the key go to every shard. In production each shard is also replicated.',
          nodes: [
            { id: 'users', label: 'Users', kind: 'client', col: 0, row: 2 },
            {
              id: 'app',
              label: 'App servers',
              kind: 'service',
              col: 1,
              row: 2,
            },
            {
              id: 'router',
              label: 'Shard router',
              kind: 'balancer',
              col: 2,
              row: 2,
            },
            { id: 'map', label: 'Shard map', kind: 'store', col: 2, row: 4 },
            { id: 's1', label: 'Shard 1', kind: 'store', col: 3, row: 1 },
            { id: 's2', label: 'Shard 2', kind: 'store', col: 3, row: 2 },
            { id: 's3', label: 'Shard 3', kind: 'store', col: 3, row: 3 },
          ],
          edges: [
            { from: 'users', to: 'app', label: 'requests' },
            { from: 'app', to: 'router', label: 'queries' },
            { from: 'router', to: 'map', label: 'key to shard', dashed: true },
            { from: 'router', to: 's1' },
            { from: 'router', to: 's2', label: 'by shard key' },
            { from: 'router', to: 's3' },
          ],
        },
        {
          type: 'text',
          md: "**Routing.** Something must know which shard owns which keys. It can be a router process (MongoDB's `mongos`), the database nodes themselves (in Cassandra, the node that receives a request coordinates it), or a library in your app that reads a shard map. A query that includes the shard key is **targeted**: it goes to one shard. A query without it becomes **scatter-gather**: it is sent to every shard and the results merged. Scatter-gather queries are slower, and adding shards does not make them proportionally faster, because each one still touches every shard.\n\n**Rebalancing.** Data and load drift, and you add shards as you grow, so data has to move. The naive scheme, `shard = hash(key) mod N`, is a trap: change N from 4 to 5 and most keys map to a different shard, so most of the data must move at once. Real systems avoid this:\n\n- **Many small partitions moved as units.** MongoDB splits data into key ranges (chunks), and a background balancer migrates ranges between shards.\n- **Consistent hashing.** Cassandra places nodes on a hash ring; a new node takes over only the ring ranges next to its positions, so only a small fraction of keys move. Giving each node many positions (*virtual nodes*) lets it take a little data from many neighbours.\n\nEven so, moving data is slow and uses disk and network on live machines, so it is done gradually.\n\n**What you give up.** A single-node database gives you joins, transactions and unique constraints across all data. Once the data is split:\n\n- **Joins and queries across shards** need scatter-gather or extra work in the app.\n- **Transactions spanning shards** need distributed transaction support or a different design; the later lesson on distributed transactions covers this.\n- **Uniqueness and secondary indexes** on fields other than the shard key are harder to enforce globally.\n- **Changing the shard key later** means moving data, so the first choice matters.",
        },
      ],
    },
    {
      heading: 'Real-world examples',
      blocks: [
        {
          type: 'text',
          md: "- **MongoDB** shards a collection by a shard key you choose, supports ranged and hashed sharding, routes queries through `mongos`, and runs a balancer that migrates key ranges between shards.\n- **Cassandra** always partitions data: the partition key in each table's primary key is hashed onto a token ring, and each partition is stored on several nodes according to a replication factor. Sharding and replication are built in together.\n- **Application-level sharding** on PostgreSQL or MySQL is also common: the app keeps a map from key ranges or tenants to separate database servers and connects to the right one. It gives full control but puts routing, rebalancing and cross-shard queries on your team.",
        },
      ],
    },
  ],
  application: {
    heading: 'Sharding a real system, and when not to',
    blocks: [
      {
        type: 'text',
        md: 'Sharding is a large, hard-to-reverse step, so teams usually exhaust cheaper options first: fix slow queries and indexes, scale the database up, add read replicas for read load, add caching, and archive old data. Shard when **writes or data size** have outgrown one leader and those options are spent.\n\nWhen you do shard:\n\n1. **Start from the main access path.** List the most frequent queries and pick a key they all include, so they stay single-shard. For a chat app that is often the conversation ID; for a SaaS app, often the tenant ID.\n2. **Check the key for skew and hotspots.** Look for giant tenants, celebrity users and steadily increasing values.\n3. **Plan for queries that cross shards.** Some, such as global search or admin reports, are better served by a separate system fed with copies of the data than by scatter-gather on every page load.\n4. **Replicate each shard** so a failed machine affects neither availability nor data.\n5. **Use a rebalancing scheme** that moves small pieces, not `mod N`.\n\nLimits: sharding multiplies the number of machines and failure modes, makes cross-shard work slower and more complex, and turns a poor shard key into a costly migration.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'Sharding and replication are the same thing.',
      correction:
        'Replication keeps full copies of the same data on several nodes; sharding splits the data so each node holds a different part. Production systems usually do both: each shard is replicated.',
    },
    {
      claim: 'Any shard key with many distinct values spreads the load evenly.',
      correction:
        'Cardinality is only one factor. A timestamp has very many values yet sends every new insert to one shard under range sharding, and a key where a few values dominate still creates hotspots.',
    },
    {
      claim:
        'Hash-based sharding has no downside because it spreads data evenly.',
      correction:
        'Hashing scatters neighbouring keys, so range queries on the key usually have to visit many shards instead of one.',
    },
  ],
  questions: [
    {
      id: 'sd-database-sharding-q1',
      objective: 'sd-database-sharding-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What is database sharding?',
      options: [
        {
          id: 'a',
          text: 'Keeping a full copy of the dataset on several servers',
          explanation:
            'That is replication. In sharding, each server holds only part of the data.',
        },
        {
          id: 'b',
          text: 'Storing frequently read query results in memory',
          explanation:
            'That is caching, which does not divide the stored data.',
        },
        {
          id: 'c',
          text: 'Moving the database to a server with more resources',
          explanation: 'That is vertical scaling of one machine.',
        },
        {
          id: 'd',
          text: 'Splitting the data so each record lives on one of several nodes',
          explanation:
            'Correct. Sharding divides records across nodes, choosing each record’s node from its shard key.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-database-sharding-q2',
      objective: 'sd-database-sharding-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A single-leader database is saturated by inserts and updates; reads are fine. Which change raises write capacity?',
      options: [
        {
          id: 'a',
          text: 'Add more read replicas behind the leader',
          explanation:
            'Every replica must apply every write, and the leader still accepts all of them, so write capacity stays the same.',
        },
        {
          id: 'b',
          text: 'Shard the data so several leaders each own a part',
          explanation:
            'Correct. Each shard accepts writes only for its own keys, so the write load is divided across machines.',
        },
        {
          id: 'c',
          text: 'Switch replication from asynchronous to synchronous',
          explanation:
            'Synchronous replication makes each commit wait for a follower, which slows writes down rather than adding capacity.',
        },
        {
          id: 'd',
          text: 'Add more stateless app servers in front of it',
          explanation:
            'More app servers send more writes to the same saturated leader.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-database-sharding-q3',
      objective: 'sd-database-sharding-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Compared with range-based sharding, what is the main trade-off of hash-based sharding?',
      options: [
        {
          id: 'a',
          text: 'It needs fewer shards, but each shard must hold more data',
          explanation:
            'The number of shards is a separate choice; hashing does not change it.',
        },
        {
          id: 'b',
          text: 'It keeps neighbouring keys together but creates write hotspots',
          explanation:
            'That describes range sharding with a steadily increasing key, the opposite of hashing.',
        },
        {
          id: 'c',
          text: 'It spreads keys evenly, but range queries usually hit many shards',
          explanation:
            'Correct. Hashing scatters neighbouring keys, which evens out load but sends range queries on the key to many shards.',
        },
        {
          id: 'd',
          text: 'It removes the need to choose a shard key at all',
          explanation:
            'Hash sharding still hashes a shard key; choosing that key still matters.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-database-sharding-q4',
      objective: 'sd-database-sharding-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'An events table is range-sharded on `created_at`. Monitoring shows nearly all inserts hitting one shard. What explains this, and what is a standard fix?',
      options: [
        {
          id: 'a',
          text: 'New timestamps all fall in the newest range; hash the key or use a compound key',
          explanation:
            'Correct. A steadily increasing key sends every insert to the shard owning the top range. Hashing it, or leading with a well-spread field such as a device ID, spreads inserts.',
        },
        {
          id: 'b',
          text: 'Timestamps have too few distinct values; add more shards',
          explanation:
            'Timestamps have very many distinct values. The problem is that they increase steadily, and more shards would not change where new rows go.',
        },
        {
          id: 'c',
          text: 'The router is caching a stale shard map; restart the router',
          explanation:
            'A stale map would misroute queries, not explain a consistent pattern of new rows going to the newest range.',
        },
        {
          id: 'd',
          text: 'The shard is missing a replica; add a follower to that shard',
          explanation:
            'Followers add read capacity and availability; the leader of that shard would still take every insert.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-database-sharding-q5',
      objective: 'sd-database-sharding-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A SaaS app hash-shards all data on `tenant_id`. One tenant now produces a large share of all traffic, and its shard is overloaded while others are idle. What is the underlying problem?',
      options: [
        {
          id: 'a',
          text: 'The key is skewed: one value’s rows cannot be split across shards',
          explanation:
            'Correct. All of that tenant’s rows share one key value, so they must live on one shard. A compound key such as `(tenant_id, project_id)` would let them spread, at the cost of more multi-shard queries for that tenant.',
        },
        {
          id: 'b',
          text: 'The hash function distributes tenant IDs unevenly',
          explanation:
            'The hash spreads distinct tenants fine. The issue is that one tenant is one key value, and a single value always lands on a single shard.',
        },
        {
          id: 'c',
          text: 'The key’s cardinality is too high for the number of shards',
          explanation:
            'High cardinality helps distribution. The problem is frequency: one value carries far more load than the others.',
        },
        {
          id: 'd',
          text: 'The other shards need more replicas to absorb the load',
          explanation:
            'Replicas of other shards do not hold this tenant’s data, so they cannot take its load.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-database-sharding-q6',
      objective: 'sd-database-sharding-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        "Orders are sharded by `customer_id`. An admin page runs `SELECT * FROM orders WHERE status = 'pending'`. How is this query served?",
      options: [
        {
          id: 'a',
          text: 'It goes to one shard chosen at random, which returns a sample',
          explanation:
            'A random shard would return only some pending orders, which would be a wrong answer, not a sample.',
        },
        {
          id: 'b',
          text: 'It goes to the shard that owns the lowest customer IDs',
          explanation:
            'Pending orders exist for customers on every shard; one shard cannot answer the query.',
        },
        {
          id: 'c',
          text: 'It goes to every shard and the results are merged',
          explanation:
            'Correct. Without the shard key, the router cannot target one shard, so it scatters the query to all of them and gathers the results.',
        },
        {
          id: 'd',
          text: 'It is rejected because it does not include the shard key',
          explanation:
            'Sharded databases generally accept such queries; they run as scatter-gather, which is slower.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-database-sharding-q7',
      objective: 'sd-database-sharding-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Why is placing records with `shard = hash(key) mod N` a poor choice for a cluster that will grow?',
      options: [
        {
          id: 'a',
          text: 'Hash functions produce too many collisions for large datasets',
          explanation:
            'Collisions do not matter here; many keys are meant to share a shard. The problem appears when N changes.',
        },
        {
          id: 'b',
          text: 'Changing N remaps most keys, so most of the data must move',
          explanation:
            'Correct. With a new N, most keys produce a different remainder. Schemes such as many fixed partitions or consistent hashing move only a small fraction.',
        },
        {
          id: 'c',
          text: 'The scheme only works with numeric keys, not strings',
          explanation:
            'Any key that can be hashed works; the hash turns strings into numbers.',
        },
        {
          id: 'd',
          text: 'New records always go to the most recently added shard',
          explanation:
            'The remainder spreads new records across all shards; the problem is the old records that move.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-database-sharding-q8',
      objective: 'sd-database-sharding-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A wallet service is sharded by `user_id`. A new feature transfers credits from user A to user B in one database transaction. A and B are often on different shards. Which statement is accurate?',
      options: [
        {
          id: 'a',
          text: 'Nothing changes: a transaction always runs on a single node',
          explanation:
            'When A and B live on different shards, the transfer has to change data on two nodes, so one node cannot cover it.',
        },
        {
          id: 'b',
          text: 'Read replicas on each shard make the transfer atomic',
          explanation:
            'Replicas copy one shard’s data; they do not coordinate changes across two shards.',
        },
        {
          id: 'c',
          text: 'Hash sharding keeps users who transact with each other together',
          explanation:
            'Hashing places each user ID independently, so related users usually land on different shards.',
        },
        {
          id: 'd',
          text: 'It spans two shards, so it needs a cross-shard transaction or another design',
          explanation:
            'Correct. Changes on two shards need distributed transaction support or a pattern such as sagas, both costlier than a local transaction.',
        },
      ],
      answer: 'd',
    },
  ],
  scenario: {
    prompt:
      'A chat app stores messages in one PostgreSQL primary with two read replicas. Message inserts now saturate the primary, and the messages table is growing faster than one machine’s disk. The main queries are: load the latest messages in a conversation, page back through older messages in a conversation, and list a user’s conversations. Some group channels are very large and busy. Propose a sharding design: the shard key and method, how queries are routed, what happens with the busiest channels, how you add shards later, and what queries become harder.',
    modelAnswer:
      '**Shard key.** The hot path is "messages in conversation X", so shard messages by `conversation_id`. Each conversation\'s messages then live together and the two main message queries are single-shard. A composite primary key such as `(conversation_id, message_id)` keeps paging within a conversation efficient on its shard.\n\nRejected options: `created_at` with range sharding would send every new message to one shard, a write hotspot. `user_id` does not fit, because a message belongs to a conversation with several users, and hashing `message_id` would turn every conversation page into scatter-gather.\n\n**Method.** Hash `conversation_id` so new conversations spread evenly. Range queries are only needed *within* a conversation, which stays on one shard, so hashing costs nothing there.\n\n**Routing.** The app or a routing layer hashes the conversation ID and looks up the owning shard in a shard map.\n\n**Busy channels.** A huge channel is one key value, so it lives on one shard and could create a hotspot. Options: give very large channels a compound key such as `(conversation_id, time_bucket)` so their history spreads over shards, or place them on dedicated shards. Each choice costs some extra routing logic.\n\n**Growth.** Avoid `hash mod N`. Split the hash space into many more logical partitions than machines (for example a few thousand) and move whole partitions when adding a shard, or use consistent hashing, so only a small fraction of data moves.\n\n**What gets harder.** "List a user\'s conversations" does not contain `conversation_id`. Keep a separate table of memberships sharded by `user_id`, written alongside the message path. Global message search becomes scatter-gather and is better served by a separate search index. Each shard keeps a leader and followers for availability.\n\nOther designs can be valid, such as sharding everything by workspace in a Slack-style product. A strong answer ties the key to the main queries and names the hotspot and cross-shard costs.',
    checklist: [
      'Chooses a shard key that the main queries include, and explains why',
      'Rejects or addresses keys that create write hotspots, such as timestamps under range sharding',
      'Handles very large or busy conversations as a skew problem',
      'Uses a rebalancing approach that moves small pieces instead of `hash mod N`',
      'Identifies queries that become cross-shard and offers a way to serve them',
      'Keeps each shard replicated for availability',
    ],
  },
  takeaways: [
    'Sharding splits data so each record lives on one shard, which scales writes and storage in a way replication cannot.',
    'Production systems combine both: each shard is usually replicated for availability.',
    'Range sharding keeps neighbouring keys together but risks hotspots on steadily increasing keys; hash sharding spreads load but scatters range queries.',
    'A good shard key has enough distinct values, no dominant values, and appears in the most frequent queries.',
    'Rebalancing with `hash(key) mod N` moves most data when N changes; real systems move small partitions or use consistent hashing.',
    'Sharding makes cross-shard queries, joins, transactions and global uniqueness harder, so it is a late, deliberate step.',
  ],
  references: [
    {
      title: 'Sharding',
      publisher: 'MongoDB Manual',
      url: 'https://www.mongodb.com/docs/manual/sharding/',
      kind: 'source',
    },
    {
      title: 'Choose a Shard Key',
      publisher: 'MongoDB Manual',
      url: 'https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/',
      kind: 'source',
    },
    {
      title: 'Dynamo: data partitioning and replication',
      publisher: 'Apache Cassandra Documentation',
      url: 'https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html',
      kind: 'source',
    },
    {
      title: 'Designing Data-Intensive Applications (chapter on partitioning)',
      publisher: 'Martin Kleppmann, O’Reilly',
      url: 'https://dataintensive.net/',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}

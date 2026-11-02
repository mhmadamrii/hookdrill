import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'database-replication',
  title: 'Database Replication',
  summary: 'Leaders, followers, replication lag and read scaling.',
  minutes: 17,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-database-replication-1',
      text: 'describe how single-leader replication works: where writes go, how changes reach followers, and what it does and does not scale.',
    },
    {
      id: 'sd-database-replication-2',
      text: 'compare synchronous, semi-synchronous and asynchronous replication by write latency, data loss on failover and staleness of reads.',
    },
    {
      id: 'sd-database-replication-3',
      text: 'recognise anomalies caused by replication lag and choose a fix, such as reading a user’s own recent writes from the leader.',
    },
  ],
  concept: [
    {
      heading: 'One database, several copies',
      blocks: [
        {
          type: 'text',
          md: 'In the previous lesson you scaled out stateless app servers and found that the shared database becomes the next bottleneck. You can scale it up for a while, but one machine is still a ceiling and a single point of failure.\n\n**Replication** means keeping a copy of the same data on several database servers. It buys you three things:\n\n- **Read capacity.** Most web apps read far more than they write. Copies can answer read queries in parallel.\n- **Availability.** If the main server dies, a copy that is already up to date (or nearly) can take over.\n- **Locality.** A copy can sit closer to some users, which a later lesson on multi-region design picks up.\n\nThe hard part is not copying data once. It is keeping the copies in step while writes keep arriving, and deciding what a reader sees when a copy is a little behind.',
        },
      ],
    },
    {
      heading: 'Leaders, followers and the replication log',
      blocks: [
        {
          type: 'text',
          md: 'The most common setup is **single-leader replication**, which PostgreSQL and MySQL both use out of the box:\n\n- One server is the **leader** (also called *primary* or *source*). Every write goes to it.\n- The leader records each change in a log: PostgreSQL streams its **write-ahead log (WAL)**, MySQL replicates from its **binary log**.\n- The other servers are **followers** (also called *replicas*, *standbys* or *secondaries*). Each one receives that log and applies the same changes in the same order, so it ends up with the same data.\n- Followers can serve **read-only** queries. PostgreSQL calls such a follower a *hot standby*, and it rejects `INSERT`, `UPDATE`, `DELETE` and schema changes.\n\nThe app therefore sends writes to the leader and can send reads to any follower. Notice what this does and does not scale. Adding followers adds **read** capacity. It does not add **write** capacity, because every follower must still apply every write the leader accepts. When writes outgrow one leader, you need to split the data instead, which is the next lesson.\n\nIf the leader fails, a follower can be **promoted** to become the new leader, and the app is pointed at it. This is called **failover**. How much data survives a failover depends on the replication mode.',
        },
        {
          type: 'diagram',
          caption:
            'Single-leader replication. The app sends writes to the leader and spreads reads across followers. The leader streams its change log to each follower, by default asynchronously.',
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
              id: 'leader',
              label: 'Leader (primary)',
              kind: 'store',
              col: 2,
              row: 1,
            },
            { id: 'f1', label: 'Follower 1', kind: 'store', col: 3, row: 2 },
            { id: 'f2', label: 'Follower 2', kind: 'store', col: 3, row: 3 },
          ],
          edges: [
            { from: 'users', to: 'app', label: 'requests' },
            { from: 'app', to: 'leader', label: 'all writes' },
            { from: 'app', to: 'f1', label: 'reads' },
            { from: 'app', to: 'f2', label: 'reads' },
            {
              from: 'leader',
              to: 'f1',
              label: 'replication log',
              dashed: true,
            },
            { from: 'leader', to: 'f2', dashed: true },
          ],
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Leader (primary, source)',
              definition:
                'The one server in single-leader replication that accepts writes and sends its changes to the others.',
            },
            {
              term: 'Follower (replica, standby)',
              definition:
                'A server that applies the leader’s changes in order and can serve read-only queries.',
            },
            {
              term: 'Replication lag',
              definition:
                'How far a follower is behind the leader: changes committed on the leader that the follower has not yet applied.',
            },
            {
              term: 'Failover',
              definition:
                'Promoting a follower to leader when the current leader fails, and redirecting writes to it.',
            },
            {
              term: 'Eventually consistent',
              definition:
                'If writes stop, every copy will in time hold the same data, but at any moment a copy may be behind.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Synchronous, asynchronous and in between',
      blocks: [
        {
          type: 'text',
          md: 'The key question is: **when the leader tells the client "committed", which followers already have the change?**\n\n- **Asynchronous replication.** The leader commits locally, replies to the client, and sends the change to followers afterwards. Writes are fast and do not depend on followers being up. The cost: followers lag behind, and if the leader dies before a change has left it, a promoted follower will not have that change. The client was told the write succeeded, yet it is gone. This is the **default** in both PostgreSQL streaming replication and MySQL replication.\n- **Synchronous replication.** The leader waits for one or more chosen followers to confirm before replying. A confirmed commit survives the loss of the leader, as long as a confirming follower survives. The cost: every commit waits at least one network round trip, and if the synchronous follower is unavailable, commits can stall until another one is available. PostgreSQL lets you list several candidates, or require any N of them, to reduce that risk.\n- **Semi-synchronous replication** (MySQL). A commit waits until at least one replica has **received and logged** the change, not until it has **applied** it. So the change is safe from a leader crash, but a read on that replica can still return the old value for a moment.\n\n"Synchronous" also comes in degrees. PostgreSQL\'s `synchronous_commit` setting decides what the leader waits for: `remote_write` (the standby has received it and handed it to its operating system), `on` (the standby has flushed it to durable storage) or `remote_apply` (the standby has replayed it, so queries there can see it). Only the last one makes the change visible on that standby by the time the client hears "committed". And in a typical setup only one or a few followers are synchronous; the rest still replicate asynchronously and can lag.',
        },
        {
          type: 'note',
          md: 'Replication is not a backup. If someone runs `DELETE FROM orders` by mistake, the delete is replicated to every follower within moments. Backups and point-in-time recovery protect against bad writes; replication protects against losing a machine.',
        },
      ],
    },
    {
      heading: 'Replication lag and what users see',
      blocks: [
        {
          type: 'text',
          md: "With asynchronous followers, a read may hit a copy that has not yet applied a recent write. PostgreSQL's documentation describes data on a standby as **eventually consistent** with the primary, and notes that the same query run on both at nearly the same moment can return different results. Lag is usually small, but it grows when the leader is busy, the network is slow or a follower cannot keep up, and nothing puts a hard upper bound on it.\n\nTwo anomalies show up in real apps:\n\n- **Not reading your own writes.** A user saves a change, the page reloads from a lagging follower, and their change seems to have vanished.\n- **Going back in time.** A user refreshes twice, and the two reads hit followers with different lag. The second read shows older data than the first.\n\nCommon fixes, from simplest to most precise:\n\n- **Read your own writes from the leader.** For data the user can edit (their profile, their own posts), or for a short window after they write, send their reads to the leader.\n- **Keep each user on one follower.** Choose the follower from the user ID, so their successive reads never move to a copy that is further behind. This prevents going back in time, but not stale reads.\n- **Wait for the follower to catch up.** Record the leader's log position after the write and only read from a follower that has applied at least that position.\n\nThe later lessons on the CAP theorem and consistency models give these guarantees precise names.",
        },
        {
          type: 'example',
          title: 'The vanishing display name',
          md: "A forum sends all `SELECT` queries round-robin to two asynchronous followers and all writes to the leader.\n\n1. Ana changes her display name. The `UPDATE` commits on the leader.\n2. Her browser reloads the profile page. The `SELECT` lands on follower 2, which has not applied the change yet. She sees her old name and tries again.\n3. The next reload hits follower 1, which has caught up, and the new name appears.\n\nNo data was lost; Ana just read from a copy that was behind. The forum fixes it by reading a user's own profile from the leader, while everyone else's profile views keep using the followers.",
        },
      ],
    },
  ],
  application: {
    heading: 'Read replicas in a real app',
    blocks: [
      {
        type: 'text',
        md: "In practice, adding replicas to a web app means:\n\n- **Two connection pools**, one to the leader for writes and reads that must be fresh, one to the followers for everything else. Many frameworks and database proxies support this split.\n- **Deciding which reads must be fresh:** a user's own data right after they change it, anything read inside a transaction that then writes, balances and inventory checks before a purchase.\n- **Monitoring lag.** PostgreSQL exposes it through views such as `pg_stat_replication` on the primary; alert when it grows.\n- **Planning failover.** Decide who promotes a follower, how the app finds the new leader, and how much recent data you can afford to lose. Asynchronous replication can lose the last commits; synchronous replication trades commit latency for not losing them.\n\nLimits:\n\n- **Writes do not scale.** Every follower applies every write, so a write-heavy load needs sharding, not more replicas.\n- **Lag grows under load,** exactly when you have the most traffic.\n- **Long queries on followers can be cancelled.** In PostgreSQL, replaying certain changes from the primary (dropping a table, vacuum cleaning up rows) can conflict with a query running on a hot standby, and the standby cancels the query after a configurable delay.\n- **Failover is not free:** detection takes time, and a badly handled failover can leave two servers each believing it is the leader. The fault-tolerance lesson covers this.",
      },
    ],
  },
  misconceptions: [
    {
      claim: 'A replica is a backup.',
      correction:
        'A replica copies every change, including mistakes: an accidental delete reaches the followers within moments. Replication protects against losing a machine; backups and point-in-time recovery protect against bad writes.',
    },
    {
      claim:
        'Adding read replicas increases how many writes the database can handle.',
      correction:
        'All writes still go to the leader, and every follower must apply all of them too. Replicas add read capacity only; scaling writes needs the data to be split across leaders.',
    },
    {
      claim:
        'With synchronous replication, every replica is always up to date for reads.',
      correction:
        'Usually only one or a few followers are synchronous; the rest lag. Even a synchronous follower may only have received or flushed the change, not applied it: MySQL semi-sync waits for receipt and logging, and PostgreSQL waits for replay only with `remote_apply`.',
    },
  ],
  questions: [
    {
      id: 'sd-database-replication-q1',
      objective: 'sd-database-replication-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'In single-leader replication, where do writes go?',
      options: [
        {
          id: 'a',
          text: 'To any replica, which then forwards the change to the others',
          explanation:
            'That describes a multi-leader or leaderless design. In single-leader replication, followers are read-only.',
        },
        {
          id: 'b',
          text: 'To whichever replica currently has the lowest replication lag',
          explanation:
            'Lag matters for choosing where to read, not where to write. Followers do not accept writes.',
        },
        {
          id: 'c',
          text: 'Only to the leader, which then sends the changes to followers',
          explanation:
            'Correct. The leader accepts every write and streams its change log to the followers, which apply it in order.',
        },
        {
          id: 'd',
          text: 'To all replicas at once, sent in parallel by the application',
          explanation:
            'The application does not fan writes out itself; the database replicates them from the leader.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-database-replication-q2',
      objective: 'sd-database-replication-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'What is the default replication mode in both PostgreSQL streaming replication and MySQL replication?',
      options: [
        {
          id: 'a',
          text: 'Asynchronous',
          explanation:
            'Correct. Both document asynchronous replication as the default; synchronous or semi-synchronous modes must be configured.',
        },
        {
          id: 'b',
          text: 'Synchronous',
          explanation:
            'PostgreSQL supports synchronous replication, but only when you configure synchronous standbys. It is not the default.',
        },
        {
          id: 'c',
          text: 'Semi-synchronous',
          explanation:
            'MySQL offers semi-synchronous replication as an option in addition to its default asynchronous replication.',
        },
        {
          id: 'd',
          text: 'Leaderless with quorums',
          explanation:
            'Leaderless quorum replication is used by systems such as Cassandra, not by default PostgreSQL or MySQL replication.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-database-replication-q3',
      objective: 'sd-database-replication-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'With asynchronous replication, the leader confirms a commit to the client and then crashes before sending that change to any follower. A follower is promoted. What happens to that write?',
      options: [
        {
          id: 'a',
          text: 'The new leader copies it from the old leader’s disk on promotion',
          explanation:
            'The old leader has crashed; promotion does not reach into its disk. The follower only has what it received.',
        },
        {
          id: 'b',
          text: 'The database tells the client that its write was rolled back',
          explanation:
            'The client already received a success reply and is never told otherwise.',
        },
        {
          id: 'c',
          text: 'It is safe, because a confirmed commit always exists on a follower',
          explanation:
            'That is true of synchronous replication. Asynchronous replication confirms before any follower has the change.',
        },
        {
          id: 'd',
          text: 'It can be missing on the new leader although the client saw success',
          explanation:
            'Correct. Asynchronous replication acknowledges before followers have the change, so a failover can lose the most recent confirmed writes.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-database-replication-q4',
      objective: 'sd-database-replication-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'With MySQL semi-synchronous replication, a commit on the source returns to the client. Which statement is then guaranteed?',
      options: [
        {
          id: 'a',
          text: 'Every replica has applied the transaction and can serve it',
          explanation:
            'Semi-sync waits for one replica, not all, and it waits for receipt, not for the change to be applied.',
        },
        {
          id: 'b',
          text: 'At least one replica has received and logged it, perhaps not applied it',
          explanation:
            'Correct. The change survives a source crash, but a read on that replica can still return the old value until it is applied.',
        },
        {
          id: 'c',
          text: 'No replica has the transaction yet; it is sent after the reply',
          explanation:
            'That is plain asynchronous replication. Semi-sync blocks the commit until a replica acknowledges.',
        },
        {
          id: 'd',
          text: 'A replica applied it before the source recorded the commit',
          explanation:
            'Replicas apply changes that the source has already logged; the order is never the reverse.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-database-replication-q5',
      objective: 'sd-database-replication-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Users change their display name, and the reloaded page sometimes still shows the old name. Reads are spread across asynchronous followers. Which fix targets this problem?',
      options: [
        {
          id: 'a',
          text: 'Add more followers to spread the read load further',
          explanation:
            'More followers do not reduce lag; the new ones can be just as far behind.',
        },
        {
          id: 'b',
          text: 'Read a user’s own profile from the leader after they edit it',
          explanation:
            'Correct. This gives read-your-writes: the leader always has the user’s latest change, and other reads can stay on followers.',
        },
        {
          id: 'c',
          text: 'Move every follower onto a larger machine',
          explanation:
            'Faster followers may lag less, but asynchronous replication can still leave them behind at the moment of the read.',
        },
        {
          id: 'd',
          text: 'Cache profile pages for longer in front of the app',
          explanation:
            'A longer cache keeps the old name around even longer, making the problem worse.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-database-replication-q6',
      objective: 'sd-database-replication-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A user refreshes a comment thread twice. The first load shows a new comment; the second does not. Reads are load-balanced across two asynchronous followers with different lag. Which fix specifically prevents reads going backward like this?',
      options: [
        {
          id: 'a',
          text: 'Have the application write each comment to both followers',
          explanation:
            'Followers are read-only in single-leader replication; writes must go through the leader.',
        },
        {
          id: 'b',
          text: 'Add a third follower to the load-balanced read pool',
          explanation:
            'Another follower with its own lag adds one more way for successive reads to differ.',
        },
        {
          id: 'c',
          text: 'Cache each thread without expiry after its first load',
          explanation:
            'The thread would stop showing any new comments at all, which trades one bug for a worse one.',
        },
        {
          id: 'd',
          text: 'Send each user’s reads to one follower chosen from their user ID',
          explanation:
            'Correct. A user who always reads from the same follower never sees it move backward, because that follower only moves forward. If it fails, the user must be moved, which can briefly break the guarantee.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-database-replication-q7',
      objective: 'sd-database-replication-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why does adding read replicas not increase the write capacity of a single-leader database?',
      options: [
        {
          id: 'a',
          text: 'Every write still goes to the leader and must also be applied on every follower',
          explanation:
            'Correct. The leader handles every write, and each follower repeats all of them, so no node does less write work.',
        },
        {
          id: 'b',
          text: 'Followers are required to run on slower disks than the leader',
          explanation:
            'There is no such requirement; followers often use the same hardware as the leader.',
        },
        {
          id: 'c',
          text: 'Followers accept writes only while their replication lag is zero',
          explanation:
            'Followers in single-leader replication never accept application writes, whatever their lag.',
        },
        {
          id: 'd',
          text: 'The leader sends each write to just one follower in rotation',
          explanation:
            'Every follower receives every change; that is what keeps them full copies of the data.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-database-replication-q8',
      objective: 'sd-database-replication-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A ledger service on PostgreSQL must not lose a confirmed write if the primary’s machine is destroyed. The team accepts slower commits. Which setup meets the requirement?',
      options: [
        {
          id: 'a',
          text: 'Asynchronous streaming replication to two hot standbys',
          explanation:
            'Asynchronous standbys may not yet have the latest confirmed commits when the primary is lost.',
        },
        {
          id: 'b',
          text: 'A full backup of the primary taken every night',
          explanation:
            'Everything committed since the last backup would be lost with the machine.',
        },
        {
          id: 'c',
          text: 'Synchronous replication with `synchronous_commit = on` to a standby',
          explanation:
            'Correct. Each commit waits until a synchronous standby has flushed it to durable storage. Listing more than one candidate standby keeps commits from stalling if one is down.',
        },
        {
          id: 'd',
          text: 'Asynchronous replication, failing over to the least-lagged follower',
          explanation:
            'The least-lagged follower can still be missing the last commits, so confirmed writes can be lost.',
        },
      ],
      answer: 'c',
    },
  ],
  scenario: {
    prompt:
      'A recipe-sharing site runs on one PostgreSQL primary. The primary is close to full CPU at peak, and almost all queries are reads: browsing recipes, search pages and profile views (illustrative: reads outnumber writes many times over). Product managers worry that once reads move to copies, authors who have just edited a recipe will see the old version. The business can tolerate losing a few seconds of new comments in a rare failure, but a weekly analytics report runs a query that takes many minutes. Plan how you would add replication: topology, how the app routes queries, how you prevent stale reads that confuse users, what replication mode you choose and why, and what limits you watch for.',
    modelAnswer:
      "**Topology.** Keep one primary and add two hot standbys with streaming replication. Two followers spread read load and leave one in service if the other fails or is rebuilt. Because a lost comment or two in a rare failover is acceptable, **asynchronous** replication fits: commits stay fast and do not depend on a standby being up. If payments were involved, synchronous replication to at least one standby would be worth its extra commit latency.\n\n**Routing.** The app gets two connection pools. Writes, and reads that must be fresh, use the primary. Recipe browsing, search and other users' profiles use the followers.\n\n**Stale reads.** The worry about edits is a read-your-writes problem, and asynchronous followers would cause it. After a user edits a recipe, read that recipe (and their own profile) from the primary for a short window, or always read a user's own content from the primary. To stop pages going back in time between refreshes, keep each user's follower reads on one follower picked from their user ID.\n\n**Limits to watch.**\n\n- Monitor replication lag (for example through `pg_stat_replication`) and alert when it grows.\n- The long analytics query can be cancelled on a hot standby when it conflicts with changes being replayed. Run it on a dedicated follower with settings that tolerate delay, or move reporting to a separate copy.\n- Replicas do nothing for write load. If writes become the bottleneck, the next steps are reducing writes or sharding.\n- Write down the failover procedure: who promotes a standby, and how the app finds the new primary.\n\nOther designs are valid, for example a cache in front of recipe pages instead of, or as well as, replicas. A strong answer ties the replication mode to how much data loss the business can accept, and handles lag where users would notice it.",
    checklist: [
      'Sends all writes to the primary and routes reads to followers through separate pools',
      'Chooses asynchronous or synchronous replication and justifies it by the acceptable data loss',
      'Handles read-your-writes for content users have just edited',
      'Plans for monitoring replication lag',
      'Notes that replicas do not scale writes',
      'Accounts for long queries or failover as operational limits',
    ],
  },
  takeaways: [
    'Single-leader replication sends every write to one leader, which streams its change log to followers that serve reads.',
    'Replicas add read capacity and availability, but not write capacity, because every node applies every write.',
    'Asynchronous replication is the default in PostgreSQL and MySQL; it is fast, but a failover can lose the latest confirmed writes.',
    'Synchronous modes wait for a follower before confirming, at the cost of commit latency; how far they wait (received, flushed or applied) varies.',
    'Replication lag causes visible anomalies such as users not seeing their own edits; reading their own data from the leader is the usual fix.',
    'A replica is not a backup: mistakes replicate too.',
  ],
  references: [
    {
      title: 'High Availability, Load Balancing, and Replication',
      publisher: 'PostgreSQL Documentation',
      url: 'https://www.postgresql.org/docs/current/high-availability.html',
      kind: 'source',
    },
    {
      title:
        'Log-Shipping Standby Servers (streaming and synchronous replication)',
      publisher: 'PostgreSQL Documentation',
      url: 'https://www.postgresql.org/docs/current/warm-standby.html',
      kind: 'source',
    },
    {
      title: 'Hot Standby',
      publisher: 'PostgreSQL Documentation',
      url: 'https://www.postgresql.org/docs/current/hot-standby.html',
      kind: 'source',
    },
    {
      title: 'Replication',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/replication.html',
      kind: 'source',
    },
    {
      title: 'Designing Data-Intensive Applications (chapter on replication)',
      publisher: 'Martin Kleppmann, O’Reilly',
      url: 'https://dataintensive.net/',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}

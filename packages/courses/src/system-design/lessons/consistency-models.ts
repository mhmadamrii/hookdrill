import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'consistency-models',
  title: 'Consistency Models',
  summary:
    'A consistency model is a contract about what a reader may see when data is replicated. Linearizability, causal consistency, read-your-writes, monotonic reads and eventual consistency each forbid different surprises, and each costs a different amount of availability and latency.',
  minutes: 17,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-consistency-models-1',
      text: 'define linearizability, causal consistency, read-your-writes, monotonic reads and eventual consistency by what a reader is allowed to observe.',
    },
    {
      id: 'sd-consistency-models-2',
      text: 'compare the models by what they cost in availability during a partition, using the ideas of total and sticky availability.',
    },
    {
      id: 'sd-consistency-models-3',
      text: 'choose the weakest model that still meets a feature’s requirement, and name a mechanism that provides it.',
    },
  ],
  concept: [
    {
      heading: 'A contract about what readers can see',
      blocks: [
        {
          type: 'text',
          md: 'In the replication lesson you saw replication lag: a follower can be behind the leader, so a read from it can return old data. The CAP lesson showed that during a partition some reads must either be stale or be refused. Neither lesson answered a practical question: **how stale is acceptable, and in what way?**\n\nThat is what a **consistency model** answers. It is a promise from the data system to your application about which results a read may return, given the writes that happened. Jepsen describes a consistency model as a **safety property**: it defines which histories of operations the system is allowed to produce. A stronger model forbids more surprising results; a weaker one allows more, and in exchange can stay available and fast in more situations.\n\n"Stale" is not one problem. Users notice very different things:\n\n- I saved my profile and the old version came back.\n- The comment count went from 12 to 10 when I refreshed, though nothing was deleted.\n- I saw a reply before the question it answers.\n- My friend still sees my old photo a few seconds after I changed it.\n\nEach model below rules out some of these and permits others.',
        },
      ],
    },
    {
      heading: 'The models, from strongest to weakest',
      blocks: [
        {
          type: 'text',
          md: '**Linearizability** is the strongest single-object model, and it is the C in CAP. The system behaves as if there were one copy of the data: each operation takes effect at a single instant, and that order respects real time. If one operation finishes before another starts, the second must see the first. Jepsen notes it is a **single-object** model; the "object" can be a key, a table or a whole database, and the multi-object version for transactions is called strict serializability.\n\n**Sequential consistency** drops the real-time part: every client still sees all operations in one agreed order, and that order keeps each client\'s own operations in the order it issued them, but it may lag behind what a wall clock would say.\n\n**Causal consistency** only orders operations that are causally related. If a client reads a question and then writes a reply, everyone must see the question before the reply. Operations with no causal link (two people answering independently) may be seen in different orders by different clients.\n\nThe next three are **session guarantees**: they constrain what **one client** sees of its own history, and say nothing about other clients.\n\n- **Read-your-writes**: after a client writes, its own later reads reflect that write. Another client may still see the old value.\n- **Monotonic reads**: a client\'s reads never go backwards. Once it has seen a state, a later read cannot show an earlier state.\n- **Monotonic writes**: one client\'s writes are applied in the order it made them.\n\n**Eventual consistency** is the weakest common promise. Werner Vogels defines it as: if no new updates are made to an item, eventually all accesses return the last updated value. It says nothing about **what** you see in the meantime, nor **how long** "eventually" takes. Vogels names DNS as a familiar eventually consistent system.\n\nThe word "strong consistency" is used loosely. Vogels uses it for "after an update completes, any later access returns the new value"; database vendors use it for several different guarantees. When a product says "strong", check which model the documentation actually promises.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Consistency model',
              definition:
                'A contract stating which results reads may return, given the writes that happened; stronger models allow fewer surprising results.',
            },
            {
              term: 'Causal consistency',
              definition:
                'Operations that are causally related are seen in the same order by everyone; unrelated, concurrent operations may be seen in different orders.',
            },
            {
              term: 'Read-your-writes',
              definition:
                "After a client writes, that same client's later reads reflect the write. No promise is made to other clients.",
            },
            {
              term: 'Monotonic reads',
              definition:
                'A client never sees data go backwards: each read shows a state at least as new as the one before.',
            },
            {
              term: 'Eventual consistency',
              definition:
                'If updates to an item stop, all reads of it eventually return the last written value; nothing is promised before then.',
            },
            {
              term: 'Inconsistency window',
              definition:
                "Vogels' term for the period between an update and the point when every reader is guaranteed to see it.",
            },
          ],
        },
        {
          type: 'example',
          title: 'Three anomalies on one comment thread',
          md: 'A blog stores comments in a leader database with two followers, and the app sends reads to any follower. Three users report bugs:\n\n- **Ana** posts a comment, the page reloads, and her comment is missing. Her read hit a follower that had not received the write yet. **Read-your-writes** forbids this.\n- **Ben** refreshes twice. The first load hits the up-to-date follower and shows 12 comments; the second hits the lagging follower and shows 10. Nothing was deleted. **Monotonic reads** forbids this.\n- **Chen** sees "Yes, Thursday works!" above the question "Can we move the meeting?". The reply reached his follower before the question. **Causal consistency** forbids this.\n\nNone of these break **eventual consistency**: once writes stop, every follower catches up and all three users see the same, complete thread. That is why "eventually consistent" alone is often not enough for a good user experience.',
        },
      ],
    },
    {
      heading: 'What each model costs',
      blocks: [
        {
          type: 'text',
          md: 'Stronger models need more coordination, and coordination is exactly what a partition prevents. Jepsen classifies models by how available they can be during a partition:\n\n- **Totally available**: every node that has not failed can keep serving, even during a partition. Jepsen places **monotonic reads** and **monotonic writes** here. Plain **eventual consistency** places no limit on what a read returns before convergence, so any node can answer from its local copy.\n- **Sticky available**: every non-failed node can keep serving, **as long as each client keeps talking to the same server**. **Read-your-writes** and **causal consistency** are at most sticky available: if a client\'s write sits on server 1 and the client is moved to server 2, which has not received it, server 2 cannot show it.\n- **Neither**: **Linearizability** and **sequential consistency** can be neither totally nor sticky available; during a partition some nodes must stop serving, as the CAP lesson showed.\n\nThe cost is not only during partitions. As PACELC put it, coordinating with other replicas takes time on every request. A linearizable read usually has to involve the leader or a group of replicas, while an eventually consistent read can be answered by the nearest copy.\n\nSo the design question is rarely "strong or weak?" for a whole system. It is: **for this feature, which anomalies would users or the business actually notice, and what is the weakest model that rules them out?**',
        },
        {
          type: 'diagram',
          caption:
            "Read-your-writes on a leader-follower database: the app server sends a user's own recent reads to the leader, using a per-session record of their last write, and sends everything else to a follower.",
          nodes: [
            { id: 'u', label: 'Browser', kind: 'client', col: 0, row: 2 },
            { id: 'api', label: 'App server', kind: 'service', col: 1, row: 2 },
            {
              id: 'sess',
              label: 'Session store',
              kind: 'cache',
              col: 1,
              row: 4,
            },
            { id: 'lead', label: 'Leader DB', kind: 'store', col: 3, row: 1 },
            {
              id: 'fol',
              label: 'Follower DB',
              kind: 'store',
              col: 3,
              row: 3,
            },
          ],
          edges: [
            { from: 'u', to: 'api', label: 'request' },
            { from: 'api', to: 'sess', label: 'last write time' },
            { from: 'api', to: 'lead', label: 'writes, own reads' },
            { from: 'api', to: 'fol', label: 'other reads' },
            {
              from: 'lead',
              to: 'fol',
              label: 'async replication',
              dashed: true,
            },
          ],
        },
      ],
    },
  ],
  application: {
    heading: 'Picking a model per feature',
    blocks: [
      {
        type: 'text',
        md: 'A social or SaaS product usually needs several models at once:\n\n- **Unique claims** such as usernames, or "only one person gets this seat": two replicas accepting claims independently cannot prevent a clash, so these need a **linearizable** check, typically a unique constraint on the leader.\n- **Editing your own data** (profile, settings, a post you just wrote): users expect **read-your-writes**. Common mechanisms: send that user\'s reads of data they recently changed to the leader; keep a user pinned to one replica; or have the write return a version (such as the leader\'s log position) and only read from a replica that has caught up to it.\n- **Feeds and counters**: **monotonic reads** stops counts and lists jumping backwards; pinning each user to the same replica is a simple way to get it.\n- **Conversations** (comments, chat replies): **causal consistency** keeps answers after questions.\n- **Analytics, view counts, recommendations**: **eventual consistency** is usually fine.\n\n**Limits.** Session guarantees are per client. If a user edits a profile on a phone and checks it on a laptop, the laptop is a different session, so read-your-writes across devices needs the mechanism to be keyed on the user, not on a browser session. Sticky routing breaks when the replica a user is pinned to fails over. And stronger guarantees cost latency on every request, so applying linearizability everywhere "to be safe" can make a system slow and fragile under partition.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'Eventual consistency means replicas agree within a second or two.',
      correction:
        'Eventual consistency only promises that replicas converge once updates stop. It sets no time bound and says nothing about what readers see in the meantime; reads can go backwards or show a reply before its question.',
    },
    {
      claim:
        'Read-your-writes means everyone sees my update as soon as I have saved it.',
      correction:
        'Read-your-writes is a session guarantee: only the client that wrote is promised to see its write. Other clients may still read the old value until replication catches up.',
    },
    {
      claim: '"Strong consistency" means the same thing in every database.',
      correction:
        'Products use the phrase for different guarantees. Linearizability is a specific, single-object model; for transactions over many objects the matching model is strict serializability. Check which one the documentation actually promises.',
    },
  ],
  questions: [
    {
      id: 'sd-consistency-models-q1',
      objective: 'sd-consistency-models-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What does read-your-writes consistency guarantee?',
      options: [
        {
          id: 'a',
          text: 'After a client writes, that same client’s later reads reflect the write',
          explanation:
            'Correct. Read-your-writes is a session guarantee about a client seeing its own writes. It promises nothing to other clients.',
        },
        {
          id: 'b',
          text: 'After a client writes, every client’s later reads reflect the write',
          explanation:
            'That would be close to linearizability. Read-your-writes covers only the client that wrote.',
        },
        {
          id: 'c',
          text: 'A client’s writes are applied on every replica in the order it made them',
          explanation:
            'That describes monotonic writes, a different session guarantee about write order rather than reads.',
        },
        {
          id: 'd',
          text: 'All replicas hold the same value once writes to the item have stopped',
          explanation:
            'That is eventual consistency, which does not promise that a writer sees its own update right away.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-consistency-models-q2',
      objective: 'sd-consistency-models-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'Which statement matches the definition of eventual consistency?',
      options: [
        {
          id: 'a',
          text: 'Every read returns a value no more than a few seconds old',
          explanation:
            'Eventual consistency sets no time bound at all. A fixed staleness limit would be a stronger, bounded guarantee.',
        },
        {
          id: 'b',
          text: 'A client never sees an older value after seeing a newer one',
          explanation:
            'That is monotonic reads. Eventual consistency alone allows reads to go backwards.',
        },
        {
          id: 'c',
          text: 'Related operations are seen in the same order by every client',
          explanation:
            'That is causal consistency, which is stronger than eventual consistency.',
        },
        {
          id: 'd',
          text: 'If updates stop, all reads eventually return the last written value',
          explanation:
            'Correct. This is the definition Vogels gives: convergence once updates stop, with no promise about timing or what is seen before then.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-consistency-models-q3',
      objective: 'sd-consistency-models-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A user refreshes a post twice. The first load shows 12 comments, the second shows 10. No comments were deleted. Which guarantee was violated?',
      options: [
        {
          id: 'a',
          text: 'Read-your-writes',
          explanation:
            'The user did not write anything here, so there is no own write to miss. Read-your-writes is not what is at stake.',
        },
        {
          id: 'b',
          text: 'Eventual consistency',
          explanation:
            'Eventual consistency allows this: it only promises convergence once updates stop, not that reads never go backwards.',
        },
        {
          id: 'c',
          text: 'Monotonic reads',
          explanation:
            'Correct. The second read showed an older state than the first, which is exactly what monotonic reads forbids. A likely cause is the two reads hitting different replicas.',
        },
        {
          id: 'd',
          text: 'Monotonic writes',
          explanation:
            'Monotonic writes is about the order in which one client’s writes are applied. This is a problem with reads.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-consistency-models-q4',
      objective: 'sd-consistency-models-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Alice asks "Lunch at noon?" in a group chat. Bob reads it and replies "Yes!". Carol sees "Yes!" appear before Alice’s question. Which is the weakest of these models that forbids what Carol saw?',
      options: [
        {
          id: 'a',
          text: 'Monotonic reads',
          explanation:
            'Monotonic reads stops Carol’s view going backwards, but she could still receive the reply before the question without ever going backwards.',
        },
        {
          id: 'b',
          text: 'Causal consistency',
          explanation:
            'Correct. Bob’s reply depends on the question he read, so the two are causally related, and causal consistency requires everyone to see them in that order.',
        },
        {
          id: 'c',
          text: 'Linearizability',
          explanation:
            'Linearizability does forbid this, but it is far stronger than needed. Causal consistency is enough and is cheaper.',
        },
        {
          id: 'd',
          text: 'Eventual consistency',
          explanation:
            'Eventual consistency allows any order before convergence, so it does not forbid seeing the reply first.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-consistency-models-q5',
      objective: 'sd-consistency-models-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'According to Jepsen’s classification, which of these models can be totally available, so every non-failed node keeps serving during a network partition?',
      options: [
        {
          id: 'a',
          text: 'Linearizability',
          explanation:
            'Linearizability cannot be totally available; during a partition some nodes must stop serving, which is the CAP result.',
        },
        {
          id: 'b',
          text: 'Monotonic reads',
          explanation:
            'Correct. Jepsen classifies monotonic reads as totally available: a node can always answer from what it has, as long as it never shows a client an older state than before.',
        },
        {
          id: 'c',
          text: 'Read-your-writes',
          explanation:
            'Read-your-writes is at most sticky available: it only works during a partition if each client stays with the same server.',
        },
        {
          id: 'd',
          text: 'Causal consistency',
          explanation:
            'Causal consistency is also at most sticky available, because a client must keep talking to a server that has its earlier operations.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-consistency-models-q6',
      objective: 'sd-consistency-models-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Read-your-writes is described as "sticky available". What does that mean during a network partition?',
      options: [
        {
          id: 'a',
          text: 'Only the leader replica can serve reads until the partition heals',
          explanation:
            'That describes a leader-only, consistency-first design. Sticky availability lets every non-failed node keep serving its own clients.',
        },
        {
          id: 'b',
          text: 'Writes are queued on the client and retried once the network recovers',
          explanation:
            'Client-side queuing is a technique some apps use, but it is not what sticky availability means.',
        },
        {
          id: 'c',
          text: 'Nodes can keep serving as long as each client keeps using the same server',
          explanation:
            'Correct. A server always has the writes its own clients made to it. If a client switches to a server that has not received them, the guarantee cannot be kept during a partition.',
        },
        {
          id: 'd',
          text: 'Data stays cached on each node for a fixed time before it may change',
          explanation:
            'Sticky availability is about which server a client talks to, not about how long values are cached.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-consistency-models-q7',
      objective: 'sd-consistency-models-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Users complain that profile edits "disappear" right after saving. Reads go to followers, which lag behind the leader. Other users seeing the change a few seconds late is fine. What is the weakest fix that meets the requirement?',
      options: [
        {
          id: 'a',
          text: 'Make every read in the app go to the leader so all reads are linearizable',
          explanation:
            'This fixes the complaint, but it is stronger and costlier than needed: other users seeing the edit late is acceptable.',
        },
        {
          id: 'b',
          text: 'Put a cache in front of the followers so profile pages load faster',
          explanation:
            'A cache in front of lagging followers can serve the old profile even longer. Speed is not the problem.',
        },
        {
          id: 'c',
          text: 'Add more followers so each one handles fewer reads',
          explanation:
            'More followers spread load but do not stop a read from hitting one that has not received the edit.',
        },
        {
          id: 'd',
          text: 'Send a user’s reads of their own recently edited profile to the leader',
          explanation:
            'Correct. This provides read-your-writes for the editor only, which is exactly the requirement, while everyone else keeps reading from followers.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-consistency-models-q8',
      objective: 'sd-consistency-models-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Which of these features genuinely needs a linearizable operation, rather than a weaker model?',
      options: [
        {
          id: 'a',
          text: 'Registering a username that no two accounts may ever share',
          explanation:
            'Correct. If two replicas accept claims independently, both can say "available" for the same name. Preventing that needs one up-to-date decision, such as a unique constraint checked on the leader.',
        },
        {
          id: 'b',
          text: 'Showing how many times a video has been viewed',
          explanation:
            'A view count that is briefly behind harms nobody. Eventual consistency, perhaps with monotonic reads, is enough.',
        },
        {
          id: 'c',
          text: 'Showing a user the settings they just saved',
          explanation:
            'Only the user who saved needs to see the change, which is read-your-writes, a much weaker model.',
        },
        {
          id: 'd',
          text: 'Keeping replies below the comments they answer',
          explanation:
            'This is an ordering of causally related operations, which causal consistency provides without linearizability.',
        },
      ],
      answer: 'a',
    },
  ],
  scenario: {
    prompt:
      'A food-delivery app stores data in a leader database with followers in the same region; all reads currently go to followers. For each feature, name the weakest consistency model that meets the requirement and a mechanism to provide it:\n\n1. A restaurant updates its menu prices; customers may see new prices up to a minute late, but the restaurant owner must see their own change immediately.\n2. A customer tracks an order whose status moves placed → cooking → on the way → delivered. The status shown must never move backwards.\n3. A promo code may be redeemed only once across all customers.\n4. The "popular nearby" list on the home page.',
    modelAnswer:
      'For each feature, first ask who must see what, then pick the weakest guarantee that covers it.\n\n1. **Menu prices: read-your-writes for the owner, eventual for customers.** Only the writer needs to see the change at once. Send the owner\'s reads of their own menu to the leader for a while after they edit it, or have the edit return the leader\'s log position and only serve the owner from a follower that has caught up. Customers keep reading followers.\n2. **Order status: monotonic reads.** The customer must never see "delivered" and then "cooking". Pin each customer\'s status reads to one follower (for example by hashing the order id), or keep the last status version the client saw and reject or retry any read that returns an older one. Note this does not require seeing the newest status instantly, just never going backwards.\n3. **Promo code: linearizable.** "Only once across all customers" is a uniqueness claim. Redemption must be a single atomic check-and-set on the leader, for example an insert into a redemptions table with a unique constraint on the code. During a partition, sides that cannot reach the leader should refuse redemptions.\n4. **Popular nearby: eventual consistency.** Slightly stale rankings are harmless; read from any follower or a cache.\n\nOther answers can be valid: for example, a team might choose causal consistency for order status if status updates come from several services, or pin owners to a single replica instead of the leader. What matters is matching each guarantee to an actual requirement rather than applying the strongest model everywhere.',
    checklist: [
      'Names a specific model per feature instead of "strong" or "weak" for the whole app',
      'Recognises the menu owner case as read-your-writes, not linearizability for everyone',
      'Identifies "status never moves backwards" as monotonic reads',
      'Treats the one-time promo code as needing a linearizable, single-authority check',
      'Gives a concrete mechanism for each (leader routing, replica pinning, version tokens, unique constraint)',
    ],
  },
  takeaways: [
    'A consistency model is a contract about which results reads may return when data is replicated.',
    'Linearizability makes the system look like one copy; causal consistency only orders related operations; eventual consistency only promises convergence once writes stop.',
    'Read-your-writes and monotonic reads are per-client session guarantees, and they say nothing about what other clients see.',
    'Stronger models cost availability and latency: linearizability cannot stay available on every node in a partition, read-your-writes and causal need clients to stick to one server, and monotonic reads can stay available on every node.',
    'Pick the weakest model that rules out the anomalies a feature cannot tolerate, and reserve linearizability for claims like uniqueness.',
  ],
  references: [
    {
      title: 'Consistency Models',
      publisher: 'Jepsen',
      url: 'https://jepsen.io/consistency/models',
      kind: 'source',
    },
    {
      title: 'Linearizability',
      publisher: 'Jepsen',
      url: 'https://jepsen.io/consistency/models/linearizable',
      kind: 'source',
    },
    {
      title: 'Causal Consistency',
      publisher: 'Jepsen',
      url: 'https://jepsen.io/consistency/models/causal',
      kind: 'source',
    },
    {
      title: 'Read Your Writes',
      publisher: 'Jepsen',
      url: 'https://jepsen.io/consistency/models/read-your-writes',
      kind: 'source',
    },
    {
      title: 'Monotonic Reads',
      publisher: 'Jepsen',
      url: 'https://jepsen.io/consistency/models/monotonic-reads',
      kind: 'source',
    },
    {
      title: 'Eventually Consistent - Revisited',
      publisher: 'Werner Vogels, All Things Distributed',
      url: 'https://www.allthingsdistributed.com/2008/12/eventually_consistent.html',
      kind: 'source',
    },
    {
      title: 'Designing Data-Intensive Applications',
      publisher: 'Martin Kleppmann, O’Reilly',
      url: 'https://dataintensive.net/',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}

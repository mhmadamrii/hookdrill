import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'cap-theorem',
  title: 'CAP Theorem',
  summary:
    'When the network between replicas fails, each replica that receives a request must either answer with what it has, risking a stale answer, or refuse, staying correct but unavailable. CAP makes that choice precise, and it says much less than "pick two of three".',
  minutes: 16,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-cap-theorem-1',
      text: 'state the CAP theorem precisely, including what consistency, availability and partition tolerance mean in its proof.',
    },
    {
      id: 'sd-cap-theorem-2',
      text: 'explain why the trade-off is only forced during a network partition, why "pick two of three" is misleading, and what PACELC adds about latency.',
    },
    {
      id: 'sd-cap-theorem-3',
      text: 'decide, for a given feature, whether it should refuse requests or keep answering during a partition, and plan how to repair state afterwards.',
    },
  ],
  concept: [
    {
      heading: 'A cut cable forces a choice',
      blocks: [
        {
          type: 'text',
          md: 'In the replication lesson you copied data to several machines so that reads scale and a single crash does not lose data. Copies only stay in step if the machines can talk to each other. Now imagine the network link between two replicas breaks, while both machines keep running and keep receiving requests from users.\n\nA user writes a new value to replica 1. A moment later another user reads the same item from replica 2. Replica 2 has not heard about the write, and it cannot find out, because messages between the two are being lost. Replica 2 now has exactly two options:\n\n- **Answer anyway** with the value it has. The system stays up, but the reader may get an old value even though the write already finished.\n- **Refuse or wait** until it can reach replica 1. The reader never sees a stale value, but they get an error or no answer.\n\nThere is no third option that is both up to date and immediate. That is the whole intuition behind the CAP theorem, and the rest of this lesson is about stating it precisely, because the popular summary gets it wrong.',
        },
      ],
    },
    {
      heading: 'What C, A and P mean in the theorem',
      blocks: [
        {
          type: 'text',
          md: 'Eric Brewer stated CAP as a conjecture in 2000. Seth Gilbert and Nancy Lynch proved a formal version in 2002, and their definitions are narrower than everyday usage:\n\n- **Consistency (C)** means **atomic, or linearizable, consistency**: all operations behave as if they ran one at a time on a single copy, each taking effect at one instant. In particular, any read that starts after a write has **completed** must return that write\'s value or a later one.\n- **Availability (A)** means **every request received by a non-failing node must eventually get a response**. Not "most requests", not "99.9% uptime": every node that is up must answer, with no bound on how long it takes, but it may not wait forever.\n- **Partition tolerance (P)** means the guarantees must hold even when the network **loses arbitrarily many messages** between nodes. A partition is the case where every message from one group of nodes to another is lost.\n\nThe theorem: in an asynchronous network, where there are no clocks and nodes decide only from the messages they receive, no algorithm can implement a read/write data item that is **both available and linearizable in every execution, including executions where messages are lost**. The proof is the cut-cable story above: put a write on one side, a read on the other, lose every message between them, and availability forces the read to return the old value, which breaks linearizability.\n\nTwo details matter in practice. First, the **C in CAP is not the C in ACID**: ACID consistency is about a transaction keeping your invariants valid, CAP consistency is about reads seeing the latest completed write. Second, the theorem is about a single replicated read/write item; it says nothing directly about multi-item transactions, latency or crashes.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Network partition',
              definition:
                'A failure in which nodes keep running but some or all messages between groups of them are lost, so each group cannot learn what the other is doing.',
            },
            {
              term: 'Linearizability',
              definition:
                'The consistency CAP refers to: the system behaves like one copy of the data, and once a write has completed, every later read sees it or a newer value.',
            },
            {
              term: 'Availability (in CAP)',
              definition:
                'Every request that reaches a node that has not failed eventually receives a non-error response.',
            },
            {
              term: 'Partition mode',
              definition:
                "Brewer's term for the deliberate, restricted way a system operates once it decides a partition is happening, followed by a recovery step when the network heals.",
            },
            {
              term: 'PACELC',
              definition:
                "Abadi's extension of CAP: if there is a Partition, trade Availability against Consistency; Else, trade Latency against Consistency.",
            },
          ],
        },
        {
          type: 'diagram',
          caption:
            'During a partition, replication between the two replicas is cut. Replica 2 must either answer the read from its own copy, risking a stale value, or refuse until it can reach replica 1.',
          nodes: [
            { id: 'ca', label: 'Client A', kind: 'client', col: 0, row: 1 },
            { id: 'cb', label: 'Client B', kind: 'client', col: 0, row: 4 },
            {
              id: 'sa',
              label: 'App server 1',
              kind: 'service',
              col: 1,
              row: 1,
            },
            {
              id: 'sb',
              label: 'App server 2',
              kind: 'service',
              col: 1,
              row: 4,
            },
            { id: 'r1', label: 'Replica 1', kind: 'store', col: 3, row: 1 },
            { id: 'r2', label: 'Replica 2', kind: 'store', col: 3, row: 4 },
          ],
          edges: [
            { from: 'ca', to: 'sa', label: 'write x = 2' },
            { from: 'sa', to: 'r1', label: 'write x = 2' },
            { from: 'cb', to: 'sb', label: 'read x' },
            { from: 'sb', to: 'r2', label: 'read x (has x = 1)' },
            {
              from: 'r1',
              to: 'r2',
              label: 'replication: cut',
              dashed: true,
            },
          ],
        },
        {
          type: 'example',
          title: 'A stock counter split in two',
          md: 'A shop keeps the stock count for one jacket on two replicas, one per data center. The count is 1. The link between the data centers fails.\n\n- A customer in data center East buys the jacket. East sets the count to 0 and confirms the order.\n- A customer in data center West opens the product page. West still has count = 1.\n\nIf West **answers**, the page says "1 left" and West might even sell the same jacket again. The site stayed available, but the read did not reflect a completed write: not linearizable.\n\nIf West **refuses** ("stock unavailable, try again"), nobody sees a wrong count, but West is not available for this item.\n\nNote what CAP does *not* force: before the link failed, both replicas could be up to date and both could answer. The choice only appears while messages are being lost.',
        },
      ],
    },
    {
      heading: 'What CAP does not say',
      blocks: [
        {
          type: 'text',
          md: 'CAP is often taught as "a distributed system can have any two of consistency, availability and partition tolerance". Brewer himself, twelve years later, called that framing misleading. Three corrections:\n\n- **Partitions are not optional.** In any system whose parts talk over a network, messages can be lost whether you like it or not. You do not get to choose "CA" and declare partitions away. The real question is: **when a partition happens, does each operation give up availability or consistency?**\n- **The choice is only forced during a partition.** When the network is healthy, nothing in CAP stops a system from being both linearizable and available. Brewer notes partitions are rare, so a system has no reason to give up C or A when there is none.\n- **The choice is not all-or-nothing.** It can be made per operation, per kind of data, or per user, and both properties come in degrees. One system can refuse payments during a partition while still accepting likes.\n\nThere is also a practical twist. A node cannot tell a lost message from a slow one: Gilbert and Lynch\'s proof relies on exactly this. So real systems use a **timeout**, and Brewer points out that the timeout is where the partition decision is made. When it fires, the system must choose: return an error (giving up availability for that request) or proceed without hearing back (risking consistency).\n\n**PACELC** fills the gap CAP leaves when there is no partition. Daniel Abadi observed that replicated databases trade **latency** against consistency all the time, not only during failures: waiting for other replicas before answering is slower than answering locally. So he describes systems in two parts. In his 2012 article, the default configurations of Dynamo, Cassandra and Riak are **PA/EL** (favor availability during a partition, low latency otherwise), while fully ACID systems such as VoltDB/H-Store and Megastore, and BigTable and HBase, are **PC/EC**. Most of these systems let you tune the trade-off, so a label describes a default, not a law.',
        },
        {
          type: 'note',
          md: 'Gilbert and Lynch\'s availability is strict: every non-failing node must answer. A database that keeps serving from the majority side of a partition while minority nodes refuse is, by this definition, not available, even if most users never notice. When someone calls a product "CP" or "AP", ask which operations, under which settings.',
        },
      ],
    },
    {
      heading: 'Real systems making the choice',
      blocks: [
        {
          type: 'text',
          md: "Brewer's ATM example shows a business choosing availability on purpose. An ATM that cannot reach the bank could refuse all withdrawals (consistency first), but ATMs earn their keep by being available. So during a partition an ATM can allow withdrawals up to a limit, and afterwards the bank relies on auditing and compensation, such as overdraft fees, to fix any account that went negative.\n\nAbadi's article gives a counterexample in the other direction: in PNUTS (Yahoo's database), reads normally favor latency over consistency, but during a partition the system reduces availability rather than weakening consistency further. Even within one product, different situations get different answers.\n\nThe pattern in both: decide in advance which invariants must never break, refuse those operations during a partition, keep the rest running, and record enough to repair state afterwards.",
        },
      ],
    },
  ],
  application: {
    heading: 'Designing for partitions in a real product',
    blocks: [
      {
        type: 'text',
        md: 'Brewer suggests treating partitions as a mode the system enters deliberately, in three steps:\n\n1. **Detect.** A request times out waiting for another replica. From that point the operation must choose C or A.\n2. **Partition mode.** Limit operations that could break an invariant you cannot repair later, such as charging a card twice or selling a unique seat twice; refuse or delay those. Allow operations whose damage can be repaired, such as adding an item to a cart, and log extra information about them.\n3. **Recovery.** When the network heals, merge the two sides\' changes and fix mistakes. Some merges are mechanical (two carts with different items added become their union). Some mistakes cannot be undone, only **compensated**: an overbooked flight offers a rebooking and a voucher.\n\nWorked through for an online shop:\n\n- **Checkout and payment**: refuse on the side that cannot reach the system of record. A failed checkout is better than a double charge.\n- **Cart edits**: accept on both sides, merge afterwards.\n- **Product reviews and view counts**: accept and show possibly stale values; nobody is harmed by a count that is briefly behind.\n\n**Limits.** CAP is a narrow theorem about one read/write item under message loss. It says nothing about how fast a system is, how it behaves when nodes crash rather than disconnect, or what consistency you get when the network is fine. Most day-to-day decisions are about latency, which is why PACELC is often the more useful lens. And labels like "CP database" hide configuration: the same database can behave very differently depending on how reads and writes are set up.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'You can pick any two of consistency, availability and partition tolerance, for example a "CA" system.',
      correction:
        'Any system whose nodes communicate over a network can suffer a partition, so tolerating it is not optional. CAP says that while a partition lasts, an operation must give up either linearizable consistency or availability. Brewer himself called the "two of three" framing misleading.',
    },
    {
      claim: 'The C in CAP is the same as the C in ACID.',
      correction:
        "ACID consistency means a transaction leaves the database's invariants valid. CAP consistency means linearizability: once a write completes, every later read sees it. A database can satisfy one and not the other.",
    },
    {
      claim:
        'If there is no partition, there is no consistency trade-off to worry about.',
      correction:
        'CAP is silent when the network is healthy, but replication still costs time: waiting for other replicas before answering adds latency. PACELC names this ongoing latency-versus-consistency trade-off, which many systems make on every request.',
    },
  ],
  questions: [
    {
      id: 'sd-cap-theorem-q1',
      objective: 'sd-cap-theorem-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        "In Gilbert and Lynch's proof of the CAP theorem, what does consistency (C) mean?",
      options: [
        {
          id: 'a',
          text: 'Every transaction leaves the database with all its constraints and invariants valid',
          explanation:
            'That is the C in ACID. CAP consistency is a different property about what reads observe across replicas.',
        },
        {
          id: 'b',
          text: 'Operations appear to run one at a time, so a read after a completed write sees it',
          explanation:
            'Correct. CAP consistency is atomic (linearizable) consistency: the system behaves like a single copy, and any read that begins after a write completes returns that value or a later one.',
        },
        {
          id: 'c',
          text: 'All replicas converge to the same value at some point after writes stop',
          explanation:
            'That describes eventual consistency, which is much weaker. It allows reads to return old values for an unbounded time.',
        },
        {
          id: 'd',
          text: 'Every replica holds exactly the same bytes on disk at every moment',
          explanation:
            'The definition is about what clients observe through reads and writes, not about the physical state of disks at each instant.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-cap-theorem-q2',
      objective: 'sd-cap-theorem-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'How does the CAP theorem, as proved, define availability?',
      options: [
        {
          id: 'a',
          text: 'The service is up for at least an agreed share of time, such as 99.9%',
          explanation:
            'That is an uptime target from service-level agreements. CAP availability makes no allowance for a share of failed requests.',
        },
        {
          id: 'b',
          text: 'Every request gets a response within a fixed deadline, such as 100 ms',
          explanation:
            'The proof puts no bound on response time. It only requires that a response eventually comes.',
        },
        {
          id: 'c',
          text: 'Every request received by a non-failing node eventually gets a response',
          explanation:
            'Correct. Gilbert and Lynch require every node that is still running to answer every request it receives, even when messages between nodes are lost.',
        },
        {
          id: 'd',
          text: 'A majority of the nodes in the cluster can still answer requests',
          explanation:
            'A majority answering while minority nodes refuse does not meet the definition: every non-failing node must respond.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-cap-theorem-q3',
      objective: 'sd-cap-theorem-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A follower replica loses contact with its leader. It keeps answering reads from its local copy, which may be missing writes the leader has already confirmed. In CAP terms, what is it giving up for those reads?',
      options: [
        {
          id: 'a',
          text: 'Partition tolerance, because it is still serving requests during a partition',
          explanation:
            'Partition tolerance is not given up: the system keeps operating during the partition. What it sacrifices is the guarantee about what reads return.',
        },
        {
          id: 'b',
          text: 'Availability, because the follower cannot reach the leader to check',
          explanation:
            'The follower is answering every read, so it is available. Availability is about responding, not about contacting the leader.',
        },
        {
          id: 'c',
          text: 'Durability, because the confirmed writes may now be lost permanently',
          explanation:
            'The writes are still stored on the leader and are not lost. Durability is not one of the three CAP properties.',
        },
        {
          id: 'd',
          text: 'Consistency, because a read may miss a write that already completed',
          explanation:
            'Correct. Returning a value older than a completed write breaks linearizability. The follower chose availability over consistency for these reads.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-cap-theorem-q4',
      objective: 'sd-cap-theorem-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why is "pick any two of C, A and P" a misleading summary of CAP?',
      options: [
        {
          id: 'a',
          text: 'Partitions cannot be opted out of; the C-or-A choice arises only while one lasts',
          explanation:
            'Correct. Any networked system can lose messages, so P is not a free choice. Without a partition, a system can be both consistent and available; the trade-off appears only during one.',
        },
        {
          id: 'b',
          text: 'With enough replicas, a system can guarantee all three properties at once',
          explanation:
            'Adding replicas does not help: the proof works for any number of nodes split into two groups that cannot communicate.',
        },
        {
          id: 'c',
          text: 'CAP only applies to relational databases, not to other kinds of systems',
          explanation:
            'The theorem is about any replicated read/write data item, regardless of data model. It applies to key-value stores and caches as much as to SQL databases.',
        },
        {
          id: 'd',
          text: 'Modern data center networks no longer partition, so P is always free',
          explanation:
            'Networks can still lose messages, and a node cannot tell a lost message from a slow one. Brewer calls partitions rare, not impossible.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-cap-theorem-q5',
      objective: 'sd-cap-theorem-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'PACELC extends CAP with an "else" case for when there is no partition. What does a system trade off in that case?',
      options: [
        {
          id: 'a',
          text: 'Availability against partition tolerance',
          explanation:
            'The "else" case applies precisely when there is no partition, so partition tolerance is not what is traded there.',
        },
        {
          id: 'b',
          text: 'Durability against write throughput',
          explanation:
            'That is a real engineering trade-off, but it is not the one PACELC names.',
        },
        {
          id: 'c',
          text: 'Latency against consistency',
          explanation:
            'Correct. Else (no partition), a replicated system chooses between answering fast from nearby replicas and waiting for coordination to stay consistent.',
        },
        {
          id: 'd',
          text: 'Hardware cost against availability',
          explanation:
            'Cost matters in practice, but PACELC is about consistency trade-offs, and the "else" case is latency versus consistency.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-cap-theorem-q6',
      objective: 'sd-cap-theorem-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A replica sends a message to another replica and hears nothing back. Why can it not simply wait until it knows for sure whether a partition is happening?',
      options: [
        {
          id: 'a',
          text: 'Heartbeats tell it reliably within one round trip, so waiting is never needed',
          explanation:
            'Heartbeats are messages too, and they can be delayed or lost like any other. They give a guess, not certainty.',
        },
        {
          id: 'b',
          text: 'A lost message looks the same as a slow one, so it must pick a timeout and decide',
          explanation:
            'Correct. In an asynchronous network a node cannot distinguish loss from delay. Waiting forever would mean never answering, so the timeout is where it chooses between an error and a possibly stale answer.',
        },
        {
          id: 'c',
          text: 'Waiting is forbidden by partition tolerance, which requires an immediate answer',
          explanation:
            'Partition tolerance requires the guarantees to hold despite message loss; it says nothing about answering immediately.',
        },
        {
          id: 'd',
          text: 'The other replica will always resend its state once the network is healthy again',
          explanation:
            'Even if it does, the replica cannot know when that will be. A request waiting indefinitely is exactly the loss of availability CAP describes.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-cap-theorem-q7',
      objective: 'sd-cap-theorem-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A concert site replicates seat bookings across two data centers. The rule is that one seat must never be sold to two people. The link between the data centers fails. Which behavior keeps the rule?',
      options: [
        {
          id: 'a',
          text: 'Both sides keep selling seats and resolve clashes later by last write wins',
          explanation:
            'Two buyers can be confirmed for the same seat, and last write wins silently discards one sale. The rule is broken.',
        },
        {
          id: 'b',
          text: 'Each side sells from a local cache and syncs bookings once the link is back',
          explanation:
            'Each side can sell the same seat from its own cache. Syncing later finds the double sale but does not prevent it.',
        },
        {
          id: 'c',
          text: 'Add a third replica so every write is copied to more machines first',
          explanation:
            'More replicas do not remove the choice. During a partition some node still has to either answer without coordination or refuse.',
        },
        {
          id: 'd',
          text: 'Only the side that owns the seat records accepts; the other side refuses',
          explanation:
            'Correct. Giving up availability on the side that cannot coordinate means a seat is only ever sold where its record lives, so it cannot be sold twice.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-cap-theorem-q8',
      objective: 'sd-cap-theorem-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'For shopping-cart edits, the business wants two things during a partition: always accept "add item", and never lose an item a customer added. Which plan meets both?',
      options: [
        {
          id: 'a',
          text: 'Accept adds on both sides, log them, and merge carts as a union on recovery',
          explanation:
            'Correct. This chooses availability, and because adds from both sides are kept and combined, nothing is lost. It is the partition-mode-then-recovery approach Brewer describes.',
        },
        {
          id: 'b',
          text: 'Refuse adds on any side that cannot reach the primary until the link heals',
          explanation:
            'This keeps consistency but fails the first requirement: adds are not always accepted.',
        },
        {
          id: 'c',
          text: 'Accept adds on both sides and keep whichever whole cart was saved last',
          explanation:
            'Overwriting the whole cart with the latest copy drops items added on the other side, which breaks the second requirement.',
        },
        {
          id: 'd',
          text: 'Accept the request but hold the response until the other side confirms it',
          explanation:
            'Holding the response until the partition heals means not answering, which is giving up availability, not keeping it.',
        },
      ],
      answer: 'a',
    },
  ],
  scenario: {
    prompt:
      'You run a coworking booking app in two regions, each with its own replica of the database. The link between the regions goes down for ten minutes, while both regions keep serving their local users. For each of these features, decide what it should do during the partition and how you would repair state afterwards:\n\n1. Booking a specific desk for a day (a desk must not be double-booked).\n2. Editing your own profile bio.\n3. Posting on a members-only noticeboard.\n4. Showing the number of free desks on the home page.\n\nJustify each choice in CAP terms.',
    modelAnswer:
      'Start by asking, per feature, what breaks if both sides act independently, and whether that damage can be repaired later.\n\n1. **Desk booking: choose consistency.** A double-booked desk breaks a hard rule, and "repairing" it means telling a member their desk is gone. Give each desk (or each building) a home region that holds its bookings. During the partition, the home region keeps accepting bookings for its desks; the other region shows the desk as "can\'t book right now, try again". That side is unavailable for those desks, which CAP says is the price of never double-booking.\n2. **Profile bio: choose availability.** Only the owner edits it, so conflicts are rare and harmless. Accept edits on either side. On recovery, if both sides changed the bio, keep the one with the later timestamp, or keep both and ask the user. A lost edit to a bio is an annoyance, not a broken rule.\n3. **Noticeboard posts: choose availability.** Posts from both sides do not conflict: on recovery, merge them into one list ordered by time. Members on each side briefly see only local posts, which is acceptable.\n4. **Free-desk count: choose availability, show staleness.** Serve the local count, perhaps labelled "as of a few minutes ago". Bookings are still protected by feature 1, so a slightly wrong count cannot cause a double booking.\n\nThe general pattern: refuse operations whose mistakes cannot be repaired, keep the rest running, and log enough to merge afterwards. Other answers can be valid: for example, a team could decide booking should also stay available and handle the rare clash by compensating (moving the member to an equivalent desk with an apology), if the business accepts that.',
    checklist: [
      'Treats the choice per feature, not one CP or AP label for the whole app',
      'Protects the no-double-booking rule by refusing or routing to a single owner during the partition',
      'Keeps low-risk features (bio, posts, counts) available and accepts temporary staleness',
      'Describes a concrete merge or recovery step for each feature that stays available',
      'Uses CAP terms correctly: refusing gives up availability, answering locally gives up consistency',
    ],
  },
  takeaways: [
    'CAP says that while a network partition lasts, a replicated data item cannot be both linearizable and available on every node.',
    'In CAP, consistency means linearizability (a read sees any write that has completed), not the C in ACID.',
    'Partitions are not optional in a networked system, so "pick two of three" is misleading; the C-or-A choice applies only during a partition.',
    'The choice can be made per operation: refuse what cannot be repaired, keep the rest available, and plan recovery and compensation.',
    'PACELC adds that without a partition, replicated systems still trade latency against consistency.',
  ],
  references: [
    {
      title:
        "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services",
      publisher: 'Seth Gilbert and Nancy Lynch, ACM SIGACT News (2002)',
      url: 'https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf',
      kind: 'source',
    },
    {
      title: 'CAP Twelve Years Later: How the "Rules" Have Changed',
      publisher: 'Eric Brewer, InfoQ (originally IEEE Computer)',
      url: 'https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/',
      kind: 'source',
    },
    {
      title:
        'Consistency Tradeoffs in Modern Distributed Database System Design',
      publisher: 'Daniel J. Abadi, IEEE Computer (2012)',
      url: 'https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf',
      kind: 'source',
    },
    {
      title: 'Perspectives on the CAP Theorem',
      publisher: 'Seth Gilbert and Nancy Lynch, MIT',
      url: 'https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf',
      kind: 'further',
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

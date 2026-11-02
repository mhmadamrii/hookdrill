import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'distributed-transactions',
  title: 'Distributed Transactions',
  summary:
    'When one business action changes data in several databases or services, a single local transaction no longer covers it. Two-phase commit makes all parties commit or abort together but can block; sagas run a chain of local transactions and undo finished steps with compensating actions.',
  minutes: 18,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-distributed-transactions-1',
      text: 'explain why a local transaction cannot cover changes in several services or databases, and describe the prepare and commit phases of two-phase commit.',
    },
    {
      id: 'sd-distributed-transactions-2',
      text: 'explain why two-phase commit can block when the coordinator fails, and what that costs the participants.',
    },
    {
      id: 'sd-distributed-transactions-3',
      text: 'design a saga with compensating actions, choose choreography or orchestration, and handle its lack of isolation and the need to update and publish atomically.',
    },
  ],
  concept: [
    {
      heading: 'When one transaction is not enough',
      blocks: [
        {
          type: 'text',
          md: "Inside one database, a transaction gives you atomicity for free: `BEGIN`, change several rows, `COMMIT`, and either all changes land or none do. Checkout in a single app with one Postgres database is easy for that reason.\n\nNow split that app. Orders live in the order service's database, stock in the inventory service's database, and money moves through a payment service. Or keep one service but shard the data, so the buyer's row and the seller's row are on different machines. A single checkout must now change state in several places, and each place commits on its own.\n\nThe failure you are guarding against is a **partial result**: the card was charged but no order exists, or stock was reserved for an order that was never paid. Wrapping your code in `BEGIN`/`COMMIT` on the order database does not help. That transaction only covers the order database; rolling it back cannot un-charge a card that another service already charged.\n\nThere are two broad answers. **Two-phase commit** makes all participants agree to commit or abort as one atomic unit. **Sagas** give up that single atomic step and instead make each step undoable.",
        },
      ],
    },
    {
      heading: 'Two-phase commit',
      blocks: [
        {
          type: 'text',
          md: "Two-phase commit (2PC) adds a **coordinator** that drives the **participants** (the databases or resource managers involved).\n\n1. **Prepare phase.** The coordinator asks each participant to prepare. A participant does all the work of the transaction, writes it durably so it survives a crash, and votes **yes** (\"I can commit\") or **no**. A yes vote is a promise: from now on the participant must be able to commit if told to, and it may not abort on its own.\n2. **Commit phase.** If every participant voted yes, the coordinator records the decision and tells everyone to **commit**. If any voted no or did not answer, it tells everyone to **abort**.\n\nPostgreSQL exposes the participant side directly. `PREPARE TRANSACTION 'id'` stores the transaction's state on disk so it can be committed even after a crash, and later `COMMIT PREPARED` or `ROLLBACK PREPARED` finishes it, from any session. The documentation is blunt that this is a building block for an external **transaction manager** (the coordinator), not something applications should call directly.\n\n**The weakness: blocking.** Once a participant has voted yes, it is **in doubt**: it does not know whether the others voted yes, so it cannot decide alone. If the coordinator crashes before sending the decision, the participant must wait for the coordinator to recover. Meanwhile, as the PostgreSQL docs warn, a prepared transaction **keeps every lock it held**, so other transactions that need those rows wait too. One failed coordinator can stall unrelated requests. This is a consistency-over-availability choice of the kind you met in the CAP lesson: the participant refuses to guess rather than risk a split outcome.\n\n2PC is a poor fit across independently owned services. As microservices.io points out, the database or message broker involved may not support it, and it couples each service to all the others and to the coordinator. It suits cases where you control every participant and they all support it, such as a transaction manager over a few databases that offer prepared transactions.",
        },
        {
          type: 'diagram',
          caption:
            'Two-phase commit: a coordinator asks both participant databases to prepare, then tells both to commit only if both voted yes.',
          nodes: [
            { id: 'c', label: 'Client', kind: 'client', col: 0, row: 2 },
            {
              id: 'app',
              label: 'Checkout app',
              kind: 'service',
              col: 1,
              row: 2,
            },
            {
              id: 'tm',
              label: 'Txn coordinator',
              kind: 'service',
              col: 2,
              row: 2,
            },
            { id: 'odb', label: 'Orders DB', kind: 'store', col: 4, row: 1 },
            { id: 'idb', label: 'Inventory DB', kind: 'store', col: 4, row: 3 },
          ],
          edges: [
            { from: 'c', to: 'app', label: 'place order' },
            { from: 'app', to: 'tm', label: 'begin global txn' },
            { from: 'tm', to: 'odb', label: '1 prepare, 2 commit' },
            { from: 'tm', to: 'idb', label: '1 prepare, 2 commit' },
          ],
        },
      ],
    },
    {
      heading: 'Sagas and compensating actions',
      blocks: [
        {
          type: 'text',
          md: "Hector Garcia-Molina and Kenneth Salem introduced **sagas** in 1987 for a related problem: long-lived transactions that hold locks for a long time and delay everything else. Their idea is to write the long transaction as a **sequence of shorter transactions** that can interleave with other work. The system guarantees that either **all of them complete**, or **compensating transactions run to amend the partial execution**.\n\nIn a service architecture, each step is a **local transaction** in one service, and each step that might need undoing has a **compensating action**: a new transaction that semantically reverses it. Compensation is not a rollback. The original step committed and others may already have seen it; the compensation is a visible new fact, such as a refund next to the charge.\n\nMicrosoft's saga guidance names three kinds of step:\n\n- **Compensable** steps can be undone by a compensating action (reserve stock / release stock).\n- The **pivot** step is the point of no return. Once it succeeds, the saga must run to the end.\n- **Retryable** steps come after the pivot. They must eventually succeed, so they are made idempotent and retried until they do.\n\nThere are two ways to coordinate the steps:\n\n- **Choreography**: each service publishes events, and other services react to them. No central controller, but the overall flow is spread across services and harder to follow.\n- **Orchestration**: a central orchestrator tells each participant what to do next and runs compensations on failure. The flow is in one place, at the cost of one more component that must be reliable.\n\nTwo practical problems remain. First, sagas **lack isolation**, the I in ACID: between steps, other requests can see intermediate state, which leads to anomalies such as dirty reads and lost updates. A common countermeasure is a **semantic lock**: mark the order `PENDING` so other code knows it is in progress. Second, each step must **update its database and publish its message atomically**, or a crash between the two loses the next step. The **transactional outbox** pattern solves this: write the message to an outbox table in the same local transaction, and let a separate relay publish it.",
        },
        {
          type: 'example',
          title: 'An orchestrated checkout saga',
          md: 'The order service orchestrates four steps:\n\n1. **Create order** with status `PENDING` (compensable: mark it `CANCELLED`).\n2. **Reserve stock** in the inventory service (compensable: release the reservation).\n3. **Charge the card** in the payment service. This is the **pivot**: once money has moved, the business wants the order to go through.\n4. **Confirm the order** and request shipping (retryable: retried until it succeeds; each call carries the order id so repeats do no harm).\n\nIf step 3 is declined, the orchestrator runs compensations for the steps that **did** complete, in reverse: release the stock, then mark the order `CANCELLED`. There is nothing to compensate for the charge, because it never happened.\n\nWhile the saga runs, the order is visibly `PENDING`. That status is the semantic lock: the "cancel order" button and the stock report both know to treat it as unfinished.',
        },
        {
          type: 'diagram',
          caption:
            'An orchestrated saga: the orchestrator runs each service’s local transaction in turn, and runs compensations in reverse if a later step fails.',
          nodes: [
            { id: 'c', label: 'Client', kind: 'client', col: 0, row: 2 },
            {
              id: 'orc',
              label: 'Order orchestrator',
              kind: 'service',
              col: 1,
              row: 2,
            },
            { id: 'odb', label: 'Orders DB', kind: 'store', col: 1, row: 4 },
            { id: 'inv', label: 'Inventory', kind: 'service', col: 3, row: 1 },
            { id: 'pay', label: 'Payments', kind: 'service', col: 3, row: 3 },
            {
              id: 'psp',
              label: 'Card processor',
              kind: 'external',
              col: 4,
              row: 3,
            },
          ],
          edges: [
            { from: 'c', to: 'orc', label: 'checkout' },
            { from: 'orc', to: 'odb', label: 'order PENDING' },
            { from: 'orc', to: 'inv', label: 'reserve / release' },
            { from: 'orc', to: 'pay', label: 'charge (pivot)' },
            { from: 'pay', to: 'psp', label: 'authorize' },
          ],
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Two-phase commit (2PC)',
              definition:
                'A protocol in which a coordinator first asks every participant to prepare and vote, then tells all to commit only if all voted yes.',
            },
            {
              term: 'In doubt',
              definition:
                'The state of a 2PC participant that has voted yes but not yet heard the decision; it cannot commit or abort on its own.',
            },
            {
              term: 'Saga',
              definition:
                'A sequence of local transactions in which, if a step fails, compensating transactions undo the effects of the steps already completed.',
            },
            {
              term: 'Compensating action',
              definition:
                'A new transaction that semantically reverses an earlier committed step, such as a refund for a charge.',
            },
            {
              term: 'Pivot step',
              definition:
                'The point of no return in a saga: after it succeeds, the remaining steps must be completed rather than compensated.',
            },
            {
              term: 'Transactional outbox',
              definition:
                'Writing an outgoing message to a table in the same local transaction as the business change, so a relay can publish it reliably afterwards.',
            },
          ],
        },
      ],
    },
  ],
  application: {
    heading: 'Choosing between them in a real system',
    blocks: [
      {
        type: 'text',
        md: 'Start by avoiding the problem. If the data an action changes can live in one database, a local transaction is simpler and stronger than either technique. Many "distributed transaction" problems disappear when service boundaries follow the data that must change together.\n\nIf the data must be split:\n\n- **2PC** fits when you control all participants, they all support it, and they are close and reliable: for example, a transaction manager over a few databases that support prepared transactions. If you use a sharded database that offers multi-shard transactions itself, use those rather than building your own. Plan for in-doubt transactions: monitor for prepared transactions that are left hanging, because they hold locks.\n- **Sagas** fit long-running or cross-team workflows: checkout, travel bookings, account onboarding. Model each step\'s compensation explicitly, decide where the pivot is (usually the step hardest to undo, such as taking payment or calling an external partner), and make retried steps idempotent.\n\n**Limits of sagas.** They are not ACID: intermediate states are visible and concurrent sagas can interfere, so you design countermeasures such as semantic locks, commutative updates, or rereading a value before updating it. Some actions cannot truly be compensated: an email that went out can only be followed by a correction. Compensations can fail too, so they also need retries and monitoring. And debugging a saga that spans several services needs good tracing of each step.\n\n**Limits of 2PC.** Besides blocking, it couples every participant to the coordinator\'s availability and adds round trips to every transaction, which hurts most across long distances.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'A compensating action rolls the system back as if the step never happened.',
      correction:
        'The original step committed, and other requests may already have read or acted on it. A compensation is a new, visible transaction, such as a refund appearing next to the charge. Some effects, like a sent email, can only be corrected, not erased.',
    },
    {
      claim:
        'Two-phase commit guarantees the transaction always finishes promptly.',
      correction:
        '2PC guarantees all participants reach the same outcome, not that they reach it quickly. If the coordinator fails after participants vote yes, they stay in doubt, holding their locks, until it recovers.',
    },
    {
      claim: 'A saga gives you an ACID transaction spread across services.',
      correction:
        'A saga provides all-or-compensated outcomes, but not isolation: other requests can see intermediate states between steps. You add countermeasures such as semantic locks to cope with that.',
    },
  ],
  questions: [
    {
      id: 'sd-distributed-transactions-q1',
      objective: 'sd-distributed-transactions-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What happens in the first phase of two-phase commit?',
      options: [
        {
          id: 'a',
          text: 'Each participant commits its part and reports back to the coordinator',
          explanation:
            'Committing in the first phase would make it impossible to abort if another participant fails. Commit happens only in the second phase.',
        },
        {
          id: 'b',
          text: 'The coordinator locks every table in every participant database',
          explanation:
            'Participants take the locks their own work needs; the coordinator does not lock whole tables.',
        },
        {
          id: 'c',
          text: 'Each participant prepares its work durably and votes yes or no',
          explanation:
            'Correct. In the prepare phase, a participant makes its changes durable and votes. A yes vote promises it can commit if told to.',
        },
        {
          id: 'd',
          text: 'Each participant sends its data to the coordinator to be stored there',
          explanation:
            'Data stays in the participants. The coordinator only collects votes and broadcasts the decision.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-distributed-transactions-q2',
      objective: 'sd-distributed-transactions-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Inside a transaction on the orders database, code calls the payment service’s API to charge a card, then inserts the order row. The insert fails and the transaction rolls back. What happens to the charge?',
      options: [
        {
          id: 'a',
          text: 'It stays: the rollback only covers the orders database, not the payment service',
          explanation:
            'Correct. The payment service committed the charge in its own system. A local transaction cannot undo work done elsewhere; that needs a compensating action such as a refund.',
        },
        {
          id: 'b',
          text: 'It is undone, because the API call happened inside the database transaction',
          explanation:
            'Making a network call while a transaction is open does not enlist the remote service in that transaction.',
        },
        {
          id: 'c',
          text: 'It is undone after the database informs the payment service of the rollback',
          explanation:
            'The orders database knows nothing about the payment service and sends it no messages.',
        },
        {
          id: 'd',
          text: 'It is held in a pending state until the order insert is retried',
          explanation:
            'Nothing links the charge to the failed insert. Unless the code does something, the charge simply remains.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-distributed-transactions-q3',
      objective: 'sd-distributed-transactions-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A 2PC participant has voted yes. Before it hears the decision, the coordinator crashes. What must the participant do?',
      options: [
        {
          id: 'a',
          text: 'Commit, since it voted yes and the others probably did too',
          explanation:
            'Another participant may have voted no, in which case the decision was abort. Committing alone could split the outcome.',
        },
        {
          id: 'b',
          text: 'Abort after a timeout, since no decision arrived in time',
          explanation:
            'The coordinator may already have decided commit and told other participants. Aborting alone could split the outcome, which a yes vote promised not to do.',
        },
        {
          id: 'c',
          text: 'Release its locks but keep the changes until the decision arrives',
          explanation:
            'Releasing locks would let other transactions see or change data whose fate is unknown. Prepared transactions keep their locks.',
        },
        {
          id: 'd',
          text: 'Wait in doubt, holding its locks, until it learns the decision',
          explanation:
            'Correct. Having voted yes, it cannot decide alone. It must wait for the coordinator to recover (or learn the outcome another way), and its locks stay held, blocking others.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-distributed-transactions-q4',
      objective: 'sd-distributed-transactions-2',
      kind: 'recall',
      difficulty: 'medium',
      prompt:
        'According to the PostgreSQL documentation, what is true of a transaction after `PREPARE TRANSACTION`?',
      options: [
        {
          id: 'a',
          text: 'Its changes become visible to other sessions straight away',
          explanation:
            'The changes are not visible until the prepared transaction is committed.',
        },
        {
          id: 'b',
          text: 'It keeps holding its locks until it is committed or rolled back',
          explanation:
            'Correct. The docs warn that a prepared transaction continues to hold whatever locks it held, which is why prepared transactions should not be left hanging.',
        },
        {
          id: 'c',
          text: 'It is discarded automatically if the server restarts',
          explanation:
            'The opposite: its state is stored on disk precisely so it can still be committed after a crash.',
        },
        {
          id: 'd',
          text: 'It can only be finished from the session that prepared it',
          explanation:
            'Once prepared, it is no longer tied to that session. `COMMIT PREPARED` or `ROLLBACK PREPARED` can be issued from any session.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-distributed-transactions-q5',
      objective: 'sd-distributed-transactions-3',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'As Garcia-Molina and Salem defined it, what does a saga guarantee?',
      options: [
        {
          id: 'a',
          text: 'All its steps run inside one transaction that holds its locks until the end',
          explanation:
            'Sagas were proposed to avoid exactly that: a long transaction holding locks for its whole duration.',
        },
        {
          id: 'b',
          text: 'Other transactions never see the results of a saga’s completed steps',
          explanation:
            'Each step commits on its own, so its results are visible. Sagas do not provide isolation.',
        },
        {
          id: 'c',
          text: 'Every step is retried until it succeeds, so no step ever fails',
          explanation:
            'Steps can fail; the saga then compensates. Only the steps after a pivot are designed to be retried to completion.',
        },
        {
          id: 'd',
          text: 'Either every step completes, or compensations amend the partial result',
          explanation:
            'Correct. A saga is a sequence of transactions; the system ensures all complete, or compensating transactions are run for the ones that did.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-distributed-transactions-q6',
      objective: 'sd-distributed-transactions-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'What is the main difference between a choreographed and an orchestrated saga?',
      options: [
        {
          id: 'a',
          text: 'Choreography uses compensating actions; orchestration uses two-phase commit',
          explanation:
            'Both are ways to coordinate a saga, and both use compensating actions rather than 2PC.',
        },
        {
          id: 'b',
          text: 'Choreography runs steps in parallel; orchestration runs them one by one',
          explanation:
            'Either style can run steps in sequence or in parallel. The difference is who decides what happens next.',
        },
        {
          id: 'c',
          text: 'In choreography services react to each other’s events; in orchestration one controller directs',
          explanation:
            'Correct. Choreography has no central controller, so the flow is spread across services; orchestration keeps the flow and the compensation logic in one orchestrator.',
        },
        {
          id: 'd',
          text: 'Choreography keeps isolation between sagas; orchestration gives it up',
          explanation:
            'Neither style provides isolation between steps. Both need countermeasures such as semantic locks.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-distributed-transactions-q7',
      objective: 'sd-distributed-transactions-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A checkout saga runs: (1) create order as PENDING, (2) reserve stock, (3) charge card. Step 3 is declined. What should the saga do?',
      options: [
        {
          id: 'a',
          text: 'Release the stock reservation, then mark the order as cancelled',
          explanation:
            'Correct. Compensate the completed steps in reverse order. The charge needs no compensation, because it never happened.',
        },
        {
          id: 'b',
          text: 'Refund the card, release the stock, then mark the order as cancelled',
          explanation:
            'The charge was declined, so there is nothing to refund. Compensations run only for steps that completed.',
        },
        {
          id: 'c',
          text: 'Delete the order row and the reservation row, as if nothing happened',
          explanation:
            'Compensations are new, visible transactions, not erasure. Deleting rows loses the record that the order was attempted and failed.',
        },
        {
          id: 'd',
          text: 'Keep retrying the charge until it succeeds, since steps must complete',
          explanation:
            'A declined card is a business failure, not a transient error. Retrying forever leaves stock reserved and the order stuck.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-distributed-transactions-q8',
      objective: 'sd-distributed-transactions-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A saga step commits an order to the database and then publishes an "OrderCreated" message to the broker. If the service crashes between the two, the next step never starts. What fixes this?',
      options: [
        {
          id: 'a',
          text: 'Publish the message first, then commit the order to the database',
          explanation:
            'This only swaps the failure: a crash after publishing but before committing announces an order that does not exist.',
        },
        {
          id: 'b',
          text: 'Write the message to an outbox table in the same local transaction and relay it',
          explanation:
            'Correct. The order and the message commit together or not at all, and a relay publishes outbox rows afterwards. The relay may publish twice, so consumers must handle duplicates.',
        },
        {
          id: 'c',
          text: 'Retry the publish in a loop inside the request handler until it succeeds',
          explanation:
            'If the process crashes, the loop dies with it, and nothing remembers that a message still needs sending.',
        },
        {
          id: 'd',
          text: 'Use a longer broker timeout so the publish is less likely to fail',
          explanation:
            'The problem is a crash between two separate actions, not a slow broker. A longer timeout does not make them atomic.',
        },
      ],
      answer: 'b',
    },
  ],
  scenario: {
    prompt:
      'A travel site sells packages of a flight, a hotel room and a rental car. Each is booked through a different external partner API, each partner offers a cancel call, and the hotel charges a fee if you cancel more than an hour after booking. The site also charges the customer’s card once for the whole package. Design how a package booking works: the steps, their order, the compensations, where the point of no return is, and what the customer sees while it runs and if it fails.',
    modelAnswer:
      'Two-phase commit is not an option: the partners are external APIs that will not take part in our transaction protocol. So this is a saga, and since there are several steps and conditional compensations, an **orchestrator** in our booking service keeps the flow in one place.\n\n**Order the steps by how cheap they are to undo.** The idea is to put the steps most likely to fail early, and the ones that are hardest to undo last.\n\n1. **Create the booking** with status `PENDING` (compensation: mark `FAILED`). This is the semantic lock the UI and support tools read.\n2. **Book the flight** (compensation: cancel flight). If seats are the item most likely to be sold out, failing here first costs nothing else.\n3. **Book the car** (compensation: cancel car).\n4. **Book the hotel** (compensation: cancel hotel, free within the hour).\n5. **Charge the card.** This is the **pivot**: after it succeeds, we complete the booking rather than undo it.\n6. **Confirm the booking** and send the itinerary email. These are retryable and idempotent (keyed by booking id), so a retry never sends two confirmations or confirms twice.\n\n**Failure handling.** If step *k* fails, run the compensations of steps 1..*k-1* in reverse. Because the hotel fee starts after an hour, the orchestrator must finish or compensate quickly; it should time out a stuck step well within that window rather than wait. If a compensation itself fails (a partner cancel call errors), retry it, and if it keeps failing, raise it to a support queue: compensations can fail too.\n\n**Charge last or first?** Charging last means we never refund for partner failures, but if the card is then declined we compensate three bookings. Some teams instead place an authorization hold first and capture at the end. Either is defensible; what matters is naming the pivot and its trade-off.\n\n**What the customer sees.** "Booking in progress" while `PENDING`, then either the confirmed itinerary or a clear message that nothing was booked and nothing was charged. Atomically saving each step\'s state together with its outgoing request (an outbox) means a crash mid-saga resumes instead of leaving bookings orphaned.\n\nOther valid designs exist, for example choreography via events between our own services, as long as compensations, the pivot and failure visibility are handled.',
    checklist: [
      'Explains why 2PC does not fit (external partners) and chooses a saga',
      'Lists the steps in an order chosen for how easy each is to undo, with a compensation for each compensable step',
      'Identifies a pivot step (such as charging the card) and makes later steps retryable and idempotent',
      'Handles a failing compensation (retry, escalate) and the hotel’s time-limited free cancellation',
      'Uses a visible PENDING state so the customer and other code can see the booking is unfinished',
    ],
  },
  takeaways: [
    'A local transaction only covers its own database, so a business action across services or shards can end half done without extra design.',
    'Two-phase commit gets every participant to the same outcome, but a participant that voted yes is stuck holding locks if the coordinator fails.',
    'A saga is a chain of local transactions; if a step fails, compensating actions undo the completed steps as new, visible transactions.',
    'Sagas lack isolation, so intermediate states are visible; semantic locks such as a PENDING status are a common countermeasure.',
    'Name the pivot step, make the steps after it retryable and idempotent, and use a transactional outbox so each step updates and publishes atomically.',
  ],
  references: [
    {
      title: 'Sagas',
      publisher: 'Hector Garcia-Molina and Kenneth Salem, ACM SIGMOD (1987)',
      url: 'https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf',
      kind: 'source',
    },
    {
      title: 'PREPARE TRANSACTION',
      publisher: 'PostgreSQL Documentation',
      url: 'https://www.postgresql.org/docs/current/sql-prepare-transaction.html',
      kind: 'source',
    },
    {
      title: 'Pattern: Saga',
      publisher: 'Chris Richardson, microservices.io',
      url: 'https://microservices.io/patterns/data/saga.html',
      kind: 'source',
    },
    {
      title: 'Saga design pattern',
      publisher: 'Microsoft Azure Architecture Center',
      url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/saga',
      kind: 'source',
    },
    {
      title: 'Pattern: Transactional outbox',
      publisher: 'Chris Richardson, microservices.io',
      url: 'https://microservices.io/patterns/data/transactional-outbox.html',
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

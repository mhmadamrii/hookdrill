import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'event-driven-architecture',
  title: 'Event-Driven Architecture',
  summary:
    'In an event-driven system, services announce facts that happened and other services react, instead of the first service calling each of them. "Event-driven" covers several distinct patterns, and an event log adds replay and per-key ordering, at the price of hidden flows, stale copies and duplicate deliveries.',
  minutes: 17,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-event-driven-architecture-1',
      text: 'distinguish an event from a command, and tell apart event notification, event-carried state transfer and event sourcing.',
    },
    {
      id: 'sd-event-driven-architecture-2',
      text: 'explain how an event log such as Kafka differs from a work queue: retention, replay, several independent readers, and ordering per partition by key.',
    },
    {
      id: 'sd-event-driven-architecture-3',
      text: 'evaluate the costs of an event-driven design, including hard-to-see flows, stale downstream copies and duplicate deliveries, and the techniques that contain them.',
    },
  ],
  concept: [
    {
      heading: 'Reacting instead of calling',
      blocks: [
        {
          type: 'text',
          md: 'Picture checkout in a growing shop. When an order is placed, the order service calls the email service to send a receipt, then the analytics service, then the loyalty service to add points. Every new feature that cares about orders means another call added to checkout, and if loyalty is down, checkout has to decide whether to fail.\n\nThe event-driven alternative flips the dependency. The order service records the order and **announces a fact**: `OrderPlaced`. Email, analytics and loyalty each **subscribe** and react in their own time. The order service does not know who is listening, and adding a fraud check next month means adding a subscriber, not changing checkout.\n\nYou already met the plumbing in the message-queue and async-processing lessons: producers, consumers and a broker in between. This lesson is about the design style built on top of it, what it buys you, and what it costs.',
        },
      ],
    },
    {
      heading: 'Events, commands and four patterns',
      blocks: [
        {
          type: 'text',
          md: 'An **event** records something that **has happened**: `OrderPlaced`, `PaymentFailed`, `AddressChanged`. It is named in the past tense, the sender does not expect a particular reaction, and receivers cannot reject it, because it is already true. A **command** asks for something **to be done**: `SendReceipt`, `ChargeCard`. It has an intended receiver, and that receiver may refuse or fail. Martin Fowler warns against the "passive-aggressive command": an event that is really a command in disguise, where the sender quietly depends on a specific receiver doing a specific thing.\n\nFowler also points out that "event-driven" is used for several different patterns, and mixing them up leads to confused designs:\n\n- **Event notification.** The event says that something changed, often carrying little more than an id. Receivers that need details call back to the source. Coupling is low, but the overall flow is no longer visible in any one place in the code.\n- **Event-carried state transfer.** The event carries the changed data, so receivers keep their **own copy** and never need to call the source. Receivers keep working when the source is down and avoid the round trip, at the cost of duplicated data and copies that are only **eventually consistent** with the source.\n- **Event sourcing.** The events themselves are the system\'s record of truth. Current state is derived by replaying them, which gives a full audit trail and the ability to rebuild past states. Fowler notes it does not have to be asynchronous at all.\n- **CQRS** (command query responsibility segregation) uses separate models for writing and reading. It is often combined with the patterns above, but it does not require events.',
        },
        {
          type: 'example',
          title: 'The same fact, two event styles',
          md: 'A customer changes their delivery address.\n\nAs an **event notification**:\n\n```\n{ "type": "AddressChanged", "customerId": "c_481" }\n```\n\nThe shipping service must now call the customer service to fetch the new address. If the customer service is down, shipping is stuck.\n\nAs **event-carried state transfer**:\n\n```\n{ "type": "AddressChanged", "customerId": "c_481",\n  "address": { "line1": "12 Harbour Rd", "city": "Leeds", "postcode": "LS1 4AB" } }\n```\n\nShipping updates its own table of customer addresses and never calls back. If the customer service is down, shipping keeps working with its copy. But that copy lags behind the source by however long delivery takes: for a short time after the change, shipping can still hold the old address.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Event',
              definition:
                'A record of something that has already happened, named in the past tense, published without expecting a particular receiver to act.',
            },
            {
              term: 'Command',
              definition:
                'A request for a specific receiver to do something; the receiver may refuse or fail.',
            },
            {
              term: 'Event-carried state transfer',
              definition:
                'Events that include the changed data, so receivers maintain their own copy instead of querying the source.',
            },
            {
              term: 'Event sourcing',
              definition:
                'Storing every change as an event and treating that sequence as the source of truth; current state is rebuilt by replaying it.',
            },
            {
              term: 'Event log',
              definition:
                'A durable, append-only, ordered record of events that readers consume at their own position and can re-read.',
            },
            {
              term: 'Partition key',
              definition:
                'The value used to choose which partition of a topic an event goes to; events with the same key land in the same partition.',
            },
          ],
        },
      ],
    },
    {
      heading: 'The event log',
      blocks: [
        {
          type: 'text',
          md: 'A typical work queue, as in the message-queue lesson, hands each message to one worker, and the message is gone once that worker acknowledges it. That is right for jobs. Events usually have **many** interested readers, some of which do not exist yet, so event-driven systems often use an **event log** instead. Apache Kafka is the best-known one, and its documentation describes the key properties:\n\n- Events are organized and **durably stored** in **topics**. A topic can have many producers and many subscribers.\n- Events are **not deleted when read**. They can be read as often as needed, and each topic has a configurable **retention** period after which old events are discarded. A new service can start from the oldest retained event and rebuild its state.\n- Each topic is split into **partitions** spread across brokers, so reads and writes can run in parallel.\n- Events with the **same key** go to the **same partition**, and readers of a partition get its events in **exactly the order they were written**. There is no such promise across partitions.\n\nThe last point drives a key design decision. If all events about one order must be handled in order (`OrderPlaced` before `OrderCancelled`), use the **order id as the key**. Events for different orders can still be processed in parallel on different partitions.',
        },
        {
          type: 'diagram',
          caption:
            'Checkout records the order and its event together; a relay appends the event to a log, and each subscriber reads it independently at its own pace.',
          nodes: [
            { id: 'u', label: 'Shopper', kind: 'client', col: 0, row: 2 },
            {
              id: 'co',
              label: 'Checkout service',
              kind: 'service',
              col: 1,
              row: 2,
            },
            {
              id: 'odb',
              label: 'Orders DB + outbox',
              kind: 'store',
              col: 1,
              row: 4,
            },
            {
              id: 'log',
              label: 'Order events log',
              kind: 'queue',
              col: 2,
              row: 2,
            },
            {
              id: 'em',
              label: 'Email service',
              kind: 'service',
              col: 3,
              row: 1,
            },
            { id: 'an', label: 'Analytics', kind: 'service', col: 3, row: 2 },
            {
              id: 'lo',
              label: 'Loyalty service',
              kind: 'service',
              col: 3,
              row: 3,
            },
            { id: 'ldb', label: 'Loyalty DB', kind: 'store', col: 4, row: 3 },
          ],
          edges: [
            { from: 'u', to: 'co', label: 'place order' },
            { from: 'co', to: 'odb', label: 'order + event row' },
            { from: 'odb', to: 'log', label: 'relay publishes', dashed: true },
            { from: 'log', to: 'em', label: 'OrderPlaced', dashed: true },
            { from: 'log', to: 'an', label: 'OrderPlaced', dashed: true },
            { from: 'log', to: 'lo', label: 'OrderPlaced', dashed: true },
            { from: 'lo', to: 'ldb', label: 'add points' },
          ],
        },
      ],
    },
  ],
  application: {
    heading: 'Running an event-driven system',
    blocks: [
      {
        type: 'text',
        md: 'Event-driven designs work well where many independent consumers care about the same facts: order pipelines, notifications, search indexing, analytics, audit trails. Making them reliable takes a handful of habits:\n\n- **Publish atomically with the state change.** If a service updates its database and then publishes, a crash between the two loses the event. The **transactional outbox** writes the event to a table in the same local transaction; a relay publishes it afterwards.\n- **Expect duplicates.** The outbox relay can publish an event twice (for example, if it crashes after publishing but before marking the row sent), and brokers can redeliver. Consumers must be **idempotent**, for instance by recording the ids of events already processed. The idempotency lesson covers this in depth.\n- **Choose keys for the ordering you need.** Ordering exists only within a partition, so key by the entity whose events must stay in order.\n- **Treat event schemas as a public API.** Every subscriber depends on the event\'s fields and meaning. Add fields rather than renaming or removing them, and version breaking changes.\n- **Make the flow visible.** Fowler notes that with event notification the end-to-end flow is not written down anywhere in the code; often the only way to see it is to watch the live system. Tracing an id across services, and documenting who subscribes to what, helps.\n\n**Limits.** Copies built from events are eventually consistent: a user who changes an address and immediately opens a page served from another service\'s copy may see the old one. Events are a poor fit when the caller needs an answer now ("was my payment accepted?"); that is a request-response call. And event sourcing brings its own costs, such as replaying events that depended on external systems and evolving old event formats, so adopt it for a reason, not by default.',
      },
    ],
  },
  misconceptions: [
    {
      claim: '"Event-driven" is one well-defined architecture.',
      correction:
        'Fowler shows the term covers different patterns: event notification, event-carried state transfer, event sourcing, and often CQRS alongside. They have different benefits and costs, so say which one you mean.',
    },
    {
      claim: 'Kafka keeps all events in a topic in one global order.',
      correction:
        'Kafka guarantees order only within a partition. Events with the same key go to the same partition, so choose a key (such as an order id) for the events that must stay in order.',
    },
    {
      claim: 'Publishing events removes coupling between services.',
      correction:
        'Services no longer call each other directly, but every consumer depends on the event’s name, fields and meaning. Changing an event can break consumers the producer does not even know about.',
    },
  ],
  questions: [
    {
      id: 'sd-event-driven-architecture-q1',
      objective: 'sd-event-driven-architecture-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'Which of these is an event rather than a command?',
      options: [
        {
          id: 'a',
          text: '`SendReceiptEmail` for order 1042',
          explanation:
            'This asks a specific receiver to do something, which makes it a command.',
        },
        {
          id: 'b',
          text: '`ReserveStock` for order 1042',
          explanation:
            'This is a request for the inventory service to act, and it could refuse, so it is a command.',
        },
        {
          id: 'c',
          text: '`ChargeCard` for order 1042',
          explanation:
            'This directs the payment service to take an action that may fail, so it is a command.',
        },
        {
          id: 'd',
          text: '`OrderPlaced` for order 1042',
          explanation:
            'Correct. It records a fact that already happened, in the past tense, without directing any particular receiver.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-event-driven-architecture-q2',
      objective: 'sd-event-driven-architecture-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A team switches from event notification to event-carried state transfer. Which benefit do they gain?',
      options: [
        {
          id: 'a',
          text: 'Consumers always see exactly the same data as the source at all times',
          explanation:
            'The opposite: consumers hold copies that lag behind the source, so they are only eventually consistent.',
        },
        {
          id: 'b',
          text: 'Consumers keep working from their own copy even when the source is down',
          explanation:
            'Correct. Because each event carries the data, consumers do not need to call back to the source, so its outages and latency matter less.',
        },
        {
          id: 'c',
          text: 'Less data is stored overall, because consumers no longer keep copies',
          explanation:
            'Event-carried state transfer increases duplication: each consumer stores the data it needs.',
        },
        {
          id: 'd',
          text: 'Events can no longer be delivered more than once to a consumer',
          explanation:
            'The event’s contents do not change delivery semantics; duplicates are still possible and consumers still need to handle them.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-event-driven-architecture-q3',
      objective: 'sd-event-driven-architecture-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'In an event-sourced system, what is the source of truth?',
      options: [
        {
          id: 'a',
          text: 'The stored sequence of events; current state is derived by replaying it',
          explanation:
            'Correct. Event sourcing records every change as an event, and any current or past state can be rebuilt from that sequence.',
        },
        {
          id: 'b',
          text: 'A table of current state, with events kept only as a debug log',
          explanation:
            'That is an ordinary database with an audit log. In event sourcing the events are primary and state is derived from them.',
        },
        {
          id: 'c',
          text: 'The message broker’s in-flight queue of events not yet consumed',
          explanation:
            'In-flight messages are transient. Event sourcing needs a permanent store of all events.',
        },
        {
          id: 'd',
          text: 'Whichever consumer’s copy of the data was updated most recently',
          explanation:
            'Consumer copies are derived views and can lag. They are not the record of truth.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-event-driven-architecture-q4',
      objective: 'sd-event-driven-architecture-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'In Kafka, what happens to an event after a consumer reads it?',
      options: [
        {
          id: 'a',
          text: 'It is deleted, so no other consumer can read it',
          explanation:
            'That describes a typical work queue. Kafka does not delete events when they are read.',
        },
        {
          id: 'b',
          text: 'It moves to a separate archive topic for that consumer',
          explanation:
            'Kafka does not move events per consumer. The event stays where it is in its partition.',
        },
        {
          id: 'c',
          text: 'It stays in the topic until its retention period ends, readable again',
          explanation:
            'Correct. Events are durably stored and can be read as often as needed until the topic’s configured retention discards them.',
        },
        {
          id: 'd',
          text: 'It stays only until every subscribed consumer has read it once',
          explanation:
            'Retention is set per topic, not by how many consumers have read an event.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-event-driven-architecture-q5',
      objective: 'sd-event-driven-architecture-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A Kafka topic with 12 partitions carries order events. Each order’s events (placed, paid, cancelled) must be processed in the order they were written. How should producers choose the key?',
      options: [
        {
          id: 'a',
          text: 'Use the order id as the key, so each order’s events share one partition',
          explanation:
            'Correct. Same key means same partition, and order is guaranteed within a partition. Different orders still spread across partitions for parallelism.',
        },
        {
          id: 'b',
          text: 'Use the event type as the key, so all "paid" events stay together',
          explanation:
            'This puts one order’s "placed" and "paid" events in different partitions, where no relative order is guaranteed.',
        },
        {
          id: 'c',
          text: 'Use the event timestamp as the key, so events are sorted by time',
          explanation:
            'Different timestamps hash to different partitions, scattering an order’s events. Keys choose partitions; they do not sort events.',
        },
        {
          id: 'd',
          text: 'Send events without a key so they are spread evenly across partitions',
          explanation:
            'Spreading one order’s events across partitions gives up the per-partition ordering guarantee that this requirement needs.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-event-driven-architecture-q6',
      objective: 'sd-event-driven-architecture-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A new fraud service launches today and needs the last 7 days of order events to build its initial state. The order-events topic has a 14-day retention period. What is the simplest way to give it that history?',
      options: [
        {
          id: 'a',
          text: 'Ask the order service to republish every order from the past 7 days',
          explanation:
            'This changes the producer and floods every other subscriber with duplicate events, when the events are already stored.',
        },
        {
          id: 'b',
          text: 'Copy the order service’s database tables into the fraud service',
          explanation:
            'This couples the fraud service to another service’s internal schema, which the event log was meant to avoid.',
        },
        {
          id: 'c',
          text: 'It cannot be done; consumers only see events published after they subscribe',
          explanation:
            'That is true of many work queues and pub/sub systems without retention, but Kafka keeps events for the retention period.',
        },
        {
          id: 'd',
          text: 'Have the fraud service read the topic from its oldest retained event',
          explanation:
            'Correct. Events stay in the log for 14 days whether or not anyone has read them, so a new consumer can start from the beginning and catch up.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-event-driven-architecture-q7',
      objective: 'sd-event-driven-architecture-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'The loyalty service adds points when it receives `PaymentReceived`. After a crash, the same event is delivered again and the customer gets double points. What is the right fix?',
      options: [
        {
          id: 'a',
          text: 'Configure the broker so that an event is never redelivered',
          explanation:
            'Duplicates also come from the producer side, such as an outbox relay publishing twice. Consumers must cope with them regardless of broker settings.',
        },
        {
          id: 'b',
          text: 'Record processed event ids and skip any event already recorded',
          explanation:
            'Correct. This makes the consumer idempotent: processing the same event twice has the same effect as once. Recording the id in the same transaction as the points update keeps the two in step.',
        },
        {
          id: 'c',
          text: 'Switch from events to a nightly batch job that recalculates points',
          explanation:
            'This gives up the timeliness the event design was chosen for, rather than fixing the duplicate handling.',
        },
        {
          id: 'd',
          text: 'Ask the payment service to wait for loyalty to confirm before continuing',
          explanation:
            'This turns the event into a synchronous dependency, and a redelivered event would still add points twice.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-event-driven-architecture-q8',
      objective: 'sd-event-driven-architecture-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'The shipping service keeps its own copy of customer addresses, fed by `AddressChanged` events carrying the full address. A customer updates their address and, a second later, the shipping page still shows the old one. What explains this?',
      options: [
        {
          id: 'a',
          text: 'The event was lost; event logs do not store events durably',
          explanation:
            'An event log stores events durably. A brief delay is expected even when nothing is lost.',
        },
        {
          id: 'b',
          text: 'Event-carried state transfer always shows data that is a day old',
          explanation:
            'There is no fixed delay. The copy usually catches up quickly; it is just not guaranteed to be current at every instant.',
        },
        {
          id: 'c',
          text: 'The shipping copy is updated asynchronously, so it can briefly lag',
          explanation:
            'Correct. Copies built from events are eventually consistent with the source: there is a window between the change and the consumer applying the event.',
        },
        {
          id: 'd',
          text: 'The customer service must have published the event before saving',
          explanation:
            'Publishing before saving would risk announcing a change that never committed; it would not explain a delay in the shipping copy.',
        },
      ],
      answer: 'c',
    },
  ],
  scenario: {
    prompt:
      'A ride-hailing startup’s trip service currently calls four services synchronously when a trip ends: billing (charge the rider), driver payouts, rider receipts by email, and a ratings prompt. When the email provider is slow, ending a trip takes several seconds, and when payouts is down, trips cannot end at all. Redesign the end-of-trip flow with events. Cover: which event(s) you publish and what they contain, which work must still be synchronous (if any), how you publish reliably, how you key events, how consumers handle duplicates, and what users might notice as a result.',
    modelAnswer:
      "Start by separating what the user is waiting for from what can happen later.\n\n**What stays synchronous.** Ending the trip itself: the trip service records the trip as `COMPLETED` with fare details in its own database and returns to the driver's app. Charging the rider could stay synchronous if the product must show \"payment failed\" immediately, but most ride apps can charge just after the trip and handle failures afterwards, so I make billing asynchronous too.\n\n**The event.** Publish `TripCompleted` using **event-carried state transfer**: trip id, rider id, driver id, fare breakdown, currency, start and end times. Billing, payouts, receipts and ratings can then each act without calling back into the trip service, so an outage in one no longer blocks trips ending.\n\n**Publishing reliably.** Write the `TripCompleted` row to an **outbox table** in the same transaction that marks the trip completed; a relay appends it to the trip-events log. A crash can no longer leave a completed trip with no event.\n\n**Keys.** Key by **trip id**, so every event about one trip (completed, later fare adjusted, refunded) stays in one partition and is processed in order. Payouts might additionally need per-driver ordering; if so, it can maintain its own per-driver state rather than forcing the topic's key.\n\n**Duplicates.** The relay or broker can deliver an event twice. Billing must never charge twice: it records processed event ids (or uses the trip id as an idempotency key with the payment provider) in the same transaction as the charge. Receipts and ratings dedupe by trip id too, so nobody gets two emails.\n\n**What users notice.** Trips end quickly regardless of email or payouts. The receipt and the charge may arrive seconds later rather than instantly, and the driver's earnings screen, if built from a payouts copy, can briefly lag behind. A failed charge now surfaces after the trip, so billing needs its own follow-up flow (retry, then notify the rider).\n\n**Visibility.** Because the flow is no longer in one function, add tracing by trip id across services and document who subscribes to `TripCompleted`.\n\nOther designs are valid, for example keeping billing synchronous for markets that require it, or using separate events per concern, as long as the reasoning about reliability, ordering and duplicates holds.",
    checklist: [
      'Separates the work the user waits for from work that can react to an event later',
      'Defines a past-tense event and decides what data it carries (notification or state transfer)',
      'Publishes reliably with a transactional outbox or an equivalent atomic approach',
      'Chooses a key (such as trip id) for the ordering it needs, knowing order holds only per partition',
      'Makes consumers idempotent, especially billing, so duplicates cause no double charge or double email',
      'Names user-visible effects such as delayed receipts and briefly stale copies',
    ],
  },
  takeaways: [
    'An event records a fact that already happened; a command asks a specific receiver to act and can be refused.',
    'Event notification, event-carried state transfer and event sourcing are different patterns with different costs, so name the one you mean.',
    'An event log such as Kafka keeps events after they are read, until retention expires, so many consumers can read independently and new ones can replay history.',
    'Kafka orders events only within a partition, so key events by the entity whose events must stay in order.',
    'Publish with a transactional outbox, make consumers idempotent, and expect event-fed copies to lag behind the source.',
  ],
  references: [
    {
      title: 'What do you mean by "Event-Driven"?',
      publisher: 'Martin Fowler',
      url: 'https://martinfowler.com/articles/201701-event-driven.html',
      kind: 'source',
    },
    {
      title: 'Introduction',
      publisher: 'Apache Kafka Documentation',
      url: 'https://kafka.apache.org/intro',
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

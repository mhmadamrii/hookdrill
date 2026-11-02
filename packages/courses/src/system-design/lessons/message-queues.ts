import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'message-queues',
  title: 'Message Queues',
  summary:
    'Decoupling producers and consumers, delivery guarantees and backpressure.',
  minutes: 18,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-message-queues-1',
      text: 'explain how a message queue decouples producers from consumers, and decide when work belongs behind a queue instead of in a direct request.',
    },
    {
      id: 'sd-message-queues-2',
      text: 'distinguish at-most-once, at-least-once and exactly-once processing, and explain how acknowledgement timing and idempotent consumers produce each.',
    },
    {
      id: 'sd-message-queues-3',
      text: 'handle failures and overload with retries, visibility timeouts, dead-letter queues, consumer scaling and backpressure.',
    },
  ],
  concept: [
    {
      heading: 'Don’t make the user wait for the slow part',
      blocks: [
        {
          type: 'text',
          md: 'Picture a signup endpoint that creates the user row and then calls an email provider to send a welcome email before it responds. When the provider is slow, every signup is slow. When the provider is down, signups fail, even though the account itself was created fine.\n\nA **message queue** breaks that chain. The endpoint creates the user, puts a small message such as `{"type": "welcome_email", "userId": 42}` on a queue, and responds straight away. A separate **worker** takes messages off the queue and sends the emails at its own pace. If the provider is down for ten minutes, messages wait in the queue and go out when it recovers.\n\nThat one change gives you three properties:\n\n- **Decoupling in time.** The producer does not need the consumer to be up, or fast, at the moment it sends.\n- **Load levelling.** A burst of messages is absorbed by the queue and drained at a steady rate, instead of overwhelming the slow component.\n- **Independent scaling.** You can run more or fewer workers without touching the API servers.\n\nThe price is that the work is no longer done when the request returns. The user gets "we\'ll email you", not "email sent", and you now have a broker to run and failures that happen out of sight.',
        },
      ],
    },
    {
      heading: 'Producers, brokers and consumers',
      blocks: [
        {
          type: 'text',
          md: 'A **producer** sends messages to a **broker**, which stores them until a **consumer** retrieves and processes them. Two delivery patterns cover most uses:\n\n- **Work queue (point-to-point).** Several consumers read from one queue and each message goes to **one** of them. Adding consumers spreads the work. RabbitMQ queues and Amazon SQS work this way.\n- **Publish/subscribe.** Each message goes to **every** subscriber, so the billing service and the analytics service can both react to the same "order placed" message.\n\n**Log-based brokers** such as Apache Kafka combine the two. A topic is split into **partitions**, each an ordered, append-only log. Messages stay in the log after they are read, and each consumer tracks its position as an **offset**. Each consumer group gets every message (publish/subscribe between groups), while inside a group each partition is read by exactly one consumer at a time (a work queue within the group). Order is guaranteed **within** a partition, not across the whole topic.\n\nHow does the broker know a message has been handled? Through an **acknowledgement** (ack). In RabbitMQ the consumer acks a delivery; in SQS it deletes the message; in Kafka it commits its offset. Until then, the broker treats the message as possibly unprocessed. When you acknowledge decides your delivery guarantee.',
        },
        {
          type: 'diagram',
          caption:
            'A work queue. The API enqueues a job and replies immediately; workers pull jobs, call the slow email provider, and acknowledge on success. Jobs that keep failing move to a dead-letter queue.',
          nodes: [
            { id: 'users', label: 'Users', kind: 'client', col: 0, row: 2 },
            { id: 'api', label: 'API server', kind: 'service', col: 1, row: 2 },
            {
              id: 'queue',
              label: 'Email job queue',
              kind: 'queue',
              col: 2,
              row: 2,
            },
            {
              id: 'dlq',
              label: 'Dead-letter queue',
              kind: 'queue',
              col: 2,
              row: 4,
            },
            { id: 'w1', label: 'Worker 1', kind: 'service', col: 3, row: 1 },
            { id: 'w2', label: 'Worker 2', kind: 'service', col: 3, row: 3 },
            {
              id: 'email',
              label: 'Email provider',
              kind: 'external',
              col: 4,
              row: 2,
            },
          ],
          edges: [
            { from: 'users', to: 'api', label: 'sign up' },
            { from: 'api', to: 'queue', label: 'enqueue job' },
            { from: 'queue', to: 'w1', label: 'deliver' },
            { from: 'queue', to: 'w2', label: 'deliver' },
            { from: 'w1', to: 'email', label: 'send email' },
            { from: 'w2', to: 'email' },
            {
              from: 'queue',
              to: 'dlq',
              label: 'after max retries',
              dashed: true,
            },
          ],
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Producer / consumer',
              definition:
                'The component that sends messages, and the component that receives and processes them.',
            },
            {
              term: 'Broker',
              definition:
                'The server that stores messages between producers and consumers, such as RabbitMQ, Kafka or Amazon SQS.',
            },
            {
              term: 'Acknowledgement (ack)',
              definition:
                'The consumer’s signal that a message is handled, after which the broker will not deliver it again.',
            },
            {
              term: 'Idempotent operation',
              definition:
                'An operation that has the same effect whether it runs once or several times, such as “set status to paid”.',
            },
            {
              term: 'Dead-letter queue (DLQ)',
              definition:
                'A separate queue that receives messages which failed processing too many times, so they can be inspected instead of retried forever.',
            },
            {
              term: 'Backpressure',
              definition:
                'Any mechanism that slows or limits producers or deliveries when consumers cannot keep up, instead of letting work pile up without bound.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Delivery guarantees: at-most, at-least and exactly once',
      blocks: [
        {
          type: 'text',
          md: "A consumer can crash at any moment: before processing, during it, or after processing but before acknowledging. The order of **process** and **acknowledge** decides what happens next.\n\n- **At-most-once:** acknowledge first, then process. If the consumer crashes mid-way, the broker already considers the message done, so it is **lost**. It is never processed twice. RabbitMQ's automatic acknowledgement mode, where a message counts as delivered as soon as it is sent, behaves this way.\n- **At-least-once:** process first, then acknowledge. If the consumer crashes after processing but before acking, the broker delivers the message again, so it is **never lost but may be processed more than once**. This is the common default: Kafka's documentation states it guarantees at-least-once delivery by default, SQS standard queues guarantee at-least-once delivery and may occasionally deliver duplicates, and RabbitMQ requeues unacknowledged messages when a consumer's connection closes.\n- **Exactly-once:** each message's effect happens once. Brokers can provide this only within their own boundary. Kafka, for example, uses transactions so that reading from Kafka, processing, and writing results back to Kafka happen exactly once. As soon as the effect is outside the broker (sending an email, charging a card, writing to your database), the broker cannot make it exactly-once on its own; Kafka's documentation notes that exactly-once for other systems needs their cooperation.\n\nIn practice, \"exactly-once\" processing in an app is built as **at-least-once delivery plus an idempotent consumer**. The consumer makes duplicates harmless, for example by recording each processed message ID under a unique constraint and skipping IDs it has already seen, by using upserts instead of inserts, or by passing an idempotency key to an external API. The later lesson on idempotency goes deeper.",
        },
        {
          type: 'example',
          title: 'Making the welcome email safe to retry',
          md: 'The email worker uses at-least-once processing: send the email, then ack. One day a worker sends an email and is killed before its ack. The broker redelivers the message, and the user gets two welcome emails.\n\nThe fix is a table `sent_emails(message_id PRIMARY KEY)`:\n\n1. On receiving a message, try `INSERT INTO sent_emails (message_id) VALUES (...)`.\n2. If the insert fails on the unique key, this message was already handled: ack it and stop.\n3. Otherwise send the email, then ack.\n\nA narrow gap remains, because the insert and the send are two separate steps. Recording before sending means a crash in between skips the email; recording after sending means a crash in between sends it twice. If the email provider accepts an idempotency key, passing the message ID closes the gap; otherwise, choose the failure you can live with. Either way, the starting assumption is the same: **every message can arrive twice.**',
        },
      ],
    },
    {
      heading: 'Failures, overload and ordering',
      blocks: [
        {
          type: 'text',
          md: "**Retries and timeouts.** In SQS, a received message is not removed; it is hidden for a **visibility timeout** (30 seconds by default). If the consumer deletes it in time, it is gone. If not, because the worker crashed or was too slow, it becomes visible and another worker gets it. Set the timeout shorter than your real processing time and healthy, slow jobs get processed twice; set it far longer and crashed jobs wait a long time before a retry. Long jobs can extend their own timeout while they work.\n\n**Poison messages.** A message that always fails (malformed data, a bug for one edge case) would be retried forever, wasting workers. A **dead-letter queue** catches it: in SQS, a redrive policy moves a message to the DLQ after it has been received `maxReceiveCount` times without being deleted. Alert on anything arriving there.\n\n**Backpressure.** A queue absorbs bursts, but it cannot fix a consumer that is slower than producers **on average**: the backlog grows without end, and the oldest message gets older. Watch queue depth and the age of the oldest message. Responses include:\n\n- adding consumers, if whatever they write to can take the extra load;\n- limiting how much each consumer takes at once (RabbitMQ's prefetch limit caps unacknowledged deliveries per channel);\n- bounding the queue and slowing or rejecting producers when it is full, so the pressure reaches the source instead of piling up.\n\n**Ordering.** Do not assume messages arrive in the order sent. SQS standard queues make only a best-effort attempt at ordering; FIFO queues keep order within a message group; Kafka keeps order within a partition. With several consumers, and with retries, messages can be *processed* out of order even when they were delivered in order.",
        },
        {
          type: 'note',
          md: 'Real-world examples: Kafka for high-volume event streams that several services read independently; RabbitMQ for flexible routing of tasks to worker pools; managed queues such as Amazon SQS when you want no broker to operate.',
        },
      ],
    },
  ],
  application: {
    heading: 'Queues in a real checkout flow',
    blocks: [
      {
        type: 'text',
        md: 'An online store\'s checkout does the essential work in the request: validate the cart, take the payment, write the order. Everything that can happen a moment later goes on a queue as an "order placed" message: the confirmation email, the invoice PDF, the warehouse notification, analytics. Each consumer acks only after its work succeeds, and each is idempotent, keyed by the order ID, so a redelivered message does not send a second email or a second warehouse request.\n\nLimits to design for:\n\n- **A queue does not make work faster.** It moves work out of the request path and smooths bursts. If consumers are slower than producers on average, the backlog grows until you add capacity or apply backpressure.\n- **Results are delayed.** Anything the user needs to see immediately (did the payment succeed?) cannot go behind a queue without a way to report status later.\n- **Duplicates and reordering are normal,** so consumers must tolerate them.\n- **Failures happen out of sight.** Without alerts on queue depth, message age and the dead-letter queue, a stuck consumer can go unnoticed for hours.\n\nThe next lessons build on this: background job systems in asynchronous processing, and event-driven architecture where services react to each other\'s events.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'A message queue guarantees each message is processed exactly once.',
      correction:
        'Common brokers default to at-least-once delivery, so duplicates happen after crashes and timeouts. Exactly-once effects in your own systems come from at-least-once delivery plus idempotent consumers.',
    },
    {
      claim: 'Adding a queue makes the system handle more load.',
      correction:
        'A queue absorbs bursts and decouples components, but throughput is still set by the consumers. If they are slower than producers on average, the backlog grows without bound.',
    },
    {
      claim: 'Messages are processed in the order they were sent.',
      correction:
        'Ordering is limited: best effort in SQS standard queues, per message group in FIFO queues, per partition in Kafka. Multiple consumers and retries can also reorder processing.',
    },
  ],
  questions: [
    {
      id: 'sd-message-queues-q1',
      objective: 'sd-message-queues-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Several workers consume from the same work queue. What happens to each message?',
      options: [
        {
          id: 'a',
          text: 'It is delivered to one of the workers, spreading the work',
          explanation:
            'Correct. In a point-to-point work queue each message goes to a single consumer, so more workers means more parallel processing.',
        },
        {
          id: 'b',
          text: 'It is delivered to every worker, so each one processes it',
          explanation:
            'That is publish/subscribe. A work queue gives each message to one consumer.',
        },
        {
          id: 'c',
          text: 'It is dropped unless a worker is connected when it is sent',
          explanation:
            'A queue stores messages until a consumer takes them; consumers do not need to be online at send time.',
        },
        {
          id: 'd',
          text: 'It goes to the worker the producer named when sending it',
          explanation:
            'Producers do not address individual consumers; the broker hands messages to whichever consumer is available.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-message-queues-q2',
      objective: 'sd-message-queues-1',
      kind: 'application',
      difficulty: 'medium',
      prompt: 'Which task is the best fit for moving behind a message queue?',
      options: [
        {
          id: 'a',
          text: 'Checking a password when the user submits the login form',
          explanation:
            'The user is waiting for the answer to continue, so the check belongs in the request.',
        },
        {
          id: 'b',
          text: 'Reading a product’s price to render the product page',
          explanation:
            'The page cannot render without the price; deferring the read only delays the response.',
        },
        {
          id: 'c',
          text: 'Generating and emailing an invoice PDF after checkout',
          explanation:
            'Correct. The user does not need it before the checkout page returns, it can be slow, and it can be retried if the email provider fails.',
        },
        {
          id: 'd',
          text: 'Validating a coupon code and showing the discounted total',
          explanation:
            'The user needs the result immediately to see the total, so it belongs in the request.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-message-queues-q3',
      objective: 'sd-message-queues-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What does at-least-once delivery guarantee?',
      options: [
        {
          id: 'a',
          text: 'Each message is processed once, with no duplicates',
          explanation: 'That describes exactly-once, a stronger guarantee.',
        },
        {
          id: 'b',
          text: 'Messages are not lost, but some may be delivered more than once',
          explanation:
            'Correct. Redelivery after a missed acknowledgement prevents loss but can create duplicates.',
        },
        {
          id: 'c',
          text: 'Messages may be lost, but none is delivered twice',
          explanation: 'That is at-most-once.',
        },
        {
          id: 'd',
          text: 'Messages arrive in exactly the order they were sent',
          explanation:
            'Delivery guarantees are about loss and duplication. Ordering is a separate property.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-message-queues-q4',
      objective: 'sd-message-queues-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A consumer acknowledges each message (or commits its offset) as soon as it receives it, then processes it. It crashes halfway through processing a message. What happens to that message?',
      options: [
        {
          id: 'a',
          text: 'The broker redelivers it, because processing did not finish',
          explanation:
            'The broker only knows about the acknowledgement, which was already sent, so it will not redeliver.',
        },
        {
          id: 'b',
          text: 'It moves to the dead-letter queue for inspection',
          explanation:
            'A message goes to a DLQ after repeated failed deliveries. This one was acknowledged and counts as done.',
        },
        {
          id: 'c',
          text: 'It is processed twice when the consumer restarts',
          explanation:
            'Duplicates come from processing before acknowledging. Acknowledging first produces the opposite failure.',
        },
        {
          id: 'd',
          text: 'It is lost: this ordering gives at-most-once processing',
          explanation:
            'Correct. Acknowledging before processing means a crash mid-way leaves the message marked done but never completed.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-message-queues-q5',
      objective: 'sd-message-queues-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A worker reads from an SQS standard queue, charges the customer’s card, then deletes the message. Occasionally a customer is charged twice. What is the best fix?',
      options: [
        {
          id: 'a',
          text: 'Delete the message before charging, so it cannot be redelivered',
          explanation:
            'That switches to at-most-once: a crash after the delete but before the charge loses the payment entirely.',
        },
        {
          id: 'b',
          text: 'Raise the visibility timeout well above the charging time',
          explanation:
            'This reduces one cause of duplicates, but standard queues can still deliver a message more than once, so double charges remain possible.',
        },
        {
          id: 'c',
          text: 'Use more workers so each message is handled sooner',
          explanation:
            'More workers do not stop redelivery; duplicates come from the delivery guarantee, not from slowness alone.',
        },
        {
          id: 'd',
          text: 'Make the charge idempotent, keyed by the order or message ID',
          explanation:
            'Correct. With at-least-once delivery, duplicates must be made harmless: record processed IDs under a unique key, or pass an idempotency key to the payment provider.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-message-queues-q6',
      objective: 'sd-message-queues-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'What is a dead-letter queue for?',
      options: [
        {
          id: 'a',
          text: 'Storing messages that were processed successfully, for auditing',
          explanation:
            'Successfully processed messages are acknowledged and removed; a DLQ holds failures.',
        },
        {
          id: 'b',
          text: 'Holding messages that failed too many times, so they can be inspected',
          explanation:
            'Correct. After a maximum number of receives, a failing message is moved aside so it stops circulating and someone can diagnose and redrive it.',
        },
        {
          id: 'c',
          text: 'Buffering messages while the main queue is full',
          explanation:
            'A DLQ is not overflow storage; it receives messages that could not be processed.',
        },
        {
          id: 'd',
          text: 'Delaying messages that should be processed at a later time',
          explanation:
            'Delayed delivery is a separate feature; a DLQ is for messages that keep failing.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-message-queues-q7',
      objective: 'sd-message-queues-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'For several hours, queue depth and the age of the oldest message have risen steadily. Producers send at a constant rate, nothing is arriving in the dead-letter queue, and every consumer is busy all the time. What is happening, and what helps?',
      options: [
        {
          id: 'a',
          text: 'Messages are expiring; increase the queue’s retention period',
          explanation:
            'Longer retention keeps the backlog around longer but does not drain it faster.',
        },
        {
          id: 'b',
          text: 'Messages are failing; lower the dead-letter queue threshold',
          explanation:
            'The DLQ is empty and consumers are busy, which points to slow throughput, not repeated failures.',
        },
        {
          id: 'c',
          text: 'Consumers are slower than producers; add capacity or apply backpressure',
          explanation:
            'Correct. A backlog that grows steadily means arrival rate exceeds processing rate. Add consumers if downstream systems can take it, make processing cheaper, or slow producers.',
        },
        {
          id: 'd',
          text: 'Messages are stuck; shorten the visibility timeout',
          explanation:
            'A shorter timeout would make in-progress messages reappear and be processed twice, adding work to already busy consumers.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-message-queues-q8',
      objective: 'sd-message-queues-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'An SQS queue’s visibility timeout is 30 seconds, but each job takes about two minutes (illustrative). Workers delete a message only after finishing. What happens?',
      options: [
        {
          id: 'a',
          text: 'Messages reappear mid-job, so other workers also process them',
          explanation:
            'Correct. Once the timeout expires the message becomes visible again and another worker can receive it, duplicating the work.',
        },
        {
          id: 'b',
          text: 'Messages are deleted from the queue after 30 seconds',
          explanation:
            'The timeout only hides a message; it is deleted only when a consumer deletes it or retention expires.',
        },
        {
          id: 'c',
          text: 'SQS stops the worker’s job when the timeout expires',
          explanation:
            'SQS has no control over the worker’s process; the job keeps running.',
        },
        {
          id: 'd',
          text: 'Every message moves to the dead-letter queue right away',
          explanation:
            'A message moves to a DLQ only after exceeding the configured maximum receive count.',
        },
      ],
      answer: 'a',
    },
  ],
  scenario: {
    prompt:
      'A photo-sharing app handles uploads synchronously: the upload request saves the original image, generates three thumbnail sizes and notifies the user’s followers before responding. Requests often time out at peak, and when the notification service is down, uploads fail. Redesign this with a message queue. Cover: what stays in the request, what the message contains, which delivery guarantee you rely on and how consumers cope with it, how failures and stuck messages are handled, and how you keep the system healthy when uploads spike.',
    modelAnswer:
      '**In the request.** Save the original image to object storage, write the photo row with status `processing`, enqueue a message, and return. The user sees the photo immediately with a "processing" state.\n\n**The message.** Small and self-contained: the photo ID and the storage path, not the image bytes. Workers fetch the image themselves.\n\n**Consumers.** Two consumers, or two queues fed by one event: a thumbnail worker and a notification worker, so a notification outage does not block thumbnails.\n\n**Delivery guarantee.** Use at-least-once: process, then acknowledge. Duplicates will happen, so each consumer is idempotent:\n\n- Thumbnails are written to deterministic paths (`thumbs/{photoId}/small.jpg`), so re-running overwrites the same files; the status update to `ready` is the same however many times it runs.\n- Notifications record `(photo_id, follower_id)` under a unique constraint, or pass an idempotency key to the push provider, so followers are not notified twice.\n\n**Failures.** Set the visibility timeout (or equivalent) above the normal thumbnail time, extending it for unusually large images. Retry with a limit, then move the message to a dead-letter queue and alert on it. A corrupt image then ends up in the DLQ instead of blocking a worker forever.\n\n**Spikes and backpressure.** The queue absorbs bursts. Scale thumbnail workers on queue depth and age of the oldest message, with a maximum set by what storage and the database can take. Cap each worker\'s in-flight messages. If the backlog keeps growing, the oldest-message age alert tells you before users notice.\n\nOther designs are valid, for example publish/subscribe with one "photo uploaded" event that several services subscribe to. A strong answer keeps only the essential work in the request, assumes duplicates, and has a plan for poison messages and backlog growth.',
    checklist: [
      'Keeps only essential work in the request and returns quickly',
      'Sends small messages (IDs and references, not large payloads)',
      'Uses at-least-once delivery with idempotent consumers, and says how each consumer is idempotent',
      'Handles repeated failures with bounded retries and a dead-letter queue',
      'Sets the visibility timeout or ack deadline relative to processing time',
      'Monitors backlog and scales or limits consumers to handle spikes',
    ],
  },
  takeaways: [
    'A message queue decouples producers and consumers in time, absorbs bursts and lets each side scale independently.',
    'Acknowledging before processing gives at-most-once (messages can be lost); processing before acknowledging gives at-least-once (messages can be duplicated).',
    'At-least-once is the common default, so consumers must be idempotent; exactly-once effects outside the broker come from that combination.',
    'Visibility timeouts, bounded retries and dead-letter queues keep slow or failing messages from being lost or retried forever.',
    'A queue does not add throughput: if consumers are slower than producers on average, the backlog grows until you add capacity or apply backpressure.',
  ],
  references: [
    {
      title: 'Design: message delivery semantics, consumer position and groups',
      publisher: 'Apache Kafka Documentation',
      url: 'https://kafka.apache.org/44/design/design/',
      kind: 'source',
    },
    {
      title: 'Consumer Acknowledgements and Publisher Confirms',
      publisher: 'RabbitMQ Documentation',
      url: 'https://www.rabbitmq.com/docs/confirms',
      kind: 'source',
    },
    {
      title: 'Amazon SQS standard queues',
      publisher: 'Amazon SQS Developer Guide',
      url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html',
      kind: 'source',
    },
    {
      title: 'Amazon SQS visibility timeout',
      publisher: 'Amazon SQS Developer Guide',
      url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html',
      kind: 'source',
    },
    {
      title: 'Using dead-letter queues in Amazon SQS',
      publisher: 'Amazon SQS Developer Guide',
      url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}

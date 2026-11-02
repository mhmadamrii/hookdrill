import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'async-processing',
  title: 'Asynchronous Processing',
  summary:
    'Slow work does not belong in the request path. The API records a job, puts it on a queue and answers 202 Accepted; background workers do the work, retry failures, and park messages that keep failing in a dead-letter queue. Clients check a status endpoint for the result.',
  minutes: 17,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-async-processing-1',
      text: 'decide which work belongs outside the request path, and describe the flow from request to queued job to 202 Accepted to worker.',
    },
    {
      id: 'sd-async-processing-2',
      text: 'explain how workers survive failure with at-least-once delivery, visibility timeouts, retries with backoff and dead-letter queues, and why job handlers must be idempotent.',
    },
    {
      id: 'sd-async-processing-3',
      text: 'design how clients learn a job’s result and how the worker pool is sized against backlog and downstream limits.',
    },
  ],
  concept: [
    {
      heading: 'Keep the user out of the waiting room',
      blocks: [
        {
          type: 'text',
          md: 'Some work is slow: generating a PDF of a year’s invoices, transcoding a video, sending a few thousand emails, calling a third-party API that sometimes takes many seconds. If the request handler does that work before responding, three things go wrong:\n\n- The **user waits**, and the browser, load balancer or proxy may time out before the work finishes.\n- A **server thread or connection is held** the whole time, so a handful of slow requests can use up capacity meant for fast ones.\n- A **failure halfway** leaves the user with an error and no clear idea what was done.\n\nThe fix is to split "accept the request" from "do the work". The request handler checks the input, records that the work is wanted, puts a message on a **queue**, and responds straight away. **Workers**, separate processes that read from the queue, do the slow part in the background.\n\nMessage Queues introduced producers, consumers and delivery guarantees. This lesson is about using them for background jobs: what to move off the request path, how to make workers reliable, and how the client finds out what happened.',
        },
      ],
    },
    {
      heading: 'The job pattern, step by step',
      blocks: [
        {
          type: 'text',
          md: "**The happy path**\n\n1. The client sends `POST /exports`.\n2. The API validates the request and inserts a **job record** (`id`, `status = pending`, inputs, owner) in the database.\n3. The API **enqueues a message** containing the job id.\n4. The API responds **`202 Accepted`** with the job id and a status URL such as `/exports/123`. MDN describes 202 as **non-committal**: the request was accepted for processing, which may not have started, and may still fail.\n5. A worker receives the message, loads the job, does the work, stores the result (for example a file in object storage), sets `status = done`, and **deletes the message** from the queue.\n6. The client polls the status URL, or is notified by email, push message or webhook, and fetches the result.\n\n**When a worker fails.** Amazon SQS shows how a typical queue handles this. A received message stays in the queue but is hidden from other consumers for the **visibility timeout** (30 seconds by default, adjustable). If the worker deletes it in time, it is gone. If the worker crashes, or is simply too slow, the message **becomes visible again** and another worker can receive it. Nothing is lost, but the same message can be processed **more than once**. SQS standard queues are **at-least-once**: AWS states a message may be delivered more than once even within the visibility timeout.\n\nThree consequences follow:\n\n- **Handlers must be idempotent:** running a job twice must have the same effect as running it once. Check and set the job status with a conditional update (`UPDATE jobs SET status = 'running' WHERE id = 123 AND status = 'pending'`), or record a deduplication key before side effects such as charging a card. The Idempotency lesson goes deeper.\n- **The visibility timeout must exceed the job time**, or the worker must extend it while it works (a heartbeat). Otherwise a second worker picks up a job the first is still running.\n- **Some messages will never succeed** (a corrupt file, a bug). A **dead-letter queue (DLQ)** catches them: with a redrive policy, SQS moves a message to the DLQ once it has been received more than `maxReceiveCount` times, where it can be inspected and replayed after a fix.\n\nRetries should wait longer each time (**exponential backoff**) with some randomness (**jitter**), so a failing dependency is not hit by a synchronized wave of retries.",
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Background job',
              definition:
                'A unit of work recorded and queued by the request handler and carried out later by a worker process.',
            },
            {
              term: 'Worker',
              definition:
                'A process that receives messages from a queue, performs the job each describes, and acknowledges or deletes the message when done.',
            },
            {
              term: '202 Accepted',
              definition:
                'An HTTP status meaning the request was accepted for processing that has not necessarily started or finished, and may still fail.',
            },
            {
              term: 'Visibility timeout',
              definition:
                'In SQS, how long a received message stays hidden from other consumers; if not deleted in that time, it becomes visible and can be received again.',
            },
            {
              term: 'Dead-letter queue (DLQ)',
              definition:
                'A separate queue that receives messages that failed processing too many times, so they stop cycling through the main queue.',
            },
            {
              term: 'Idempotent handler',
              definition:
                'A job handler for which processing the same message twice has the same effect as processing it once.',
            },
          ],
        },
      ],
    },
    {
      heading: 'The moving parts',
      blocks: [
        {
          type: 'diagram',
          caption:
            'The API records the job and enqueues it, then answers 202 straight away. Workers pull from the queue, call slow dependencies and update the job record; messages that keep failing move to a dead-letter queue.',
          nodes: [
            { id: 'client', label: 'Client', kind: 'client', col: 0, row: 2 },
            {
              id: 'api',
              label: 'API service',
              kind: 'service',
              col: 1,
              row: 2,
            },
            { id: 'jobs', label: 'Jobs table', kind: 'store', col: 2, row: 4 },
            { id: 'queue', label: 'Job queue', kind: 'queue', col: 2, row: 2 },
            {
              id: 'workers',
              label: 'Worker pool',
              kind: 'service',
              col: 3,
              row: 2,
            },
            {
              id: 'email',
              label: 'Email provider',
              kind: 'external',
              col: 4,
              row: 1,
            },
            {
              id: 'dlq',
              label: 'Dead-letter queue',
              kind: 'queue',
              col: 3,
              row: 0,
            },
          ],
          edges: [
            { from: 'client', to: 'api', label: 'POST, gets 202 + id' },
            { from: 'api', to: 'jobs', label: 'insert pending' },
            { from: 'api', to: 'queue', label: 'enqueue job id' },
            { from: 'queue', to: 'workers', label: 'receive' },
            { from: 'workers', to: 'email', label: 'send' },
            { from: 'workers', to: 'jobs', label: 'mark done / failed' },
            {
              from: 'queue',
              to: 'dlq',
              label: 'after max receives',
              dashed: true,
            },
          ],
        },
        {
          type: 'example',
          title: 'Thumbnails for uploaded photos',
          md: 'A user uploads a photo. The request handler stores the original, inserts a job row `{ photoId: 88, status: pending }`, enqueues `{ jobId: 501 }`, and returns 202 with `/jobs/501`. The page shows a placeholder.\n\nA worker receives the message and resizes the photo into three sizes. It writes them under keys derived from the photo id (`thumbs/88/small.jpg` and so on), so if the job runs twice, the second run overwrites the same keys with the same images instead of creating duplicates. It then marks job 501 done and deletes the message.\n\nIf the worker crashes halfway, the message reappears after the visibility timeout and another worker redoes the job; the deterministic keys make that safe. If the original file is corrupt, every attempt fails; after `maxReceiveCount` receives the message moves to the DLQ, an alert fires, and the job is marked failed so the user sees an error instead of an endless spinner.',
        },
      ],
    },
    {
      heading: 'Where you meet this pattern',
      blocks: [
        {
          type: 'text',
          md: '- **Emails and notifications:** sign-up confirmations, receipts and digests are almost always sent by workers, so a slow or failing email provider never delays a page.\n- **Media processing:** image resizing and video transcoding run on worker fleets that read originals from object storage and write results back.\n- **Exports and reports:** large CSV or PDF exports return 202 and a status URL; the finished file is offered as a download link. MDN’s 202 example follows this shape, returning a task id and a URL to monitor.\n- **Calls to slow third parties:** payment confirmations, webhook delivery to customers and data syncs are queued so they can be retried with backoff.\n- **Managed queues:** Amazon SQS provides the visibility timeout, a configurable maximum, heartbeat extension through `ChangeMessageVisibility`, and dead-letter queues with redrive. Other queues offer equivalent features under different names.',
        },
      ],
    },
  ],
  application: {
    heading: 'Running workers in production, and the costs',
    blocks: [
      {
        type: 'text',
        md: '**Sizing the pool.** Watch the backlog: how many messages are waiting and how old the oldest one is (SQS reports an `ApproximateAgeOfOldestMessage` metric). If the backlog grows during peaks and drains afterwards, that may be fine; if it only grows, add workers. But workers are rarely the only limit. They share the database and call third parties with their own **rate limits**, so cap concurrency to what those dependencies accept. Adding workers past that point only produces more failures and retries.\n\n**Costs of going async:**\n\n- **The result is no longer immediate.** The product needs a pending state, a way to show progress, and a way to show failure.\n- **More moving parts.** A queue, workers, a DLQ and monitoring all have to be run and watched.\n- **Duplicates and ordering.** AWS documents that SQS standard queues can deliver more than one copy of a message and occasionally deliver messages out of order. Handlers must cope with both, or you pay for a FIFO queue where strict order matters.\n- **Two writes in the API.** Inserting the job row and enqueuing the message are separate operations. If enqueuing fails after the insert, the job is stuck as pending. A periodic sweeper that re-enqueues old pending jobs, or a pattern that writes the message in the same database transaction (covered with event-driven designs later), closes this gap.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'Once a worker has received a message, the queue will not deliver it again.',
      correction:
        'Most job queues are at-least-once. If the worker is slow or crashes before deleting the message, it becomes visible again and is redelivered, and standard SQS queues can even deliver duplicates within the visibility timeout. Handlers must be idempotent.',
    },
    {
      claim: 'A 202 Accepted response means the work was done successfully.',
      correction:
        '202 only means the request was accepted for processing. The work may not have started and can still fail, so clients need a status endpoint or a notification to learn the outcome.',
    },
    {
      claim: 'Adding more workers always drains a backlog faster.',
      correction:
        'Workers share downstream limits: database capacity and third-party rate limits. Past those limits, more workers cause more errors and retries, and the backlog can grow faster.',
    },
  ],
  questions: [
    {
      id: 'sd-async-processing-q1',
      objective: 'sd-async-processing-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which HTTP status code fits a response meaning "your request was accepted and will be processed later"?',
      options: [
        {
          id: 'a',
          text: '202 Accepted',
          explanation:
            'Correct. 202 says the request was accepted for processing that may not have started yet.',
        },
        {
          id: 'b',
          text: '201 Created',
          explanation:
            '201 means a resource has already been created, which is not true until the job finishes.',
        },
        {
          id: 'c',
          text: '204 No Content',
          explanation:
            '204 means the request succeeded and there is no body, implying the work is already done.',
        },
        {
          id: 'd',
          text: '200 OK',
          explanation:
            '200 normally carries the result of the request, which a background job does not have yet.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-async-processing-q2',
      objective: 'sd-async-processing-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'With Amazon SQS, a worker receives a message and crashes before deleting it. What happens to the message?',
      options: [
        {
          id: 'a',
          text: 'It is lost, because it was removed from the queue on delivery',
          explanation:
            'SQS keeps a received message in the queue, only hidden, until it is deleted.',
        },
        {
          id: 'b',
          text: 'It moves straight to the dead-letter queue after one failure',
          explanation:
            'A message moves to a DLQ only after exceeding maxReceiveCount, and only if a DLQ is configured.',
        },
        {
          id: 'c',
          text: 'It becomes visible after the visibility timeout and can be received again',
          explanation:
            'Correct. This is how SQS avoids losing work when a consumer fails.',
        },
        {
          id: 'd',
          text: 'SQS restarts the crashed worker and hands the message back to it',
          explanation:
            'SQS does not manage your workers. Any consumer, not only the crashed one, can receive the message next.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-async-processing-q3',
      objective: 'sd-async-processing-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Which task is the best candidate to move into a background worker?',
      options: [
        {
          id: 'a',
          text: 'Checking a user’s password when they log in',
          explanation:
            'The user cannot continue until this answer is known, and it is fast; it belongs in the request.',
        },
        {
          id: 'b',
          text: 'Building a PDF export of a year of invoices',
          explanation:
            'Correct. It is slow, the user does not need it within the same request, and the result can be fetched later.',
        },
        {
          id: 'c',
          text: 'Reading a product’s price to show on its page',
          explanation:
            'The page needs the price to render, and it is a quick read, possibly from a cache.',
        },
        {
          id: 'd',
          text: 'Validating the fields of an incoming form',
          explanation:
            'Validation should happen before accepting the request, so the user gets errors immediately.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-async-processing-q4',
      objective: 'sd-async-processing-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why must background job handlers be idempotent when the queue delivers at least once?',
      options: [
        {
          id: 'a',
          text: 'Because queues always deliver messages in a random order',
          explanation:
            'Ordering is a separate concern. Idempotency is about the same message being processed twice.',
        },
        {
          id: 'b',
          text: 'Because idempotent handlers run faster on the worker',
          explanation:
            'Idempotency is about correctness under repeats, not speed; checks can even add a little work.',
        },
        {
          id: 'c',
          text: 'Because the HTTP specification requires it for workers',
          explanation:
            'HTTP defines idempotent methods, but it says nothing about queue consumers.',
        },
        {
          id: 'd',
          text: 'Because the same message can be processed more than once',
          explanation:
            'Correct. A redelivered message must not, for example, send a second email or charge a card twice.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-async-processing-q5',
      objective: 'sd-async-processing-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'After `POST /exports` returns 202, how should the client find out when the export is ready, without holding a connection open?',
      options: [
        {
          id: 'a',
          text: 'Keep the original POST connection open until the export finishes',
          explanation:
            'This brings back the long wait and timeouts that the background job was meant to remove.',
        },
        {
          id: 'b',
          text: 'Repeat the POST every few seconds until one returns 200 OK',
          explanation:
            'Each POST would start a new export, creating duplicate jobs.',
        },
        {
          id: 'c',
          text: 'Read the jobs table in the database directly from the client',
          explanation:
            'Clients should not get direct database access; the API exposes job status instead.',
        },
        {
          id: 'd',
          text: 'Use the returned job id to poll a status URL or wait for a notification',
          explanation:
            'Correct. The client checks GET /exports/{id} or is notified, then downloads the result.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-async-processing-q6',
      objective: 'sd-async-processing-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A message refers to a corrupt image, so the worker throws an error every time it processes it. The SQS queue has no dead-letter queue. What happens, and what is the fix?',
      options: [
        {
          id: 'a',
          text: 'SQS deletes the message after three failures; add logging to see why',
          explanation:
            'SQS does not delete messages for failing. Without a DLQ it keeps redelivering them.',
        },
        {
          id: 'b',
          text: 'It is retried after every visibility timeout until it expires; add a DLQ',
          explanation:
            'Correct. It wastes worker time until the retention period ends. A DLQ with maxReceiveCount takes it out of rotation.',
        },
        {
          id: 'c',
          text: 'It blocks every other message in the standard queue until removed',
          explanation:
            'Standard queues do not block on one message; other messages are still delivered.',
        },
        {
          id: 'd',
          text: 'The worker’s exception removes it from the queue, so nothing is needed',
          explanation:
            'Only an explicit delete removes a message. An exception means it is never deleted.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-async-processing-q7',
      objective: 'sd-async-processing-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'The email backlog grows during a campaign, so you triple the workers. The email provider starts answering 429 and the backlog grows even faster. What is the best explanation and fix?',
      options: [
        {
          id: 'a',
          text: 'The queue is too small; raise its message retention period',
          explanation:
            'Retention only decides how long messages are kept, not how fast they are sent.',
        },
        {
          id: 'b',
          text: 'Workers are too slow; raise the visibility timeout on the queue',
          explanation:
            'A longer visibility timeout does not make sends succeed against a rate-limited provider.',
        },
        {
          id: 'c',
          text: 'The provider’s rate limit is the bottleneck; cap send rate and back off on 429',
          explanation:
            'Correct. Throughput is capped by the provider. Pace workers below its limit and honour Retry-After.',
        },
        {
          id: 'd',
          text: 'Async is the problem; send each email inside the original request',
          explanation:
            'The provider limit applies either way, and users would now wait on, and fail with, every send.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-async-processing-q8',
      objective: 'sd-async-processing-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Jobs take up to 5 minutes, and the SQS queue uses the default 30-second visibility timeout. What goes wrong?',
      options: [
        {
          id: 'a',
          text: 'Other workers can receive a job that is still running and process it again',
          explanation:
            'Correct. Set the timeout above the longest job or extend it with a heartbeat while working.',
        },
        {
          id: 'b',
          text: 'SQS terminates the worker process once 30 seconds have passed',
          explanation:
            'SQS has no control over your processes; it only changes the message’s visibility.',
        },
        {
          id: 'c',
          text: 'The message is moved to the dead-letter queue after 30 seconds',
          explanation:
            'A DLQ move depends on the receive count exceeding maxReceiveCount, not on elapsed time.',
        },
        {
          id: 'd',
          text: 'Nothing, because SQS locks a message until the worker deletes it',
          explanation:
            'The hiding lasts only for the visibility timeout; after that the message is visible again.',
        },
      ],
      answer: 'a',
    },
  ],
  scenario: {
    prompt:
      'An invoicing app lets customers click "Export all invoices" to get a ZIP of PDFs. Today the request handler builds every PDF and the ZIP before responding. Small customers wait a few seconds; large ones hit the load balancer’s timeout, click again, and start a second export, which slows the servers for everyone.\n\nRedesign the export as a background job. Describe the request flow and responses, how workers process jobs, what happens when a worker crashes or a job keeps failing, how duplicate clicks and duplicate deliveries are handled, and how the customer gets the file.',
    modelAnswer:
      '**Request flow.** `POST /exports` validates the user and checks for an existing pending or running export for that account. If one exists, it returns that job’s id instead of starting another, which handles the double click. Otherwise it inserts a job row (`status = pending`) and enqueues a message with the job id, then returns **202 Accepted** with the job id and `/exports/{id}`.\n\n**Workers.** A worker receives the message and moves the job from pending to running with a conditional update (only if it is still pending, or running with an expired heartbeat). It builds the PDFs and ZIP, uploads the ZIP to object storage under a key derived from the job id, sets `status = done` with the key, and deletes the message. Because the key is deterministic and the status change is conditional, a duplicate delivery either does nothing or overwrites the same file.\n\n**Timeouts and crashes.** Exports can take minutes, so the visibility timeout is set above the longest expected run, or the worker extends it periodically (heartbeat). If the worker crashes, the message reappears and another worker resumes the job.\n\n**Persistent failures.** A redrive policy moves the message to a **dead-letter queue** after a few receives (say 5). An alert fires, and the job is marked failed so the customer sees an error and can retry, instead of waiting forever. Retries inside the worker use exponential backoff with jitter.\n\n**Getting the file.** The export page polls `GET /exports/{id}` every few seconds; we also email a link when it is done. The download is a short-lived presigned URL to the ZIP in object storage, so app servers never stream the file.\n\n**Capacity.** Worker concurrency is capped so exports cannot exhaust database connections; we alert on the age of the oldest message.\n\nOther valid answers could use webhooks or server-sent events instead of polling, or split a very large export into one job per batch of invoices, as long as duplicates and failures are handled.',
    checklist: [
      'Returns 202 Accepted with a job id and status URL instead of doing the work in the request',
      'Records job state (pending, running, done, failed) that the client can query',
      'Makes processing idempotent under duplicate delivery and duplicate clicks',
      'Sets or extends the visibility timeout to cover long jobs',
      'Uses a dead-letter queue and surfaces failed jobs to the user',
      'Delivers the result without streaming it through app servers, for example a presigned download link',
    ],
  },
  takeaways: [
    'Move slow, non-essential work out of the request path: record a job, enqueue it, and answer 202 Accepted with a way to check status.',
    '202 is non-committal; the client learns the outcome later through polling or a notification.',
    'Queues such as SQS deliver at least once, so a crashed or slow worker’s message is redelivered and handlers must be idempotent.',
    'Set the visibility timeout longer than the job or extend it with a heartbeat, and use a dead-letter queue for messages that keep failing.',
    'Size the worker pool to the backlog and to downstream limits; more workers cannot beat a database or third-party rate limit.',
  ],
  references: [
    {
      title: '202 Accepted',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202',
      kind: 'source',
    },
    {
      title: 'Amazon SQS visibility timeout',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html',
      kind: 'source',
    },
    {
      title: 'Amazon SQS standard queues',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html',
      kind: 'source',
    },
    {
      title: 'Using dead-letter queues in Amazon SQS',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html',
      kind: 'source',
    },
    {
      title: 'Site Reliability Engineering, chapter 21: Handling Overload',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/handling-overload/',
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

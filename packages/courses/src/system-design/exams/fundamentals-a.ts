import type { Question } from '../../types'

export const examQuestions: Question[] = [
  {
    id: 'sd-fundamentals-x1',
    objective: 'sd-networking-basics-2',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'A team will move its web app to a new set of servers next week. Today one app server keeps logged-in sessions in its memory, and the A record has a TTL of 24 hours. Which plan best avoids users being sent to a dead address or logged out during the move?',
    options: [
      {
        id: 'a',
        text: 'Lower the TTL a day ahead, store sessions in a shared store, and keep old servers up past the TTL',
        explanation:
          'Correct. A short TTL makes the switch spread quickly, shared sessions let either set of servers recognise a user, and the old servers catch clients still using cached records.',
      },
      {
        id: 'b',
        text: 'Switch the record at a quiet hour and shut the old servers down right after the change',
        explanation:
          'Resolvers may keep the old record for up to 24 hours, so those users hit a dead address, and in-memory sessions are lost either way.',
      },
      {
        id: 'c',
        text: 'Raise the TTL to a week before the move so resolvers query DNS less during the switch',
        explanation:
          'A longer TTL makes cached copies of the old address last longer, which slows the move rather than smoothing it.',
      },
      {
        id: 'd',
        text: "Copy the old server's memory to the new servers, then switch the record and stop the old one",
        explanation:
          'Sessions created on the old server after the copy are still lost, and stopping it immediately ignores the 24-hour TTL.',
      },
    ],
    answer: 'a',
  },
  {
    id: 'sd-fundamentals-x2',
    objective: 'sd-rest-api-design-1',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      "A mobile app sends POST /v1/payments. The connection drops before a response arrives, and the app's HTTP library automatically resends the same request. What is the risk, and where must it be handled?",
    options: [
      {
        id: 'a',
        text: 'None: HTTP is stateless, so the server treats the second request as the same one',
        explanation:
          'Stateless means each request is understood on its own, which is exactly why the server cannot tell the resend is a repeat without extra information.',
      },
      {
        id: 'b',
        text: 'A second payment, since POST is not idempotent; the server must recognise repeats',
        explanation:
          'Correct. Repeating a POST can repeat its effect. Only the server can reliably detect a duplicate, because client code cannot be trusted or may crash midway.',
      },
      {
        id: 'c',
        text: 'A second payment, but switching the request to GET makes the retry harmless',
        explanation:
          'GET must be safe and must not change state. Using it to create payments breaks HTTP semantics; caches or prefetchers could trigger payments.',
      },
      {
        id: 'd',
        text: 'A timeout error only, since TCP guarantees the first request was never delivered',
        explanation:
          'TCP gives no such guarantee to the app. The server may have received and processed the request even though the response was lost.',
      },
    ],
    answer: 'b',
  },
  {
    id: 'sd-fundamentals-x3',
    objective: 'sd-rest-api-design-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'Requirements for a delivery app include: "Riders can see their order history" and "App versions up to a year old must keep working". The order history endpoint currently returns the full list. Which design best meets both requirements as the API evolves?',
    options: [
      {
        id: 'a',
        text: 'Keep the full list, and change response fields freely while the old app versions still work',
        explanation:
          'The list will grow without bound, and changing fields freely breaks the old app versions the requirement protects.',
      },
      {
        id: 'b',
        text: 'Add pagination to the existing endpoint now, and remove unused fields as the app evolves',
        explanation:
          'Adding pagination to an existing list endpoint is itself a breaking change for old clients, and removing fields breaks them too.',
      },
      {
        id: 'c',
        text: 'Ship a paged endpoint in a new major version, keep v1 running, and only add fields within a version',
        explanation:
          'Correct. Old apps keep using v1 unchanged, new apps get stable pages, and additive changes keep each version compatible.',
      },
      {
        id: 'd',
        text: 'Force every user to update the app before each release so old versions never call the API',
        explanation:
          'This contradicts the non-functional requirement that year-old versions keep working.',
      },
    ],
    answer: 'c',
  },
  {
    id: 'sd-fundamentals-x4',
    objective: 'sd-networking-basics-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      "A checkout service misses its p99 latency objective. Tracing shows that for every incoming request it opens a brand-new HTTPS connection to an internal tax service, and that most of each call's time passes before the tax service starts processing. Which change most directly addresses this?",
    options: [
      {
        id: 'a',
        text: 'Track average latency instead, since p99 is dominated by rare outliers',
        explanation:
          'Changing the measurement hides the problem rather than fixing it, and the slow tail is real time that users experience.',
      },
      {
        id: 'b',
        text: 'Lower the DNS TTL for the tax service so lookups return faster',
        explanation:
          'A lower TTL causes more lookups, not faster ones. The time is going to connection setup, which TTL does not affect.',
      },
      {
        id: 'c',
        text: 'Switch the call from POST to PUT so the request can be retried',
        explanation:
          'The method changes retry semantics, not connection setup cost; it does nothing for the handshake time.',
      },
      {
        id: 'd',
        text: 'Reuse connections from a pool so each call skips TCP and TLS setup',
        explanation:
          'Correct. A new HTTPS connection costs a TCP handshake plus a TLS handshake before any request is sent; reused connections pay that once.',
      },
    ],
    answer: 'd',
  },
]

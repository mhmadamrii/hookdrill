import type { Question } from '../../types'

export const examQuestions: Question[] = [
  {
    id: 'sd-distributed-systems-x5',
    objective: 'sd-idempotency-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'A mobile client retries `POST /orders` on timeout, using capped exponential backoff with jitter. After a network incident, support finds customers with duplicate orders. Which change stops the duplicates?',
    options: [
      {
        id: 'a',
        text: 'Add more jitter so the retries are spread out further in time',
        explanation:
          'Jitter spreads retry load over time. A retry that arrives later still creates a second order if the first one succeeded.',
      },
      {
        id: 'b',
        text: 'Remove the client timeout so it waits for every single response',
        explanation:
          'Responses can still be lost, and the client then hangs forever. Without timeouts a slow server also ties up client resources.',
      },
      {
        id: 'c',
        text: 'Send one idempotency key per order on every retry, and dedupe on it',
        explanation:
          'Correct. Backoff controls when retries happen; only an idempotency key lets the server recognise a retry and avoid creating the order twice.',
      },
      {
        id: 'd',
        text: 'Put a circuit breaker on the client so it stops calling when failing',
        explanation:
          'A breaker cuts retries while the server is failing, but any retry that does go through after a lost response still duplicates the order.',
      },
    ],
    answer: 'c',
  },
  {
    id: 'sd-distributed-systems-x6',
    objective: 'sd-multi-region-architecture-3',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'A payment API runs active-passive across two regions with asynchronous database replication; idempotency key records live in the same database as payments. The primary region processes a payment, the response is lost, and the region fails. The client retries with the same key against the newly promoted region. What is the remaining risk?',
    options: [
      {
        id: 'a',
        text: 'The key record may not have replicated yet, so the payment may run again',
        explanation:
          'Correct. Key records are subject to the same replication lag as other data. Passing a key to the payment provider as well gives a second, independent check.',
      },
      {
        id: 'b',
        text: 'None, because idempotency keys guarantee exactly-once across regions',
        explanation:
          'A key only helps where its record exists. If the record was lost with unreplicated writes, the new region has never seen it.',
      },
      {
        id: 'c',
        text: 'The new region rejects the request because the key came from elsewhere',
        explanation:
          'Keys are not tied to a region; the new region simply looks the key up in its own copy of the data.',
      },
      {
        id: 'd',
        text: 'The client must make a new key for the new region, doubling the charge',
        explanation:
          'The client should reuse the same key; a new key would make the retry look like a new payment. The real risk comes from replication lag.',
      },
    ],
    answer: 'a',
  },
  {
    id: 'sd-distributed-systems-x7',
    objective: 'sd-service-discovery-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      "One instance of a service deadlocks: the process is alive and accepts TCP connections, but never answers requests. The registry's health check only tests that the port is open, and callers set no timeouts. Callers' threads pile up waiting on that instance. Which pair of changes addresses this best?",
    options: [
      {
        id: 'a',
        text: 'Larger caller thread pools and a longer DNS TTL for the service',
        explanation:
          'More threads only delay the pile-up, and a longer TTL makes discovery slower to react, not faster.',
      },
      {
        id: 'b',
        text: 'A liveness probe that checks the same open port, plus retries',
        explanation:
          'The port is open, so this probe still passes. Retries without timeouts never start, because the first call never returns.',
      },
      {
        id: 'c',
        text: 'Switching from server-side to client-side discovery for this service',
        explanation:
          'Client-side discovery reads the same health data, so it would keep choosing the deadlocked instance.',
      },
      {
        id: 'd',
        text: 'A health check that exercises a real request, plus caller timeouts',
        explanation:
          'Correct. A meaningful check removes the stuck instance from the registry, and timeouts stop callers waiting forever in the meantime.',
      },
    ],
    answer: 'd',
  },
  {
    id: 'sd-distributed-systems-x8',
    objective: 'sd-fault-tolerance-2',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'A region fails and the global router sends all users to the surviving region, which starts returning errors under the extra load. Clients retry failed calls. What best keeps the surviving region from collapsing while it scales up?',
    options: [
      {
        id: 'a',
        text: 'Have clients retry at once so failed requests are served sooner',
        explanation:
          'Immediate retries add load to an overloaded region and can keep it overloaded, turning a capacity problem into a cascading failure.',
      },
      {
        id: 'b',
        text: 'Cap retries with jittered backoff and shed excess load meanwhile',
        explanation:
          'Correct. Retry limits and backoff stop retries from multiplying load, and load shedding lets the region serve some requests well instead of failing all of them.',
      },
      {
        id: 'c',
        text: 'Lower the DNS TTL to zero so that clients can switch regions faster',
        explanation:
          'Clients have already moved to the surviving region; faster switching does nothing about its overload.',
      },
      {
        id: 'd',
        text: 'Send half the traffic back to the failed region to split the load',
        explanation:
          'The failed region cannot serve requests, so traffic sent there simply fails.',
      },
    ],
    answer: 'b',
  },
]

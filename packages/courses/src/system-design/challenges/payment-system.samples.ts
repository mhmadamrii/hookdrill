import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'payment-pass-relational-ledger',
    label:
      'Strong: state machine plus a double-entry ledger in a relational database',
    expect: 'pass',
    note: 'Correct end to end: explicit state machine with an UNKNOWN state, idempotency from caller to PSP, status lookup before any retry, balanced immutable journal entries in integer minor units written in the same transaction as state changes, hot-account handling, payouts with a unique per-cycle record and bank references, and real reconciliation. Capacity math is right.',
    answers: {
      functional:
        'Authorize at checkout, capture on shipment (full or partial), void uncaptured authorizations, refund captured payments fully or partially, show merchants pending and available balances, pay out available balances daily by bank transfer, and reconcile daily against the PSP settlement file and the bank statement. Callers get webhooks on status changes. Out of scope: fraud scoring (we call the risk service), FX, the checkout UI, and chargebacks beyond recording them as ledger entries when the PSP reports them.',
      nonFunctional:
        'Correctness first: exactly-once money effect through idempotent processing, and every ledger entry balances. Payment API p99 < 500 ms excluding PSP time, 99.99% availability for accepting payments. No acknowledged write may be lost (RPO 0), failover within minutes. Records are immutable and kept 10 years. PCI: we only ever see PSP tokens; card numbers never enter our systems or logs, which keeps us out of the cardholder data environment.',
      capacity:
        'Average: 2M / 86,400 = about 23 payments/s; daily peak 10x = about 230/s; holiday design target 500/s. Each payment has 3-4 API calls over its life (authorize, capture, maybe refund), so about 1,500-2,000 state transitions/s at the holiday peak. Postings: 4 per capture, so 8M/day, about 2,000/s at 500 payments/s. Storage: a payment row plus its state history is about 1 KB, a posting about 200 B, so 2 GB + 1.6 GB = about 3.6 GB/day, about 1.3 TB/year, about 13 TB over 10 years, roughly double that with indexes. Conclusion: a single well-provisioned relational primary handles the write rate; we partition tables by month and move old partitions to cheaper storage, and the real risk is lock contention on hot accounts, not volume.',
      api: 'POST /payments {orderId, merchantId, amount, currency, pspToken} with Idempotency-Key header; returns 201 {paymentId, status}. Repeating the same key and body returns the stored response; same key with a different body returns 422. POST /payments/{id}/capture {amount}, POST /payments/{id}/void, POST /payments/{id}/refunds {amount} each also take an Idempotency-Key. GET /payments/{id}. GET /merchants/{id}/balance. Status changes are delivered to the order service by signed webhooks with event ids, retried with backoff, and can also be read from GET /payments/{id}/events. Errors: 402 declined, 409 invalid state transition, 202 with status=PENDING when the PSP outcome is unknown.',
      database:
        'PostgreSQL with serializable or carefully locked transactions. Tables: idempotency_keys(key, caller, request_hash, response, UNIQUE(key, caller)); payments(id, status, amount_minor BIGINT, currency, psp_reference, version); payment_events (append-only history); accounts(id, owner, type: merchant_pending | merchant_available | platform_fee | psp_receivable | psp_fee_expense | bank_cash | payouts_in_transit); journal_entries(id, operation_key UNIQUE, created_at); postings(entry_id, account_id, amount_minor signed). A trigger or the write path rejects any entry whose postings do not sum to zero per currency; there are no UPDATE or DELETE grants on postings. Example capture of 100.00 with a 10% marketplace fee: psp_receivable +10000, merchant_pending -9000, platform_fee -1000. Partial refund of 30.00: merchant_pending +2700, platform_fee +300, psp_receivable -3000 (if the funds have already matured, the merchant leg debits merchant_available instead, and can take it negative for recovery from the next payout). Merchant balances are a balance column updated in the same transaction as the postings, with row locks; platform accounts receive postings without a stored balance row (balance derived by summing), so the fee account is never a lock hot spot.',
      architecture:
        '1. API gateway authenticates the caller and forwards to the payment service. 2. Payment service inserts the idempotency key (unique) and the payment in CREATED, then calls the risk service. 3. It moves to AUTHORIZING and calls the PSP adapter outside any DB transaction, passing a deterministic PSP idempotency key derived from paymentId + operation. 4. On a definite answer it moves to AUTHORIZED or FAILED; on a timeout it moves to UNKNOWN and returns 202. 5. Capture follows the same pattern; on CAPTURED it writes the journal entry in the same DB transaction as the state change, plus an outbox row for the status webhook. 6. A webhook ingester verifies PSP signatures, deduplicates by PSP event id, and applies only valid transitions (a late AUTHORIZED after CAPTURED is ignored). 7. A daily payout job moves matured pending funds to available and creates payouts. 8. A reconciliation job imports the PSP settlement file and the bank statement and matches line by line.',
      scalability:
        'Stateless payment service instances scale horizontally behind the load balancer; the PSP adapter has a bounded connection pool and a circuit breaker per PSP. The database primary has a synchronous standby in another zone for RPO 0 and async read replicas for balance pages, reporting and reconciliation queries. Payouts are processed in batches by merchant id range across workers, each claiming a range with a lease. If writes ever outgrow one primary, the ledger can be sharded by merchant id because almost all postings touch one merchant plus platform accounts, which are derived and can live on every shard as sub-accounts summed for reporting.',
      failures:
        'PSP timeout: the payment is UNKNOWN; a resolver queries the PSP status endpoint by our idempotency key with backoff, and only if the PSP reports no such operation do we retry with the same key, so the PSP itself dedupes. Duplicate or out-of-order webhooks are deduped by event id and rejected if the transition is invalid. Payouts: each merchant gets at most one payout row per cycle (UNIQUE(merchant_id, cycle_date)); the payout posts merchant_available -> payouts_in_transit before calling the bank with the payout id as the reference, and on a bank timeout we look the reference up instead of resending, so a crash halfway through 60,000 transfers just resumes the remaining rows. Reconciliation: any PSP settlement line or bank line with no match, or an amount mismatch, opens a case for finance and is corrected with a new adjusting entry, never an edit. Primary failure: promote the synchronous standby; payment intake returns 503 for that minute rather than accept payments it cannot record.',
      tradeoffs:
        'One relational database with ACID transactions keeps state, idempotency and postings atomic, which is the simplest way to be correct; the cost is a vertical-scaling ceiling, which the numbers show is far off, and an eventual sharding project. Failing closed when the database is down costs some availability but avoids taking money we cannot account for. Returning 202 on unknown PSP outcomes makes callers handle a pending state, but guessing either way risks double charges or lost sales. Stored merchant balances are fast to read but must be updated in the same transaction as postings; derived platform balances avoid hot-row contention at the cost of slower reporting queries. A single PSP keeps semantics simple; adding a second for failover is deferred because routing a retry to a different PSP after an unknown outcome could charge twice.',
    },
  },
  {
    id: 'payment-pass-event-sourced',
    label: 'Strong: event-sourced ledger on a partitioned append-only log',
    expect: 'pass',
    note: 'A genuinely different valid design: journal entries are balanced, immutable events on a log partitioned by merchant with a single writer per partition that enforces idempotency and balance checks, and balances are projections rebuilt by replay. Orchestration uses a durable workflow. It must score well despite not using a relational ledger.',
    answers: {
      functional:
        'Payments lifecycle (authorize, capture, void, refund), a ledger that records every movement, merchant balance views, daily payouts, and daily reconciliation with the PSP and the bank. Callers retry safely using idempotency keys and subscribe to status events. Not covered: fraud logic, FX, chargeback disputes workflow, checkout UI.',
      nonFunctional:
        'Money effects exactly once via idempotent consumers of at-least-once messages. Payment intake p99 < 500 ms excluding the PSP, 99.99% available. Ledger durability: an event is acknowledged only after it is replicated to a majority of log replicas across three zones. Balances shown to merchants may lag by a second or two; balances used for payouts are read by the partition writer and are exact. Audit: the log is the immutable record, retained 10 years in tiered storage.',
      capacity:
        'Assumptions: 2M payments/day, 10x daily peak, 500/s holiday target, 4 postings per capture, about 3% refunded. Average 23/s, peak about 230/s, holiday 500/s. Ledger events: one journal event per capture/refund/payout carrying its postings, so about 2.1M journal events/day containing about 8.5M postings; at the holiday peak about 500 journal events/s. Event size about 1 KB with postings and metadata, so 2 GB/day, about 0.75 TB/year, 7.5 TB over 10 years before replication. With 32 partitions the busiest partition sees about 15-20 events/s at the holiday peak, trivially within a single writer. Conclusion: throughput is easy; the design effort goes into ordering, idempotency and replay.',
      api: 'POST /payments, POST /payments/{id}/capture, /void, /refunds, each requiring an Idempotency-Key; repeated keys return the original result. GET /payments/{id} returns the current state from the payment projection. GET /merchants/{id}/balance returns {pending, available, asOfOffset}. Status changes are published as PaymentStatusChanged events to a topic the order service consumes; external callers receive signed webhooks generated from the same events. 409 for invalid transitions, 202 PENDING when the PSP outcome is unknown.',
      database:
        'The ledger is an append-only replicated log partitioned by merchant id. Each event is a journal entry {entryId, operationKey, postings[]} whose postings sum to zero per currency; platform accounts (fee revenue, PSP receivable) appear in every partition as per-partition sub-accounts that reporting sums. A single writer per partition validates each command before appending: it rejects unbalanced entries, drops a command whose operationKey it has already applied (it keeps a dedup index, persisted in snapshots, for 30 days, beyond which callers cannot retry), and checks payout amounts against the exact available balance it holds in memory. Projections (balances, payment status, search by order id) are materialized into a key-value store and a relational reporting store; each records the last applied offset so it can be rebuilt by replaying from a snapshot. Amounts are integer minor units.',
      architecture:
        '1. Payment API writes a PaymentRequested command keyed by the idempotency key into a durable workflow engine, which persists each step. 2. The workflow calls risk, then the PSP adapter with a deterministic PSP idempotency key (paymentId + step), and records the result as a step output. 3. On capture success it sends a PostJournal command to the ledger writer for that merchant partition; the writer appends the balanced entry. 4. Projectors consume the log and update balances and payment status, and an emitter publishes status events. 5. Payouts: a scheduler sends one RequestPayout command per merchant per cycle into the merchant partition; the writer posts available -> payouts_in_transit, and a payout workflow calls the bank with the payout id as reference. 6. Reconciliation consumes PSP settlement files and bank statements, matches them against log entries, and emits adjusting entries after review.',
      scalability:
        'Partitions spread across brokers; adding partitions requires a planned re-partitioning, so I start with 32 for headroom. Ledger writers are one active instance per partition with a standby that takes over via a lease in a consensus store, and the log’s fencing (writer epoch) stops a deposed writer from appending. Projections scale independently and can be rebuilt in parallel. The workflow engine is replicated and scales by adding workers. PSP calls go through a circuit breaker; when it is open, new payments fail fast with a retryable error rather than piling up.',
      failures:
        'Workflow worker crash: the engine resumes the step; because the PSP call carries the same idempotency key, a re-executed call returns the original result. PSP timeout: the workflow parks in UNKNOWN and polls the PSP status endpoint; duplicate webhooks are deduped by PSP event id and applied as workflow signals only if they are valid transitions. Writer failover: the standby replays from the last snapshot to the log head before accepting commands, so its dedup index and balances are exact. Payout job crash: commands are keyed by (merchant, cycle), so re-sending them is a no-op, and bank timeouts are resolved by looking up the payout reference. Projection bug: fix and replay from the log; the log itself is never edited.',
      tradeoffs:
        'Event sourcing gives a natural audit trail, cheap replays and independently scaling read models; the costs are eventual consistency for read views, the operational burden of a log, snapshots and re-partitioning, and a steeper learning curve than a relational ledger, which would also be a valid and simpler choice here. Partitioning by merchant keeps each journal entry within one partition so it is appended atomically, at the cost of splitting platform accounts into sub-accounts. A durable workflow engine replaces hand-written state machines and retry tables, but adds a critical dependency that must be highly available. Exact balances live only in the writer, so payouts go through it rather than reading a projection.',
    },
  },
  {
    id: 'payment-fail-shallow',
    label: 'Weak: generic and vague',
    expect: 'fail',
    note: 'No state machine, no ledger model, no idempotency design, no numbers, and no handling of PSP timeouts, payouts or reconciliation. It names components without showing that money moves correctly.',
    answers: {
      functional:
        'Users can pay for orders with a card. Merchants get paid. We can also do refunds.',
      nonFunctional:
        'The system must be secure, reliable and fast. Payments are important so we need high availability.',
      capacity:
        'There are a lot of payments every day so the system must handle high traffic. We will scale as needed.',
      api: 'POST /pay to pay, POST /refund to refund, GET /balance to see the balance.',
      database:
        'A SQL database stores payments and balances because SQL is ACID and good for money.',
      architecture:
        'Client calls the payment service, which calls the PSP and saves the result in the database. A payout service pays merchants every day.',
      scalability:
        'We will use multiple servers behind a load balancer and add caching. The database can have replicas.',
      failures:
        'If the PSP fails we retry. We will monitor the system and have alerts. Backups are taken daily.',
      tradeoffs:
        'SQL is more consistent than NoSQL, which matters for payments. Using one PSP is simpler.',
    },
  },
  {
    id: 'payment-fail-wrong',
    label: 'Weak: confident but incorrect',
    expect: 'fail',
    note: 'Detailed but wrong on the points that matter: charges are retried without idempotency keys (double charges), card numbers are stored (expands PCI scope), balances are mutable floats with no ledger history, payouts use a cached balance with no per-cycle uniqueness, and capacity is off by about two orders of magnitude.',
    answers: {
      functional:
        'Charge cards, refund, keep merchant balances, pay out daily, reconcile. We store the card number encrypted so we can retry failed charges and do refunds without asking the PSP.',
      nonFunctional:
        'Five nines, p99 under 50 ms including the PSP, and exactly-once delivery guaranteed by the message broker so we never need deduplication.',
      capacity:
        '2 million payments per day is about 2,000 payments per second, and 20,000/s at peak. That needs at least 200 database shards of 100 writes per second each, so we shard from day one.',
      api: 'POST /charge {cardNumber, expiry, cvv, amount, merchantId} returns success or failure. POST /refund {paymentId, amount}. GET /merchants/{id}/balance. No idempotency key is needed because the broker guarantees exactly-once.',
      database:
        'A merchants table with a balance column of type FLOAT. On each charge we run UPDATE merchants SET balance = balance + amount * 0.9. Refunds subtract from it. We do not keep a separate ledger because the balance column is always current, and old payment rows are deleted after 90 days to save space. Card numbers are stored AES-encrypted in the payments table with the CVV for retries.',
      architecture:
        'The API writes a message to the broker; a consumer calls the PSP and updates the balance in one step. Payouts read every merchant’s balance from the Redis cache and send a bank transfer, then set the balance to zero.',
      scalability:
        'The 200 shards handle the write load. Balances are cached in Redis with a 10-minute TTL so payout reads do not hit the database.',
      failures:
        'If the PSP times out, the consumer immediately retries the charge up to five times with the stored card. If the payout job crashes, we rerun it from the start the next morning. Duplicate webhooks are fine since we just overwrite the status.',
      tradeoffs:
        'Storing cards gives us independence from the PSP, which is worth the extra security work. Floats are faster than decimals. Exactly-once brokers remove the need for idempotency logic, which simplifies the code a lot.',
    },
  },
]

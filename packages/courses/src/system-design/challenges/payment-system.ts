import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `Design **PayCore**, the payments platform behind a marketplace where 100,000 independent merchants sell to buyers.

When a buyer checks out, the marketplace’s order service asks PayCore to take the payment. PayCore charges the buyer’s card through an external payment service provider (PSP), keeps the marketplace’s fee, and owes the rest to the merchant. Once a day, PayCore pays each merchant their available balance by bank transfer through a bank’s payout API.

Money must move **correctly**: no buyer is charged twice, no merchant is paid twice or underpaid, and every cent can be traced. Finance needs to reconcile PayCore’s records against the PSP’s daily settlement report and the bank’s statement, and auditors need an immutable history.

The PSP collects card details in its own hosted fields and returns a token, so raw card numbers never reach PayCore. The PSP API supports idempotency keys and a status lookup, and it sends webhooks that may arrive late, duplicated or out of order. A PSP call can time out without telling you whether the charge happened.`,
  requirements: [
    'Accept card payments for marketplace orders: authorize at checkout, capture when the merchant ships, and void uncaptured authorizations.',
    'Support full and partial refunds of captured payments.',
    'Record every money movement in a double-entry ledger and let merchants see their pending and available balance.',
    'Pay out each merchant’s available balance once a day through the bank payout API.',
    'Reconcile daily against the PSP settlement report and the bank statement, and surface every discrepancy for review.',
    'Callers (the order service, merchants’ API clients) can retry any request safely, and are notified of payment status changes.',
  ],
  scale: [
    '2 million payments per day on average; daily peak is about 10x the average rate, and the holiday peak design target is 500 payments per second.',
    'Each captured payment produces about 4 ledger postings (buyer charge, merchant payable, marketplace fee, PSP fee); refunds add more.',
    '100,000 merchants, of whom about 60,000 receive a payout on a typical day.',
    'About 3% of payments are later refunded, partially or fully.',
    'Financial records (payments, ledger entries, payouts) must be retained for 10 years.',
  ],
  constraints: [
    'Exactly-once money effect: retries, timeouts and duplicate webhooks must never double-charge a buyer, double-refund, or double-pay a merchant.',
    'PCI DSS: card data is tokenized by the PSP. Keep PayCore’s systems out of the cardholder data environment; do not store or log card numbers.',
    'Payment API p99 under 500 ms excluding PSP time; PSP calls can take up to 10 seconds. Payment acceptance availability 99.99%.',
    'The ledger is the source of truth for balances and must be append-only and auditable; corrections are new entries, never edits.',
    'Out of scope: fraud scoring (an existing risk service answers in about 100 ms), currency conversion (each merchant has one currency), and the buyer-facing checkout UI.',
  ],
  instructions: `Fill in all nine fields. Write for an engineer who will build and operate this.

- There is no single reference answer. A ledger in a relational database, an event-sourced ledger, a workflow engine or hand-written state machines can all score well if they are correct. Justify your choices against the requirements rather than naming products.
- Show your capacity math with every assumption written down (payment rate, postings per payment, record sizes, retention), and say what the numbers mean for the design.
- Be explicit about: the payment state machine, how idempotency is enforced end to end (from the caller to the PSP), what happens when a PSP call times out, how the ledger guarantees every entry balances, and how payouts and reconciliation avoid paying twice or missing money.
- Name what you leave out and the risks you accept.`,
  rubric: {
    version: '1.0',
    passMark: 75,
    criteria: [
      {
        id: 'requirements_understanding',
        title: 'Requirements understanding',
        weight: 15,
        description:
          'A strong answer covers authorize, capture, void, refund, ledger balances, daily payouts and reconciliation, and recognizes that correctness (exactly-once money effect, auditability) outranks latency and that the PSP can return an unknown outcome. It states measurable targets consistent with the constraints and keeps card data out of scope as the PCI constraint requires. Penalize answers that treat a payment as a single synchronous call with no lifecycle, ignore refunds, payouts or reconciliation, or plan to store card numbers.',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'A strong answer computes the average rate (2 million/day is about 23 payments per second), the peak (about 230 per second daily, 500 per second holiday target), ledger postings (about 8 million per day, roughly 2,000 postings per second at the holiday peak), and storage over 10 years from stated record sizes (a few TB to low tens of TB with indexes), then concludes something from it, e.g. that write volume fits a well-provisioned transactional store and the real challenges are correctness and hot accounts rather than raw throughput. Penalize errors of an order of magnitude or more, missing assumptions, or numbers that never inform a decision.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        minScore: 50,
        description:
          'A strong answer defines an explicit payment state machine (e.g. created, authorizing, authorized, capturing, captured, refunded, failed, plus an unknown/pending state for timeouts), separates the payment orchestration, PSP adapter, ledger, payout and reconciliation components, and shows the sequence for authorize, capture, refund and payout. State changes and ledger postings must be tied together reliably (same transaction, outbox, or events applied idempotently). Asynchronous PSP webhooks must be verified, deduplicated and applied only as valid state transitions. Accept synchronous or event-driven orchestration if it is correct. Penalize designs that call the PSP inside a long database transaction without handling the unknown outcome, or that can mark a payment captured without a matching ledger entry.',
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        minScore: 50,
        description:
          'A strong answer models a double-entry ledger: immutable journal entries whose postings sum to zero per currency, accounts per merchant and per platform purpose, amounts as integer minor units or fixed-precision decimals, and balances either derived from postings or maintained atomically with them. It enforces idempotency with a unique key per operation stored durably, and explains how concurrent writes to the same account (e.g. a busy platform fee account) are handled. A relational ledger and an event-sourced ledger are both acceptable if they guarantee balanced, append-only entries. Penalize floating-point money, balances updated in place with no posting history, edits or deletes to past entries, or idempotency kept only in a cache.',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        minScore: 50,
        description:
          'A strong answer makes every retry safe: an idempotency key from the caller, a deterministic idempotency key passed to the PSP, and on timeout a status lookup or webhook before any retry, with a reconciler that resolves stuck payments. It describes payouts that cannot double-pay (one payout record per merchant per cycle with a unique constraint, bank idempotency or reference ids, and verifying unknown outcomes against the bank), daily reconciliation that matches every record and raises discrepancies, replication with no data loss on failover for the ledger, and a plan for PSP outages (circuit breaking, failover to a second PSP only where the semantics are safe). Penalize blind retries of charges or payouts, ledger storage that can lose acknowledged writes, or a single point of failure with no mitigation.',
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'A strong answer weighs consistency against availability for the payment path (e.g. failing closed vs accepting payments into a pending state when a dependency is down), synchronous vs asynchronous capture and status updates, derived vs stored balances, relational vs event-sourced ledger, and single vs multiple PSPs, saying what each costs in complexity, latency or risk and why the chosen side fits this brief. Penalize technology lists without alternatives, or claims of exactly-once delivery without explaining that it is achieved through idempotent processing of at-least-once delivery.',
      },
    ],
  },
  remediation: {
    requirements_understanding: [
      'intro-to-system-design',
      'consistency-models',
    ],
    capacity_estimation: ['intro-to-system-design', 'database-sharding'],
    architecture_design: [
      'distributed-transactions',
      'event-driven-architecture',
      'idempotency',
    ],
    database_design: ['sql-vs-nosql', 'idempotency', 'database-indexing'],
    scalability_reliability: [
      'idempotency',
      'fault-tolerance',
      'database-replication',
    ],
    tradeoff_reasoning: ['cap-theorem', 'distributed-transactions'],
  },
  fieldHints: {
    api: 'Show how a caller passes an idempotency key, what a repeated request with the same key returns, and how the caller learns about status changes it did not wait for.',
    database:
      'Write out the journal entries for one captured payment and one partial refund, and show that each one balances.',
    failures:
      'Walk through: the PSP times out on capture; a webhook arrives twice; the payout job crashes halfway through 60,000 transfers.',
  },
}

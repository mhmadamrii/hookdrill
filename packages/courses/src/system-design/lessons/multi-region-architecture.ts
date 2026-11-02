import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'multi-region-architecture',
  title: 'Multi-Region Architecture',
  summary:
    'Running in several regions brings users lower latency and lets the system survive losing a region, but it forces explicit choices about recovery targets, traffic routing, replication and write conflicts.',
  minutes: 20,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-multi-region-architecture-1',
      text: 'explain why a system might run in more than one region, define RTO and RPO, and match them to the four common disaster-recovery strategies.',
    },
    {
      id: 'sd-multi-region-architecture-2',
      text: 'compare active-passive and active-active designs, including how traffic is routed between regions and how failover is triggered.',
    },
    {
      id: 'sd-multi-region-architecture-3',
      text: 'reason about data across regions: synchronous and asynchronous replication, and the write-global, write-local and write-partitioned strategies with their consistency and conflict trade-offs.',
    },
  ],
  concept: [
    {
      heading: 'Why one region is sometimes not enough',
      blocks: [
        {
          type: 'text',
          md: "A cloud **region** is a separate geographic area containing several isolated locations, each with one or more data centres, called **availability zones** (AZs). Running across several AZs in one region, with a load balancer in front and a replicated database, already survives the loss of a single data centre. AWS's disaster-recovery guidance points out that AZs are deliberately placed far enough apart that most common disasters affect only one of them, so a multi-AZ design may already cover much of your risk.\n\nTeams go further, to **multiple regions**, for three reasons:\n\n- **Latency.** Requests to a distant region take longer simply because of distance. Serving users from a nearby region, together with the CDN from an earlier lesson for static content, makes the app feel faster.\n- **Surviving a region.** A whole region can become unavailable or degraded. A second region gives you somewhere to go.\n- **Data residency.** Laws or contracts may require some users' data to stay in a particular country or area.\n\nThe costs are real: more infrastructure, cross-region network traffic, and much more operational and design complexity. The hardest part is data, because a database cannot be in two places at once without either waiting for the network or accepting that the copies differ for a while. That is the CAP and consistency trade-off from earlier lessons, now across continents.",
        },
      ],
    },
    {
      heading: 'Recovery objectives and disaster-recovery strategies',
      blocks: [
        {
          type: 'text',
          md: 'Before choosing an architecture, decide what you need to survive and how well. Two numbers, set by the business, frame the decision:\n\n- **Recovery Time Objective (RTO):** the maximum acceptable delay between the interruption of service and its restoration. How long can we be down?\n- **Recovery Point Objective (RPO):** the maximum acceptable time since the last data recovery point. How much recent data can we lose?\n\nAWS describes four strategies, in rising order of cost and complexity and falling RTO and RPO:\n\n1. **Backup and restore.** Back up data (and infrastructure as code) to another region; rebuild there after a disaster. Cheapest, slowest to recover.\n2. **Pilot light.** Data is continuously replicated to the second region and core pieces such as databases are always on, but application servers are switched off and must be started and scaled before taking traffic.\n3. **Warm standby.** A scaled-down but fully working copy runs in the second region and can serve traffic immediately; it scales up on failover.\n4. **Multi-site active/active.** Full deployments in several regions all serve users. A variant, **hot standby**, keeps full capacity in the second region but sends it no traffic until failover.\n\nOne point applies to all of them: **replication is not a backup.** Continuous replication copies corruption and accidental deletes to the other region too. You still need point-in-time backups, and recovering from a data disaster always means some data loss back to the last good point.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Region',
              definition:
                'A separate geographic area of a cloud provider, made up of several isolated availability zones.',
            },
            {
              term: 'RTO (Recovery Time Objective)',
              definition:
                'The longest acceptable time between a service interruption and the service being restored.',
            },
            {
              term: 'RPO (Recovery Point Objective)',
              definition:
                'The longest acceptable time between the last recovery point and the interruption; in effect, how much recent data you can lose.',
            },
            {
              term: 'Active-passive',
              definition:
                'Only one region serves traffic; another stands by and takes over on failover.',
            },
            {
              term: 'Active-active',
              definition:
                'Several regions serve users at the same time, so losing one shifts its traffic to the others.',
            },
            {
              term: 'Last writer wins',
              definition:
                'A conflict rule that keeps the most recent of two concurrent updates and discards the other.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Routing traffic and handling data across regions',
      blocks: [
        {
          type: 'text',
          md: "**Routing.** A global entry point sends each user to a region. DNS-based routing (for example latency-based or geographic policies) returns different addresses to different users, with health checks to stop sending users to a failed region; its weakness is that DNS answers are cached. **Anycast** addresses, where one IP address is announced from many locations, avoid DNS caching delays. A CDN can also retry a failed request against a second origin.\n\n**Failover.** Active-passive needs a moment where traffic moves from the primary to the standby. It can be automatic, based on health checks, but a false alarm is costly: failing over always loses some availability and possibly data, so many teams start failover by hand and automate every step after the decision. Active-active has no single failover moment, but the surviving regions must have the capacity to absorb the lost region's traffic.\n\n**Replication.** Data moves between regions in one of two ways:\n\n- **Synchronous:** a write is confirmed only when the remote region also has it. RPO near zero and strong cross-region consistency, but every write waits for a round trip between regions.\n- **Asynchronous:** a write is confirmed locally and copied shortly after. Writes stay fast, but anything confirmed and not yet copied is lost if the region fails, so RPO is above zero, and readers in other regions can see slightly stale data.\n\n**Writes in active-active.** Reads are usually served from the nearest region (**read local**). For writes, AWS describes three strategies:\n\n- **Write global:** all writes go to one primary region; if it fails, another is promoted. No write conflicts, but distant users pay cross-region latency on writes.\n- **Write local:** each region accepts writes, and replication reconciles them. Fast writes everywhere, but two regions can update the same item at nearly the same time. Amazon DynamoDB global tables, in their default multi-Region eventual consistency mode, resolve this with **last writer wins**, so one of the two updates is silently lost.\n- **Write partitioned:** each item has a home region, for example by user ID, and its writes go there. Avoids conflicts while keeping most writes local, but needs routing by key and a plan for when a home region fails.",
        },
        {
          type: 'diagram',
          caption:
            'Active-active with read local, write global: both regions serve reads from a local database, all writes go to the EU primary, and the US replica is updated asynchronously.',
          nodes: [
            {
              id: 'eu-users',
              label: 'Users in Europe',
              kind: 'client',
              col: 0,
              row: 1,
            },
            {
              id: 'us-users',
              label: 'Users in the US',
              kind: 'client',
              col: 0,
              row: 4,
            },
            {
              id: 'router',
              label: 'Global router',
              kind: 'balancer',
              col: 1,
              row: 2,
            },
            {
              id: 'eu-app',
              label: 'EU app servers',
              kind: 'service',
              col: 2,
              row: 1,
            },
            {
              id: 'us-app',
              label: 'US app servers',
              kind: 'service',
              col: 2,
              row: 4,
            },
            {
              id: 'eu-db',
              label: 'EU primary DB',
              kind: 'store',
              col: 4,
              row: 1,
            },
            {
              id: 'us-db',
              label: 'US replica DB',
              kind: 'store',
              col: 4,
              row: 4,
            },
          ],
          edges: [
            { from: 'eu-users', to: 'router', label: 'nearest healthy' },
            { from: 'us-users', to: 'router', label: 'nearest healthy' },
            { from: 'router', to: 'eu-app' },
            { from: 'router', to: 'us-app' },
            { from: 'eu-app', to: 'eu-db', label: 'reads + writes' },
            { from: 'us-app', to: 'us-db', label: 'local reads' },
            { from: 'us-app', to: 'eu-db', label: 'writes', dashed: true },
            {
              from: 'eu-db',
              to: 'us-db',
              label: 'async replication',
              dashed: true,
            },
          ],
        },
        {
          type: 'example',
          title: 'Losing the EU region',
          md: 'Using the design in the diagram (times are illustrative).\n\nThe EU region becomes unavailable. Health checks fail and the router sends European users to the US region, which now carries all traffic. Reads keep working from the US replica. Writes fail until someone promotes the US replica to primary.\n\n- **What is lost:** orders confirmed by the EU primary in the last moment before the outage that had not yet replicated. That is the cost of asynchronous replication: RPO above zero.\n- **How long it takes:** detection, the decision to fail over, promotion and routing changes all add up to the RTO. Automating every step shortens it.\n- **What can go wrong:** if the US region was sized only for US traffic, it may now be overloaded. And once the EU region returns, it must not act as primary again until its data is reconciled with the new primary.',
        },
      ],
    },
    {
      heading: 'Multi-region in practice',
      blocks: [
        {
          type: 'text',
          md: "- **Amazon Aurora global databases** fit write global: one primary region, read replicas in other regions, asynchronous replication, and a secondary that can be promoted to take writes when the primary region fails. Secondary clusters can also forward writes to the primary.\n- **Amazon DynamoDB global tables** fit write local: in the default multi-Region eventual consistency mode, every region accepts reads and writes, with last-writer-wins reconciliation of concurrent updates. A newer multi-Region strong consistency mode replicates writes synchronously instead, at the cost of higher write latency.\n- **Amazon Route 53** offers latency-based and geoproximity routing with health checks, and **AWS Global Accelerator** uses anycast static IPs with health checks and per-region traffic dials.\n- **Google Cloud's multi-regional deployment archetype** describes the same trade-offs: better availability during a region outage and lower latency for users in different geographies, against higher cost and operational complexity, with synchronous replication needed for a very low RPO or strong cross-region consistency, and geofenced DNS routing to meet data-residency rules.",
        },
      ],
    },
  ],
  application: {
    heading: 'Designing for the loss of a region, and the limits',
    blocks: [
      {
        type: 'text',
        md: 'Start from the business, not the architecture: which workloads need to survive a region loss, and what RTO and RPO each needs. AWS notes that for some low-criticality workloads, having no cross-region disaster recovery can be a valid, informed decision, and that a recovery strategy costing more than the failure it prevents should not be built without another reason, such as regulation.\n\nThen, for each workload that does need it:\n\n- Pick a strategy that meets its RTO and RPO at acceptable cost.\n- Decide where writes go and accept the matching trade-off: latency (write global), lost updates (write local with last writer wins), or routing complexity (write partitioned).\n- Make sure the surviving region has, or can quickly get, the capacity to take the whole load. Scaling up during a disaster depends on cloud control-plane operations, which AWS treats as less reliable to lean on in a crisis than capacity that is already running.\n- Keep point-in-time backups alongside replication.\n- **Test** failover and recovery regularly. A procedure that has never run is a guess.\n\nLimits: multi-region multiplies cost and operational work; asynchronous replication means some data loss on a sudden regional failure; anything that must be strongly consistent across regions pays cross-region latency on every write; and duplicated requests during failover (a client retrying in the new region) need idempotency to stay harmless.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'An active-active, multi-region system never loses data.',
      correction:
        'With asynchronous replication, writes confirmed in a failed region but not yet copied are lost. Data corruption or deletion is replicated too, so recovering from it relies on backups, with an RPO above zero.',
    },
    {
      claim: 'Cross-region replication is a backup.',
      correction:
        'Replication faithfully copies mistakes, including deletes and corrupted writes. Point-in-time backups are still needed to restore data to a good state.',
    },
    {
      claim: 'Every serious production system should be multi-region.',
      correction:
        'A multi-AZ design in one region already survives the loss of a data centre. Multi-region is worth its cost only when the business impact of a region outage, latency needs or residency rules justify it.',
    },
  ],
  questions: [
    {
      id: 'sd-multi-region-architecture-q1',
      objective: 'sd-multi-region-architecture-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What does a Recovery Point Objective (RPO) describe?',
      options: [
        {
          id: 'a',
          text: 'The most recent data, measured in time, you can accept losing',
          explanation:
            'Correct. RPO is the maximum acceptable time since the last recovery point, which bounds how much recent data may be lost.',
        },
        {
          id: 'b',
          text: 'The longest the service may be down before it is restored',
          explanation: 'That is the Recovery Time Objective (RTO).',
        },
        {
          id: 'c',
          text: 'The share of all requests that each region is expected to serve',
          explanation:
            'That is a traffic-routing setting, not a recovery objective.',
        },
        {
          id: 'd',
          text: 'The usual delay for one write to replicate to another region',
          explanation:
            'That is replication lag. It affects whether you meet your RPO, but it is not the objective itself.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-multi-region-architecture-q2',
      objective: 'sd-multi-region-architecture-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which disaster-recovery strategy keeps a scaled-down but fully working copy in another region that can serve traffic immediately?',
      options: [
        {
          id: 'a',
          text: 'Backup and restore',
          explanation:
            'Here the infrastructure must be rebuilt from backups after a disaster, so nothing is ready to serve.',
        },
        {
          id: 'b',
          text: 'Pilot light',
          explanation:
            'Pilot light keeps data and core services on, but application servers are switched off and must be started first.',
        },
        {
          id: 'c',
          text: 'Warm standby',
          explanation:
            'Correct. Warm standby runs a smaller but complete copy that can take traffic at once and then scale up.',
        },
        {
          id: 'd',
          text: 'Multi-site active/active',
          explanation:
            'Active/active runs full deployments that already serve users in every region, not a scaled-down standby.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-multi-region-architecture-q3',
      objective: 'sd-multi-region-architecture-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'An active-passive system replicates its database asynchronously from the primary region to the standby. The primary region is suddenly lost. Which statement is true?',
      options: [
        {
          id: 'a',
          text: 'No data is lost, because replication runs continuously',
          explanation:
            'Continuous is not the same as synchronous. Writes confirmed but not yet copied are lost with the region.',
        },
        {
          id: 'b',
          text: 'Writes confirmed but not yet replicated may be lost, so RPO is above zero',
          explanation:
            'Correct. Asynchronous replication confirms writes before they reach the standby, so the most recent ones can be lost.',
        },
        {
          id: 'c',
          text: 'The standby refuses to become primary until the old primary returns',
          explanation:
            'The point of a standby is that it can be promoted while the primary is gone.',
        },
        {
          id: 'd',
          text: 'Every write since the last nightly backup is lost for good',
          explanation:
            'That describes recovering from backups only. Replication keeps the standby far more current than a nightly backup.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-multi-region-architecture-q4',
      objective: 'sd-multi-region-architecture-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'How does multi-site active/active differ from hot standby?',
      options: [
        {
          id: 'a',
          text: 'Active/active needs no data replication between its regions',
          explanation:
            'Active/active needs replication more than any other strategy, because every region serves users.',
        },
        {
          id: 'b',
          text: 'Hot standby serves users from every region all of the time',
          explanation:
            'This is reversed. Hot standby sends traffic to only one region.',
        },
        {
          id: 'c',
          text: 'Active/active no longer needs any point-in-time backups',
          explanation:
            'Backups are still needed: replication copies corruption and deletes to every region.',
        },
        {
          id: 'd',
          text: 'Active/active serves users everywhere; hot standby waits idle at full size',
          explanation:
            'Correct. Both have full capacity in several regions, but hot standby sends traffic to one region until failover.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-multi-region-architecture-q5',
      objective: 'sd-multi-region-architecture-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A database uses write local with last-writer-wins. A user changes their shipping address in the EU region while a support agent changes it in the US region at almost the same moment. What happens?',
      options: [
        {
          id: 'a',
          text: 'The two updates are merged field by field automatically',
          explanation:
            'Last-writer-wins does not merge. It picks one whole update.',
        },
        {
          id: 'b',
          text: 'Both regions block writes until they agree on one value',
          explanation:
            'Write local accepts writes without cross-region agreement; that is why conflicts can happen.',
        },
        {
          id: 'c',
          text: 'Both values are kept, and the user is asked to choose one',
          explanation:
            'Some systems keep conflicting versions, but last-writer-wins does not.',
        },
        {
          id: 'd',
          text: 'One update replaces the other, and the losing one is discarded',
          explanation:
            'Correct. When replication reconciles them, the later write wins and the other is lost without an error.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-multi-region-architecture-q6',
      objective: 'sd-multi-region-architecture-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A ledger service has users on two continents. Conflicting writes to an account must never happen, and some extra write latency for distant users is acceptable. Which write strategy fits best?',
      options: [
        {
          id: 'a',
          text: 'Write local in every region, with last-writer-wins',
          explanation:
            'Last-writer-wins resolves conflicts by discarding updates, which a ledger cannot accept.',
        },
        {
          id: 'b',
          text: 'Write global: all writes to one primary, reads served locally',
          explanation:
            'Correct. One writer means no write conflicts, and the cost, cross-region latency on writes, is acceptable here.',
        },
        {
          id: 'c',
          text: 'Writes go to a cache in the nearest region and flush later',
          explanation:
            'Two regions could accept writes for the same account before flushing, which creates conflicts and risks losing writes.',
        },
        {
          id: 'd',
          text: 'Writes are partitioned by a random ID made for each request',
          explanation:
            'Random per-request partitioning can send writes for the same account to different regions, so conflicts remain.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-multi-region-architecture-q7',
      objective: 'sd-multi-region-architecture-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Why do many teams with active-passive setups trigger cross-region failover by hand, while automating every step after that decision?',
      options: [
        {
          id: 'a',
          text: 'Manual failover gives an RTO of zero, unlike automation',
          explanation: 'A human decision adds time; it cannot make RTO zero.',
        },
        {
          id: 'b',
          text: 'DNS cannot fail over automatically based on health checks',
          explanation:
            'DNS services such as Route 53 can fail over automatically using health checks.',
        },
        {
          id: 'c',
          text: 'Failover costs availability and maybe data, so false alarms are costly',
          explanation:
            'Correct. Failing over on a false alarm causes real losses, so a person confirms, then a script runs the steps quickly.',
        },
        {
          id: 'd',
          text: 'Health checks are unable to detect a whole region going down',
          explanation:
            'Health checks can detect a failed regional endpoint; the concern is false positives, not blindness.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-multi-region-architecture-q8',
      objective: 'sd-multi-region-architecture-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A low-criticality internal tool runs across three availability zones in one region. A manager asks for an active/active multi-region setup. What is the best first response?',
      options: [
        {
          id: 'a',
          text: 'Set RTO and RPO from business impact; multi-AZ may already suffice',
          explanation:
            'Correct. Recovery targets should come from business impact, and a multi-AZ design already covers the most common disasters at far lower cost.',
        },
        {
          id: 'b',
          text: 'Build active/active, since it is the most resilient at any cost',
          explanation:
            'Active/active is the most complex and costly strategy. Its cost must be justified by the impact of an outage.',
        },
        {
          id: 'c',
          text: 'Move to a single zone to save money, as one region is enough',
          explanation:
            'This removes protection the tool already has against losing a data centre.',
        },
        {
          id: 'd',
          text: 'Add cross-region replication alone, as it also protects against deletes',
          explanation:
            'Replication copies deletes and corruption to the other region; it is not a backup.',
        },
      ],
      answer: 'a',
    },
  ],
  scenario: {
    prompt:
      'An online store runs in one EU region across three availability zones. It is expanding to the US, and US users complain the site is slow. The business also says that losing a region for a day would be unacceptable: they want the store back within about 30 minutes and can tolerate losing at most a few seconds of orders (illustrative targets). Product pages are read-heavy; orders and payments are writes. Propose a multi-region design: DR strategy, traffic routing, where reads and writes go, how failover works, and what you would test.',
    modelAnswer:
      "**Targets first.** RTO about 30 minutes and RPO of a few seconds rule out backup and restore. Both warm standby and active/active can meet them; because US users also need lower latency, it makes sense to serve them from a US region all the time, so I would go **active/active with read local, write global**.\n\n**Static content and reads.** Images and assets go through a CDN. Product pages read from a database replica in each region, so US browsing is fast.\n\n**Writes.** Orders and payments go to a single primary database in the EU, with asynchronous replication to the US. This avoids write conflicts on orders and stock. US users pay cross-region latency only on checkout. Asynchronous replication keeps RPO to roughly the replication lag, a few seconds, which matches the target; synchronous replication would give near-zero RPO but slow every write.\n\n**Routing.** Latency-based routing with health checks sends users to the nearest healthy region.\n\n**Failover.** If the EU region fails, all users go to the US. Reads continue. Writes need the US replica promoted to primary: I would script promotion and routing changes end to end and have an on-call engineer trigger it, to avoid failing over on a false alarm. The US region must be sized, or able to scale quickly, for all traffic. Payment requests retried during failover must carry idempotency keys, and the payment provider's own idempotency protects against a charge repeated after the key record was lost in replication.\n\n**Data safety.** Point-in-time backups in addition to replication, since replication would copy a bad deploy's corruption.\n\n**Tests.** Regular failover drills measuring actual RTO and data loss, restore tests from backups, and a load test of one region carrying all traffic.\n\nOther designs are valid: warm standby in the US with US reads served locally, or write partitioned by customer home region. A good answer ties each choice to the RTO, RPO and latency needs and names what it gives up.",
    checklist: [
      'Derives the DR strategy from the stated RTO and RPO and rules out options that cannot meet them',
      'Chooses where writes go (global, local or partitioned) and states the consistency or latency cost',
      'Explains routing between regions and how failover is triggered and executed',
      'Notes that asynchronous replication can lose the latest writes, and keeps point-in-time backups',
      'Checks that the surviving region can carry all traffic and plans regular failover tests',
    ],
  },
  takeaways: [
    'Go multi-region for latency, surviving a region loss or data residency, and only when the business impact justifies the cost; multi-AZ already covers many failures.',
    'RTO bounds downtime and RPO bounds data loss; backup and restore, pilot light, warm standby and active/active trade cost for lower values of both.',
    'Asynchronous replication keeps writes fast but loses unreplicated writes in a sudden regional failure; synchronous replication avoids that at the cost of cross-region latency per write.',
    'In active/active, write global avoids conflicts, write local is fast but needs conflict resolution such as last writer wins, and write partitioned gives each item a home region.',
    'Replication is not a backup, and a failover plan that is never tested cannot be trusted.',
  ],
  references: [
    {
      title: 'Disaster recovery options in the cloud',
      publisher: 'AWS Whitepaper: Disaster Recovery of Workloads on AWS',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html',
      kind: 'source',
    },
    {
      title: 'Business Continuity Plan (BCP): recovery objectives',
      publisher: 'AWS Whitepaper: Disaster Recovery of Workloads on AWS',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/business-continuity-plan-bcp.html',
      kind: 'source',
    },
    {
      title: 'Multi-regional deployment archetype',
      publisher: 'Google Cloud Architecture Center',
      url: 'https://docs.cloud.google.com/architecture/deployment-archetypes/multiregional',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}

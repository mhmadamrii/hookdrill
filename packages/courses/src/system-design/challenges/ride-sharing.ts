import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `Design **GoRide**, a ride-hailing service operating in 150 cities across three geographic regions: the Americas, Europe and Asia-Pacific.

A rider opens the app, sees nearby cars and a fare estimate, and requests a ride. GoRide finds a suitable available driver close to the pickup point and offers them the trip; the driver has 15 seconds to accept, and if they decline or ignore it, the offer moves to another driver. Once matched, the rider watches the driver approach on a map, the trip runs, and at drop-off the fare is calculated and handed to the payments team.

Drivers’ phones report their GPS location every few seconds while they are online. When many riders request rides in an area with few drivers, prices in that area go up (surge pricing) to balance supply and demand.

GoRide must never assign one driver to two trips, or two drivers to one request. Regulators in several countries require that trip and location data for their cities stay in that region.`,
  requirements: [
    'Riders see nearby available cars and a fare estimate (including any surge) before requesting.',
    'A ride request is matched to a nearby available driver; offers go to one driver at a time with a 15-second accept timeout before moving to the next candidate.',
    'A driver is never assigned to two active trips, and a request never ends up with two drivers.',
    'After matching, the rider sees the driver’s live location, and both apps follow the trip lifecycle (requested, matched, arriving, in progress, completed or cancelled).',
    'Surge multipliers are computed per small area from recent demand and supply and refreshed about every minute.',
    'At trip end the fare is computed from the route and handed to the existing payments service.',
  ],
  scale: [
    '3 million completed rides per day; the busiest hour is about 5x the daily average rate.',
    '600,000 drivers online at peak, each sending a location update every 4 seconds; on average about half that number are online.',
    'Average trip including pickup lasts 20 minutes.',
    'About 15 million fare-estimate and nearby-cars requests per day.',
    'The largest city generates about 15% of global demand at its local peak.',
    'Trip records are kept for 7 years; raw GPS traces for 90 days. A location update is about 100 bytes.',
  ],
  constraints: [
    'From request to an offer appearing on a driver’s phone: p95 under 1 second. Driver location shown to the rider is at most 5 seconds stale.',
    'Request and dispatch availability 99.99% within each region; the failure of one region must not affect cities served by the others.',
    'Data residency: trip and location data for a city is stored and processed in that city’s region.',
    'Assume an existing routing service returns road-network ETAs for up to 20 driver-to-pickup pairs in about 50 ms, and an existing payments service accepts a final fare.',
    'Out of scope: payment internals, the routing engine itself, driver onboarding, fraud detection and ride pooling.',
  ],
  instructions: `Fill in all nine fields. Write for an engineer who will build and operate this.

- There is no single reference answer. Geohash, quadtree, S2 or H3 indexing; greedy or batched matching; push over persistent connections or frequent polling: any well-reasoned design can score well. Justify your choices against the requirements rather than naming products.
- Show your capacity math with assumptions: location update rate, match request rate, concurrent trips, and storage for trips and traces.
- Be explicit about how the nearest drivers are found quickly, how double assignment is prevented under concurrency, how location reaches the rider, and what happens when a dispatch node or a whole region fails.
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
          'A strong answer distinguishes the very high-rate, loss-tolerant location stream from the low-rate, correctness-critical dispatch and trip state, and covers nearby cars, fare estimate and surge, offer/accept with timeout and fallback, live tracking, trip lifecycle and handoff to payments. It states measurable targets matching the constraints (dispatch latency, location freshness, availability) and recognizes data residency as a hard requirement. Penalize answers that treat location updates and trip state with the same guarantees, ignore the offer timeout or exclusivity, or invent large out-of-scope features at the expense of core flows.',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'A strong answer computes peak location writes (600,000 drivers / 4 s is about 150,000 updates per second globally, with the largest city a meaningful share), ride requests (3 million/day is about 35 per second average, about 175 per second at the busy hour), concurrent trips at peak (roughly request rate x trip duration, on the order of 200,000), fan-out of location to watching riders, and storage (GPS traces in the hundreds of GB per day and tens of TB over 90 days; trip records from a stated record size, for example about 15-40 TB over 7 years at 2-5 KB per trip), with assumptions shown. It concludes that location ingestion and the geospatial index, not trip writes, are the throughput problem. Penalize errors of an order of magnitude or more or numbers that never inform the design.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        minScore: 50,
        description:
          'A strong answer has distinct components for connection handling with driver and rider apps, location ingestion and a geospatial index of available drivers, dispatch/matching, trip management, pricing/surge, and integration with the routing and payments services, with a numbered flow from request to accepted offer to completion. The geospatial index must answer "available drivers near this point" without scanning all drivers, e.g. via geohash, quadtree, S2 or H3 cells with neighbor expansion, then rank candidates by road ETA. Greedy one-at-a-time matching and batched matching are both acceptable. Driver exclusivity must be enforced with an atomic operation (conditional write, lease or lock with fencing) in a strongly consistent store. Penalize nearest-driver queries that scan or sort every driver, assignment by read-then-write on a cache, or no mechanism for the 15-second offer timeout.',
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        description:
          'A strong answer keeps the live location index in memory (or an in-memory store), keyed by spatial cell and partitioned by city or region, with stale entries expiring; stores trip and driver-status state in a durable store with conditional updates or transactions for state transitions; and writes raw GPS traces to an append-friendly store or log with time-based retention. It explains the partition key (city or region) and how it supports residency. Any database family is acceptable with justification. Penalize writing every location update into the primary transactional database, no expiry for disconnected drivers, or trip state in a store that cannot prevent conflicting transitions.',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        minScore: 50,
        description:
          'A strong answer partitions by city or region so each region runs independently and a regional failure stays contained, scales location ingestion horizontally, and handles hot spots (a dense downtown at rush hour, e.g. by finer cells or splitting a city across partitions). It describes what happens when a dispatch or index node fails (replica or rebuild from the location stream within seconds, since drivers re-report every 4 seconds), when a driver’s connection drops mid-offer (offer expiry and lease release), when duplicate or retried requests arrive (idempotent request ids), and how trip state survives failover without double assignment. Penalize a single global deployment or single node for dispatch with no failover, or recovery approaches that can assign the same driver twice.',
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'A strong answer weighs the choices that matter here: cell size and index type (query cost vs precision, uniform hexagons vs simple string prefixes), greedy vs batched matching (latency vs global efficiency), location update frequency (freshness vs battery, bandwidth and write load), strong consistency for assignment vs availability during partitions, and regional isolation vs cross-region features. It explains why the chosen side fits this brief. Penalize technology lists without alternatives or claims that a choice has no downside.',
      },
    ],
  },
  remediation: {
    requirements_understanding: [
      'intro-to-system-design',
      'consistency-models',
    ],
    capacity_estimation: [
      'intro-to-system-design',
      'horizontal-vertical-scaling',
      'database-sharding',
    ],
    architecture_design: [
      'event-driven-architecture',
      'database-indexing',
      'consistency-models',
    ],
    database_design: ['sql-vs-nosql', 'database-indexing', 'database-sharding'],
    scalability_reliability: [
      'multi-region-architecture',
      'fault-tolerance',
      'database-replication',
    ],
    tradeoff_reasoning: ['cap-theorem', 'consistency-models'],
  },
  fieldHints: {
    capacity:
      'Location updates and ride requests differ by about three orders of magnitude; size them separately.',
    database:
      'Say where the live location index lives, where trip state lives, and which single operation stops a driver from being assigned twice.',
    failures:
      'Walk through a dispatch node crashing mid-offer, a driver losing signal after accepting, and a full region outage.',
  },
}

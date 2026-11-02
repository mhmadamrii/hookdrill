import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'ride-pass-geohash-greedy',
    label:
      'Strong: geohash cells in an in-memory store, greedy dispatch with conditional assignment',
    expect: 'pass',
    note: 'Correct and complete: independent regional stacks, a geohash cell index with neighbor expansion and TTL expiry, ETA ranking, greedy sequential offers with timeouts, exclusivity enforced by a conditional write in a strongly consistent store, push over persistent connections, and correct capacity math.',
    answers: {
      functional:
        'Nearby cars and fare estimate with surge; ride request; matching with sequential offers to one driver at a time and a 15 s timeout; live driver location for the rider; trip lifecycle (REQUESTED, MATCHED, ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED); surge per area refreshed every minute; fare at drop-off sent to payments. Out: payments internals, routing engine, onboarding, fraud, pooling, scheduled rides.',
      nonFunctional:
        'Request to offer on a driver’s phone p95 < 1 s; rider-visible location < 5 s stale. 99.99% availability per region, with regions fully independent. Trip and assignment state strongly consistent (no double assignment); location data is best-effort and can drop an update since the next arrives 4 s later. Data residency: each city is pinned to its region and its data never leaves it.',
      capacity:
        'Location: 600k drivers / 4 s = 150k updates/s at global peak; the largest city at 15% is about 22k/s. Requests: 3M rides/day / 86,400 = about 35/s, about 175/s at the 5x busy hour; I add 30% for cancelled or unmatched requests, about 230/s. Concurrent trips: 175/s x 1,200 s = about 210k; each rider watching gets a location every 4 s, about 52k pushes/s. Nearby-cars and estimates: 15M/day, about 175/s average, maybe 1k/s peak. Storage: traces average 300k drivers / 4 s = 75k/s x 86,400 x 100 B = about 650 GB/day, about 58 TB for 90 days. Trips: 3M x 5 KB = 15 GB/day, about 5.5 TB/year, about 38 TB over 7 years. So location ingest is about 1,000x the request rate and is the scaling problem; trip writes are small.',
      api: 'Driver app keeps a WebSocket to a connection gateway: sends {lat, lng, heading, ts} every 4 s and status changes; receives offers {offerId, tripId, pickup, expiresAt}, and replies accept/decline with offerId. Rider: GET /estimate?pickup&dropoff -> {fare range, surge, nearbyCars[]}. POST /rides {pickup, dropoff, requestId} (requestId makes retries idempotent) -> 202 {rideId}. Rider receives MATCHED, driver location and status pushes on its own WebSocket, with GET /rides/{id} as a fallback. POST /rides/{id}/cancel. Driver: POST /trips/{id}/arrived, /start, /complete.',
      database:
        'Location index: an in-memory key-value store per region, sharded by city. For each geohash precision-6 cell (about 1.2 x 0.6 km) a sorted set of available driver ids scored by last-update time; plus a hash per driver with latest position. Entries older than 15 s are pruned so disconnected drivers disappear. Driver status and trips: a relational database per region, sharded by city: drivers(id, status, current_trip_id, version) and trips(id, rider_id, driver_id, status, ...). Assignment is one conditional update: UPDATE drivers SET status=OFFERED, offer_id=?, offer_expires=? WHERE id=? AND status=AVAILABLE; zero rows means someone else got them. Traces go to a partitioned log and are compacted into columnar files in regional object storage with a 90-day lifecycle rule.',
      architecture:
        '1. A global DNS/edge layer routes each app to the region that serves its city; there is no cross-region dependency in the request path. 2. Driver updates hit stateless gateways, which publish to a location topic partitioned by city; a location service updates the cell index and the per-driver hash. 3. A ride request goes to the dispatch service for that city, which reads the pickup cell and its 8 neighbors, expanding a ring if fewer than 10 drivers are found. 4. Candidates (up to 20) go to the routing service for ETAs; dispatch picks the best. 5. It reserves the driver with the conditional update (status OFFERED, 15 s expiry) and pushes the offer through the driver’s gateway. 6. Accept -> one transaction sets driver BUSY and trip MATCHED; decline or timeout -> driver back to AVAILABLE, next candidate. 7. During the trip, the location service forwards the driver’s updates to the rider’s gateway. 8. On completion the trip service computes the fare and calls payments with tripId as the idempotency key. Surge: a job aggregates open requests and available drivers per cell each minute and writes multipliers that the estimate API reads.',
      scalability:
        'Each region is an independent stack; cities are the unit of partitioning for the index, dispatch and trip shards, so a big city can be split by geohash prefix across nodes if one shard runs hot. Gateways scale horizontally; connection-to-gateway mapping lives in the in-memory store so pushes find the right node. The location index has a replica per shard; even if both are lost it rebuilds within one 4 s update cycle from incoming traffic. Dispatch instances are stateless (state is in the index and the database), so any instance can take any request.',
      failures:
        'Dispatch instance crash mid-offer: the driver row has an offer_expires; a sweeper resets expired OFFERED drivers to AVAILABLE and re-enqueues the request, and an accept for an expired offerId is rejected. Driver loses signal after accepting: trip stays MATCHED, rider sees a stale-location warning after 30 s, and after 3 minutes without updates the rider can cancel free or be re-matched. Duplicate POST /rides with the same requestId returns the existing ride. Database primary failure: synchronous replica in another zone is promoted; dispatch returns a retryable error for the few seconds of failover rather than assigning without the guard. Region outage: cities in that region are down (residency forbids moving their data elsewhere); other regions are unaffected; the in-region design is multi-zone so a single zone loss is survived.',
      tradeoffs:
        'Geohash is simple and fits prefix-keyed stores, but cells are rectangular and distort with latitude, so I always search neighbors; H3 hexagons would give more uniform neighbor distances at the cost of a library dependency. Greedy one-at-a-time matching gives the lowest latency per request but can make globally worse pairings at rush hour; batching would improve efficiency at the cost of added waiting time inside the 1 s budget. A strongly consistent conditional write makes assignment unavailable during a primary failover, which I accept over double assignment. 4 s updates balance freshness and battery; 1 s would quadruple ingest to 600k/s for little rider benefit.',
    },
  },
  {
    id: 'ride-pass-h3-batched',
    label:
      'Strong: H3 index in stateful city dispatchers, batched matching, lease-based exclusivity',
    expect: 'pass',
    note: 'A genuinely different valid design: hexagonal H3 cells held in memory by stateful per-city dispatcher partitions fed by a location log, batched global matching in windows of up to 500 ms, and driver exclusivity through leases with fencing tokens in a consensus-backed store. It must score well despite differing from the geohash/greedy approach.',
    answers: {
      functional:
        'Fare estimate with surge and nearby cars, ride request, matching with a 15 s accept window and fallback, live tracking, trip state machine, per-area surge every minute, fare handoff to payments. Not covered: payment internals, routing, onboarding, fraud, pooling.',
      nonFunctional:
        'Offer delivered p95 < 1 s from request, including a batch window of at most 500 ms, location < 5 s stale at the rider, 99.99% per region. Exactly one driver per ride and one ride per driver, enforced by a linearizable store. Residency: each city’s data and processing stay in its region. Location updates are at-most-once and may be dropped under load.',
      capacity:
        'Peak location ingest 600k / 4 s = 150k msgs/s worldwide; with three regions roughly 50k/s each, and about 22k/s for the largest city. Ride requests about 35/s average, about 175/s peak globally, so a busy city sees perhaps 25-30/s, i.e. about 12-15 requests per 500 ms batch. Concurrent trips about 175 x 1,200 s = 210k. Trace storage: average 75k msgs/s x 100 B = 7.5 MB/s, about 650 GB/day, about 58 TB per 90 days across regions. Trip data about 5 KB x 3M = 15 GB/day, under 40 TB over 7 years. An H3 resolution-8 cell is about 0.74 km², so a dense downtown has a few hundred cells with tens of drivers each: small enough to hold a whole city in one process’s memory.',
      api: 'Apps use a bidirectional streaming connection (gRPC streams or WebSockets) to regional edge gateways. Driver messages: LocationUpdate, SetAvailability, OfferResponse{offerId, leaseToken, accept}. Rider: Estimate(pickup, dropoff), RequestRide(requestId, pickup, dropoff), CancelRide(rideId); server pushes RideMatched, DriverLocation, TripStatus. REST fallbacks exist for clients that cannot hold a stream. All mutating calls carry an idempotency id.',
      database:
        'Location log: a replicated, partitioned log per region keyed by city, retained 24 h for replay, and also sunk to object storage for the 90-day traces. Live index: in-process maps inside each city dispatcher (H3 cell -> driver ids, driver -> position, state), rebuilt from the last 30 s of the log on startup. Exclusivity: a consensus-backed key-value store holds driver leases (driverId -> {rideId, fencing token, expiry}) created with compare-and-set. Trips: a distributed SQL database deployed per region with rows partitioned by city; trip transitions are transactions that check the current state and the lease’s fencing token. Surge multipliers per H3 resolution-7 cell in a regional cache.',
      architecture:
        '1. Edge gateways terminate connections and publish location updates to the regional log partitioned by city. 2. Each city is owned by one dispatcher process (big cities are split into several sub-areas by H3 parent cell), which consumes its partition and keeps the index in memory. 3. RequestRide is routed to the owning dispatcher, which collects requests for up to 500 ms in busy areas (immediately in quiet ones), leaving about 400 ms for ETAs, solving, the lease write and the push. 4. For each batch it gets k-ring candidates (k=2, expanding if needed), asks the routing service for ETAs, and solves a min-cost assignment (Hungarian algorithm) over requests x drivers. 5. For each pair it acquires the driver’s lease with compare-and-set and pushes the offer with the fencing token. 6. Accept: the trip service commits MATCHED if the token is still current. Decline or 15 s timeout: lease released, request goes into the next batch. 7. Rider tracking is served by a fan-out service subscribed to the city partition. 8. Completion computes the fare and calls payments idempotently.',
      scalability:
        'Regions are fully independent stacks; within a region, cities map to log partitions and dispatcher processes, and the partition assignment is rebalanced by a coordinator when processes are added. Dense cities are split by H3 parent cells; requests near a sub-area boundary query the neighbor’s index via an RPC, which is rare and cheap. Gateways scale horizontally and are stateless apart from their open connections. The matching solver cost grows with batch size squared-ish, but 15 requests x 100 candidates per batch is well under a millisecond to a few milliseconds of CPU.',
      failures:
        'Each dispatcher has a warm standby consuming the same partition; on failure the standby takes ownership in a few seconds. Correctness does not depend on the dispatcher: leases are in the consensus store, so a new owner cannot double-book a driver, and a deposed owner’s offers fail the fencing check. Driver silent after accepting: the trip holds the driver; if no location for 3 minutes, the rider is offered a re-match and the old trip is cancelled. Log broker node loss is absorbed by replication. Whole-region outage: affected cities stop service (residency), other regions continue; the region itself spans three zones so a zone loss is survived.',
      tradeoffs:
        'Batched matching improves global efficiency (fewer long pickups when demand is dense) but spends up to 500 ms of the 1 s latency budget waiting and adds solver complexity; greedy is simpler and faster. H3 hexagons give uniform neighbor distances and easy multi-resolution aggregation for surge, versus geohash’s simplicity and native prefix queries. Stateful dispatchers give very fast in-memory lookups but need partition ownership, standbys and rebuild logic; a shared in-memory store would be easier to operate. Leases in a consensus store add a network round trip and make assignment unavailable if the store loses quorum, which I prefer to double assignment.',
    },
  },
  {
    id: 'ride-fail-shallow',
    label: 'Weak: generic and vague',
    expect: 'fail',
    note: 'Names components but never explains how nearby drivers are found, how double assignment is prevented, how location reaches the rider, or how regions and residency work, and it has no numbers.',
    answers: {
      functional:
        'Riders request rides, drivers accept them, and the rider sees the car on a map. The fare is calculated at the end.',
      nonFunctional:
        'The system should be real-time, highly available and scalable.',
      capacity:
        'There are many drivers sending locations, so there will be a lot of traffic. The system will scale horizontally to handle it.',
      api: 'POST /ride to request a ride. POST /location to update location. POST /accept to accept a ride.',
      database:
        'Cassandra for locations because it handles many writes, and PostgreSQL for trips.',
      architecture:
        'Apps talk to an API gateway. A location service stores locations, a matching service finds the closest driver, and a trip service manages trips. Kafka connects them.',
      scalability:
        'We will run services on Kubernetes and add more pods when traffic grows. Redis caches data.',
      failures:
        'Services will be replicated. If matching fails, the rider can try again.',
      tradeoffs:
        'Microservices let teams work independently but are more complex. Cassandra is fast for writes but not consistent.',
    },
  },
  {
    id: 'ride-fail-wrong',
    label: 'Weak: confident but incorrect',
    expect: 'fail',
    note: 'Detailed but wrong on fundamentals: location ingest is underestimated by about 60x, nearest-driver search scans every driver, assignment is a read-then-write on a cache that allows double assignment, everything runs in one global region (violating residency and isolation), and the single database has no failover plan.',
    answers: {
      functional:
        'Request, match, track, complete, surge and fares. The rider is always matched with the geographically closest driver by straight-line distance.',
      nonFunctional:
        'Under 100 ms for everything, 100% uptime, and eventual consistency everywhere because it is faster.',
      capacity:
        '600k drivers updating every 4 seconds is 600,000 / 4 / 60, about 2,500 writes per second, which one database handles easily. Ride requests are 3M per day, about 3,000 per second.',
      api: 'PUT /drivers/{id}/location every 4 s. POST /rides returns the assigned driver. Drivers poll GET /offers every 15 s.',
      database:
        'One PostgreSQL database in the US for all cities, so reporting is simple. Each location update runs UPDATE drivers SET lat=?, lng=? WHERE id=?. Driver availability is cached in Redis. Raw traces are kept forever in the same table history.',
      architecture:
        'The matching service runs SELECT * FROM drivers ORDER BY haversine(lat, lng, :pickupLat, :pickupLng) LIMIT 1 for each request. It then reads the driver’s status from Redis; if it says available, it writes BUSY to Redis and assigns the ride. Last write wins, so conflicts resolve themselves.',
      scalability:
        'We scale the database vertically and add app servers. Because there is one region, there are no cross-region consistency problems. Redis makes availability checks fast.',
      failures:
        'If the database goes down we restore from the nightly backup. If two riders get the same driver, the driver can cancel one of them. If a driver does not respond to an offer, the rider waits until they do.',
      tradeoffs:
        'A single region is cheaper and simpler than multiple regions. Straight-line distance is accurate enough and avoids calling the routing service. Eventual consistency gives better performance with no real downside here.',
    },
  },
]

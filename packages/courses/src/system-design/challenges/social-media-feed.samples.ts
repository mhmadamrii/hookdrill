import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'social-media-feed-pass-hybrid-push',
    label: 'Hybrid: fan-out on write, pull for large accounts',
    expect: 'pass',
    note: 'A complete hybrid design: async fan-out of post IDs into bounded in-memory timelines for ordinary accounts, pull-and-merge for accounts over 1 million followers, hydration from a post cache, cursor pagination, rebuild path for lost timelines, and correct capacity math including timeline memory.',
    answers: {
      functional: `Publish (text ≤ 500 chars, ≤ 4 photo refs) and delete posts; follow and unfollow; home timeline newest-first, 20 per page, cursor-based infinite scroll; like and reply counts shown with each post. Not in scope: ranking, ads, photo storage, search, DMs.`,
      nonFunctional: `Timeline first page p99 < 300 ms and 99.95% available; it is the most important path. Freshness: new posts in followers’ timelines within 10 s p95; deletes gone within 1 minute. Timelines and counts are eventually consistent. Publishing can be delayed under load before reads suffer.`,
      capacity: `Reads: 200M × 10 = 2B/day ≈ 23k/s, peak ≈ 70k/s (3×).
Posts: 20M/day ≈ 230/s, peak ~700/s. Storage 20M × 1 KB = 20 GB/day ≈ 7 TB/year.
Fan-out: 20M posts × 200 average followers ≈ 4B timeline inserts/day ≈ 46k/s average; that average is inflated by large accounts, which I exclude from push, so the push load is lower.
Timeline memory: keep the newest 800 entries per user, each entry = post ID + author ID = 16 B → 12.8 KB per user. For 200M active users ≈ 2.6 TB; with data-structure overhead ~5 TB across a sharded in-memory cluster (for example 64 nodes × 128 GB).
A 100M-follower account would create 100M inserts per post, which is why it is pulled instead.`,
      api: `POST /v1/posts {text, photoIds[]} → 201 {postId}
DELETE /v1/posts/{postId} → 204
PUT /v1/follows/{accountId} → 204; DELETE /v1/follows/{accountId} → 204
GET /v1/timeline?cursor=<postId>&limit=20 → 200 {posts: [{postId, author, text, photos, likeCount, replyCount}], nextCursor}
The cursor is the last post ID returned; the next page is “IDs older than the cursor”, so new posts arriving at the top never cause duplicates or gaps. Errors: 401, 404 for a deleted post, 429 for rate limits.`,
      database: `Posts: a wide-column or key-value store keyed by postId (time-sortable 64-bit IDs: timestamp + worker + sequence), plus an author index (authorId, postId desc) for profile pages and for pulling large accounts. Partitioned by postId and authorId respectively.
Follow graph: two tables, followers(accountId, followerId) and following(userId, accountId), both partitioned by their first column, so both directions are single-partition reads. Written together via an outbox so they converge.
Timelines: in-memory sorted lists keyed by userId, trimmed to 800 entries.
Counts: a separate counter store updated asynchronously from like/reply events.`,
      architecture: `Publish: client → API → write post to post store → append to the author’s index → emit PostCreated to a queue → 201 to client. Fan-out workers consume the event; if the author has ≤ 1M followers, they page through followers and push (postId, authorId) into each follower’s timeline list, skipping users inactive for 30+ days.
Read: client → timeline service → read the user’s list from the cursor → also read the recent author index of each followed large account (the user’s “large follows” list is usually a handful) → merge by postId → take 20 → hydrate from a post cache (multi-get), dropping deleted posts → attach counts.
Delete: mark the post deleted in the store and post cache, and emit PostDeleted; fan-out workers remove the ID from timelines, and hydration filters it anyway.`,
      scalability: `Timeline cache is sharded by userId; read throughput scales with nodes, and each node has a replica. Fan-out workers scale with queue partitions; at ~46k inserts/s average they need modest capacity, and queue lag is a key alert. Large accounts never fan out, so a celebrity post costs one write. Their recent-post lists are hot keys, so they are replicated and cached in-process for a second on timeline servers. Post content is cached by postId with a high hit rate since recent posts are read many times. Inactive users get no fan-out; on their return we build the timeline on demand.`,
      failures: `Timeline cache node loss: its replica takes over; if both are lost, timelines for those users are rebuilt on demand by pulling followed authors’ recent posts (slower but correct), and the user gets a slightly slower first load, not an error. Fan-out backlog: new posts appear late but reads stay fast; workers prioritize recently active users. Post store partition failure: replicas (RF=3) serve reads. Duplicate event delivery: inserting the same postId twice into a sorted set is idempotent. Counter service down: show counts from cache or omit them.`,
      tradeoffs: `Hybrid vs pure push: pure push would make a 100M-follower post cost 100M writes and minutes of lag. Hybrid vs pure pull: pull would need ~200 author lookups per read; precomputing makes reads one list read plus a few large-account merges. Cost: ~5 TB of memory and write amplification, plus complexity in maintaining two paths and choosing the 1M threshold (I would tune it by measuring fan-out lag). Eventual consistency means a post can show up a few seconds late, which the 10 s target allows.`,
    },
  },
  {
    id: 'social-media-feed-pass-pull',
    label: 'Fan-out on read with per-author recent-post lists',
    expect: 'pass',
    note: 'A genuinely different valid design: no precomputed timelines; each read merges per-author recent-post lists held in a replicated, sharded cache, with a short-lived per-user cache for repeat loads. The read amplification is quantified and bounded (shard groups, replication, parallel multi-gets), celebrities are naturally cheap, and freshness and deletes become simple. Trade-offs and failure modes are explicit.',
    answers: {
      functional: `Post, delete post, follow, unfollow, and a reverse-chronological home timeline paginated 20 at a time. Counts for likes and replies shown per post. Not doing ranking, ads, media storage, search or messaging.`,
      nonFunctional: `- First page p99 < 300 ms, 99.95% availability for reads.
- Post visible to followers within 10 s; deletes within 60 s.
- Eventual consistency for timeline and counts.
- Reads have priority over writes when capacity is short.`,
      capacity: `Timeline reads: 2B/day ≈ 23k/s avg, ~70k/s peak. Posts: ~230/s avg, ~700/s peak; 7 TB/year of post records.
My approach assembles timelines at read time, so the key number is lookups: 200 followed accounts per user × 70k reads/s = 14M author-list lookups/s at peak, before caching.
Mitigation: (1) a per-user merged first page cached for 5 s; I assume ~30% of loads hit it (quick refreshes), leaving ~10M lookups/s. (2) Author lists live in 32 shard groups, each replicated 6× (192 nodes). A read sends at most 32 parallel multi-gets. Per node: 70k × 32 / 192 ≈ 11.7k multi-gets/s with ~6 keys each ≈ 70k key reads/s, comfortable for an in-memory store.
Memory: assume 50M authors posted in the last 7 days; 100 recent IDs × 16 B each = 1.6 KB → 80 GB total, 2.5 GB per shard group.`,
      api: `POST /posts → {postId}; DELETE /posts/{id}
POST /users/{id}/follow, DELETE /users/{id}/follow
GET /timeline?before=<postId>&limit=20 → {items, nextBefore}
Because postIds are time-ordered, “before=<postId>” is a stable cursor: the merge takes items older than the cursor from each author list, so pages never repeat or skip as new posts arrive.`,
      database: `Posts in a sharded relational database, sharded by authorId, primary key (authorId, postId), so “recent posts by author” is an index range scan; postIds are time-sortable. A postId → shard lookup is unnecessary because the postId embeds the authorId shard bits.
Follow graph in the same style: following(userId, accountId) sharded by userId (needed on every read, cached per user), and followers(accountId, userId) sharded by accountId (needed for follower counts and notifications).
Per-author recent lists (last 100 IDs, 7 days) in the in-memory cache, rebuilt from the posts table on miss.
Counts in a separate counter table updated by an async consumer.`,
      architecture: `Publish: API inserts the post into the author’s shard, then appends the postId to that author’s recent list in all 6 replicas of its shard group (synchronously to one, async to the rest, typically < 1 s). The post is visible to followers on their next read, well within 10 s.
Read: timeline service loads the user’s following list (cached) → groups authors by shard group → parallel multi-gets → k-way merge by postId → take 20 → hydrate post content from a post cache → attach counts → cache the first page for 5 s.
Delete: mark the post deleted, remove it from the author’s list, and invalidate the post cache entry; hydration skips deleted posts, so it disappears on the next read.
Unfollow: the user’s following list changes, so the author is simply not merged anymore.`,
      scalability: `There is no write amplification: a 100M-follower account posts once and its list becomes a hot key, served from 6 replicas plus a 1-second in-process cache on timeline servers. Read capacity scales by adding replicas per shard group. Users who follow thousands of accounts are the expensive case; I cap the merge to the most recently active 1,000 followed accounts using a per-user “recently active follows” set. Older pages (beyond 7 days) fall back to the posts database, which is rare per the scale numbers.`,
      failures: `A cache node fails: requests go to the other replicas in its group; tail latency is protected by hedged requests (resend to another replica after 50 ms). A whole shard group unavailable: return the timeline from the other 31 groups with a “some posts may be missing” flag rather than failing. Author list missing: rebuild from the posts table with a single-flight lock to avoid a stampede. Posts shard down: publishing for those authors fails with a retryable error; reads still work from cache.`,
      tradeoffs: `Fan-out on read vs on write: I accept ~10M cache lookups/s and more complex read-path tail latency in exchange for zero write amplification, no special celebrity path, instant deletes and unfollows, and no memory spent on inactive users’ timelines. The 5 s per-user cache trades a little freshness for fewer lookups. A relational post store gives transactions and familiar tooling but sharding by author makes very prolific authors land on one shard, which their low write rate makes acceptable.`,
    },
  },
  {
    id: 'social-media-feed-fail-shallow',
    label: 'Shallow: names the pattern, no substance',
    expect: 'fail',
    note: 'Mentions fan-out and caching but gives no numbers, no treatment of large accounts, no pagination scheme, no deletes, and no failure handling. Fails on capacity, architecture depth and reliability.',
    answers: {
      functional: `Users can post, follow people and see a feed of posts from people they follow.`,
      nonFunctional: `The feed should load fast and the system should be highly available and scalable.`,
      capacity: `With 200 million users there will be a lot of reads, more than writes, so we should optimize for reads.`,
      api: `POST /post, GET /feed, POST /follow.`,
      database: `Use a NoSQL database for posts and a graph database for followers since it is a social network.`,
      architecture: `When a user posts, we use fan-out to put the post in their followers’ feeds. When the user opens the app we read their feed from the cache.`,
      scalability: `Use Redis to cache the feeds and add more servers when needed. Shard the database.`,
      failures: `Use replication so that if something fails we still have the data.`,
      tradeoffs: `Fan-out on write is faster for reads but slower for writes.`,
    },
  },
  {
    id: 'social-media-feed-fail-wrong',
    label: 'Confident but technically wrong',
    expect: 'fail',
    note: 'Detailed but wrong where it counts: read rate understated about 10x, synchronous fan-out to every follower inside the post request (a 100M-follower post cannot finish in milliseconds), a cross-shard two-phase commit per post, offset pagination on a changing list, and one unreplicated cache treated as the only copy of timelines.',
    answers: {
      functional: `Post, delete, follow, unfollow; reverse-chronological home timeline with pages of 20; like and reply counts. Every follower must see a new post at exactly the same moment, so the timeline needs strong consistency.`,
      nonFunctional: `p99 < 300 ms, 99.95% availability, and strong consistency for all timelines so that no user ever sees a different set of posts than another follower.`,
      capacity: `2B timeline reads per day is about 2,000 per second, which is low; a handful of servers is enough. Posts are 20M per day, so about 20 MB per day of storage.`,
      api: `POST /posts → 200 once the post is in every follower’s timeline. GET /timeline?page=N&size=20 uses OFFSET N*20 so users can jump to any page.`,
      database: `Timelines are stored in a relational table timeline(userId, postId, createdAt) sharded by userId. When someone posts, we insert a row for every follower in one distributed transaction using two-phase commit across all shards, so every follower sees it at the same time.`,
      architecture: `The post request handler loads all followers and inserts into each follower’s timeline before returning. Even for a 100M-follower account this takes a few milliseconds because the inserts are batched. The timeline read is SELECT ... ORDER BY createdAt DESC LIMIT 20 OFFSET N*20. All timelines are also kept in a single large Redis instance, which is the main source for reads; the database is only written to on posting.`,
      scalability: `Because each post is written to every follower’s timeline synchronously, reads never need extra work. One Redis instance with 512 GB of RAM is enough for all timelines because the data is small.`,
      failures: `If the two-phase commit fails we retry the whole post. If Redis restarts, it starts empty and timelines fill up again as people post. Deletes are handled by the next post pushing old posts out of the timeline.`,
      tradeoffs: `Strong consistency is worth the cost because users expect to see the same feed. Synchronous fan-out is simpler than queues. Offset pagination is more flexible than cursors.`,
    },
  },
]

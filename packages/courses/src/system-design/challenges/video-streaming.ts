import type { DesignChallenge } from '../../types'

export const challenge: DesignChallenge = {
  version: '1.0',
  brief: `Design **ClipStream**, a video-on-demand platform where creators upload videos and viewers watch them on phones, laptops and smart TVs.

A creator uploads a video file, often over a flaky mobile connection. ClipStream processes it into versions that play smoothly on any device and network, then publishes it. Viewers in North America, Europe and Southeast Asia open a video and expect it to start almost instantly and keep playing without buffering, adapting quality as their bandwidth changes.

Viewing follows a long tail: a small share of videos gets most of the views, while millions of older videos are watched rarely. Network egress is the largest line in the budget, so finance wants to know how the design keeps it under control.

Live streaming, recommendations, comments, DRM and ads are separate projects and out of scope.`,
  requirements: [
    'Creators can upload videos up to 4 GB with resumable uploads, and see processing status until the video is published.',
    'Every upload is processed into an adaptive bitrate ladder (from about 240p up to 1080p) that plays on web, mobile and TV clients.',
    'A 10-minute upload should be watchable within 15 minutes of the upload completing.',
    'Viewers can play any published video with adaptive quality switching and seeking.',
    'Creators can make a video private or delete it; private videos must not be playable by unauthorized viewers, even with a copied link.',
    'Each video shows a view count that may lag by a few minutes.',
  ],
  scale: [
    '20 million daily active viewers watching an average of 45 minutes per day; peak concurrency is 2 million viewers.',
    'Average delivered bitrate is about 3 Mbps; players fetch segments of 4–6 seconds.',
    '50,000 uploads per day, averaging 7 minutes and 500 MB per source file.',
    'The full rendition ladder adds up to about 10 Mbps of combined bitrate per video (all renditions together).',
    '50 million videos already in the library; the most popular 10% receive about 90% of views.',
    'Source files and renditions are kept indefinitely unless the creator deletes the video.',
  ],
  constraints: [
    'Playback start time p95 under 2 seconds; rebuffering under 1% of watch time.',
    'Availability: 99.95% for playback, 99.9% for upload and processing. Viewers on three continents must be served from nearby.',
    'Egress cost dominates: the design must explain how most bytes are served from caches close to viewers rather than from origin storage.',
    'A team of 15 engineers on one cloud provider, which offers object storage, a CDN and managed queues in every region.',
    'Out of scope: live streaming, recommendations, comments, DRM and ads.',
  ],
  instructions: `Fill in all nine fields. Write for an engineer who will build and run this.

- There is no single reference answer. HLS or DASH, pre-packaged or just-in-time packaging, chunked or whole-file transcoding, one CDN or several: any well-reasoned pipeline can score well. Justify choices against the requirements and the egress budget, not by naming products.
- Show your capacity math with assumptions: peak egress bandwidth, segment request rate, storage growth per day and per year, and transcoding compute. Keep track of bits versus bytes.
- Be explicit about the upload path, the processing pipeline and its failure handling, how playback requests are served, and how private videos are protected.
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
          'A strong answer separates the write path (resumable upload, asynchronous processing, publish) from the read path (metadata plus segment delivery), recognizes that playback is extremely read-heavy and egress-bound, and covers adaptive bitrate playback, processing status, the publish-time target, private videos and approximate view counts. It gives measurable targets matching the constraints (start time, rebuffer ratio, availability) and respects the out-of-scope list. Penalize designs that treat video as a single file downloaded by the client, or that ignore privacy or the publish-time target.',
      },
      {
        id: 'capacity_estimation',
        title: 'Capacity estimation',
        weight: 10,
        description:
          'A strong answer computes peak egress (2 million concurrent viewers at about 3 Mbps is about 6 Tbps), segment request rate (on the order of a few hundred thousand per second with 4–6 second segments), daily ingest (50,000 x 500 MB is about 25 TB of source) and rendition storage (about 10 Mbps of combined bitrate for 7 minutes is roughly 500 MB per video, so a similar 25 TB per day), yearly growth in petabytes, and a rough transcoding compute estimate from stated assumptions. It handles bits versus bytes correctly and uses the numbers to justify a CDN and storage tiering. Penalize errors of an order of magnitude or more (a common one is mixing up Gbps and Tbps or bits and bytes), or numbers that never drive a decision.',
      },
      {
        id: 'architecture_design',
        title: 'Architecture design',
        weight: 25,
        minScore: 50,
        description:
          'A strong answer uploads directly to object storage (e.g. resumable or multipart uploads with pre-signed URLs) or through a dedicated upload tier that streams to storage, rather than buffering whole files on general application servers, triggers an asynchronous pipeline (validate, transcode into an ABR ladder, package into an adaptive streaming format, generate thumbnails, publish) coordinated by queues or a workflow, and serves segments and manifests through a CDN backed by object storage, with metadata from a separate service. Pre-packaged or just-in-time packaging, HLS, DASH or CMAF, chunked-parallel or whole-file transcoding are all acceptable if the publish-time target is met. Private videos need short-lived signed URLs or tokens checked at the edge. Penalize serving video bytes from application servers or a database, synchronous transcoding inside the upload request, or no adaptive bitrate.',
      },
      {
        id: 'database_design',
        title: 'Database design',
        weight: 15,
        description:
          'A strong answer puts video bytes in object storage and keeps metadata (video id, owner, title, visibility, status, rendition and manifest locations, durations) in a database chosen for its access patterns: point reads by video id at high rate, listing a creator’s videos, and status updates from the pipeline. It handles view counts separately from the metadata row, e.g. aggregating view events in a stream or counter store and flushing periodically, to avoid hot-row writes on popular videos. Any database family is acceptable with justification. Penalize storing video data as database blobs, incrementing a single counter row synchronously on every view, or no clear key/index for the main reads.',
      },
      {
        id: 'scalability_reliability',
        title: 'Scalability and reliability',
        weight: 20,
        minScore: 50,
        description:
          'A strong answer achieves a high CDN cache hit ratio (popular content cached at the edge, an origin shield or mid-tier cache to protect origin), places origin storage or replicas in or near each viewer region, and tiers storage for the long tail (colder storage for rarely watched renditions and sources). The transcoding fleet scales with queue depth, retries failed jobs idempotently, and isolates poison files. It explains what happens when a CDN, a region or the pipeline fails (multi-CDN or regional failover, playback continuing while uploads queue), and keeps metadata available with replication and caching. Penalize single-region origins with no failover, no caching strategy for the long tail versus hot content, or a pipeline where a crashed worker loses or duplicates published output.',
      },
      {
        id: 'tradeoff_reasoning',
        title: 'Trade-off reasoning',
        weight: 15,
        description:
          'A strong answer weighs choices such as segment length (start time and adaptation speed vs request overhead and encoding efficiency), pre-packaging every format vs just-in-time packaging (storage vs origin compute and cache fragmentation), chunked-parallel vs whole-file transcoding (publish latency vs complexity and quality at chunk boundaries), encoding the full ladder up front vs on demand for the long tail, and one CDN vs several (cost and simplicity vs resilience). It ties each choice to the egress budget, the publish-time target or the team size. Penalize technology lists with no alternatives, or claims that a choice has no cost.',
      },
    ],
  },
  remediation: {
    requirements_understanding: [
      'intro-to-system-design',
      'cdn-object-storage',
    ],
    capacity_estimation: [
      'intro-to-system-design',
      'cdn-object-storage',
      'horizontal-vertical-scaling',
    ],
    architecture_design: [
      'cdn-object-storage',
      'async-processing',
      'message-queues',
    ],
    database_design: ['sql-vs-nosql', 'database-sharding', 'cache-strategies'],
    scalability_reliability: [
      'multi-region-architecture',
      'cdn-object-storage',
      'fault-tolerance',
    ],
    tradeoff_reasoning: ['cdn-object-storage', 'async-processing'],
  },
  fieldHints: {
    capacity:
      'Work out peak egress in bits per second and storage in bytes, and say which of the two drives cost.',
    architecture:
      'Trace two journeys: a creator uploading a file until it is published, and a viewer pressing play until the third segment arrives.',
    scalability:
      'Treat hot videos and the long tail separately: where does each one’s bytes come from?',
  },
}

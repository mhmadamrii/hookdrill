import type { CalibrationSample } from '../../types'

export const samples: CalibrationSample[] = [
  {
    id: 'video-pass-hls-chunked',
    label:
      'Strong: chunked-parallel transcoding, pre-packaged HLS, CDN with origin shield',
    expect: 'pass',
    note: 'Correct and complete: direct-to-storage resumable uploads, a queue-driven pipeline with chunk-parallel transcoding that meets the publish target, pre-packaged HLS served via CDN and an origin shield, signed URLs for private videos, tiered storage for the long tail, aggregated view counts, and capacity math with bits and bytes handled correctly.',
    answers: {
      functional:
        'Resumable uploads up to 4 GB with a status page (uploading, processing, published, failed). Processing into a 240p-1080p ladder, thumbnails and an HLS package. Playback with adaptive bitrate and seeking on web, mobile and TV. Visibility settings (public, unlisted, private) and deletion. Approximate view counts. Out: live, recommendations, comments, DRM, ads, and search beyond listing a creator’s videos.',
      nonFunctional:
        'Playback start p95 < 2 s, rebuffer < 1% of watch time, playback 99.95%, upload/processing 99.9%. Publish within 15 minutes of upload completion for a 10-minute video. Source and renditions stored with 11-nines-class object storage durability. Metadata reads are low-latency and can be eventually consistent for a few seconds, except visibility changes, which must take effect on new playback sessions within a minute.',
      capacity:
        'Egress: 2M concurrent x 3 Mbps = 6 Tbps at peak. Segment requests: with 5 s segments each viewer fetches one every 5 s, so 2M / 5 = 400k requests/s, plus manifest refreshes; this must be the CDN’s job. Views: 20M x 45 min / 7 min average is about 130M plays/day, about 1.5k/s average and maybe 5k/s at peak for metadata and play-start calls. Ingest: 50k x 500 MB = 25 TB/day of source. Renditions: 10 Mbps x 420 s = 4,200 Mb, about 525 MB per video, so about 26 TB/day. Total about 51 TB/day, about 18 PB/year, so storage tiering matters. Transcoding: 50k x 7 min = 350k minutes/day; assuming a worker encodes the whole ladder for one minute of source in 2 minutes, that is 700k worker-minutes/day, about 490 workers on average and about 1,500 at a 3x peak. Egress (6 Tbps) is the main cost driver, storage second.',
      api: 'POST /videos {title, sizeBytes} returns {videoId, uploadId} and creates the video in UPLOADING. GET /videos/{id}/upload-parts?from=n returns pre-signed URLs for multipart parts; the client PUTs 16 MB parts straight to object storage and can resume from the last acknowledged part. POST /videos/{id}/upload-complete {parts[]} finalizes and enqueues processing. GET /videos/{id} returns metadata and status. GET /videos/{id}/play returns a manifest URL with a short-lived signed token (required for private videos). PATCH /videos/{id} {visibility}, DELETE /videos/{id}. POST /views {videoId, sessionId} is a fire-and-forget beacon.',
      database:
        'Video bytes: object storage, with sources under /src/{videoId} and HLS output under /hls/{videoId}/{rendition}/. Metadata: a horizontally scalable key-value/wide-column store keyed by videoId (owner, title, visibility, status, durations, manifest path), plus a secondary table keyed by (ownerId, createdAt) for a creator’s list. 50M videos x ~2 KB is only about 100 GB, so a relational database with read replicas would also work; I picked a key-value store for simple horizontal reads at 5k/s+. View counts: beacons go to a stream, a consumer aggregates per video per minute and adds the delta to a counter table; the displayed count is cached.',
      architecture:
        'Upload: 1. Client calls POST /videos, uploads parts directly to the nearest region’s object storage via pre-signed URLs. 2. upload-complete puts a job on the processing queue. Processing: 3. A splitter validates the file, extracts audio, and cuts the video into ~10 s GOP-aligned chunks. 4. Chunk jobs fan out to a transcoding fleet; each chunk is encoded into every rendition. 5. When all chunks finish (tracked in a job table), a packager concatenates them and writes HLS segments (6 s) and manifests, plus thumbnails. 6. The video flips to PUBLISHED and the metadata cache is invalidated. Playback: 7. Player calls /play, gets a signed manifest URL on the CDN. 8. CDN edge serves manifest and segments; misses go to a regional origin shield, then to object storage. A 10-minute video becomes 60 chunks, so with enough idle workers it encodes in a few minutes, well inside 15.',
      scalability:
        'CDN with an origin shield per region so each segment is fetched from storage roughly once per region; target edge hit ratio above 95% for popular content. Object storage is replicated to the three viewer regions for videos above a popularity threshold; long-tail renditions live in one region in an infrequent-access tier, and sources move to archive storage after 30 days. The transcoding fleet autoscales on queue depth and uses interruptible spot capacity for chunk jobs, since a lost chunk is simply retried. Metadata service is stateless, with an in-memory cache in front of the key-value store; hot videos’ metadata is cached with a short TTL.',
      failures:
        'Upload interrupted: client resumes from the last completed part; incomplete multipart uploads are garbage-collected after 7 days. Transcode worker dies: the queue message becomes visible again and another worker redoes the chunk; output paths are deterministic (videoId/rendition/chunk), so a retry overwrites the same object rather than duplicating. A file that fails 3 times goes to a dead-letter queue and the video is marked FAILED with a reason. Publishing is the last step and is idempotent. CDN degradation: the player falls back to a secondary CDN hostname in the manifest. Region loss: playback is served from the other regions’ replicas for popular content; the long tail may be slower or briefly unavailable, which I accept. Private videos: tokens expire in minutes, so a copied link stops working.',
      tradeoffs:
        'Chunk-parallel transcoding meets the 15-minute target for long uploads but needs GOP-aligned splitting and careful stitching, and per-chunk rate control can make quality slightly uneven. Pre-packaging HLS only (fMP4 segments work on modern web, mobile and TV players) avoids storing two formats; older devices that need another format are out of scope. 6 s segments balance request overhead against startup time and adaptation speed; 2 s would start faster but triple request load. Replicating only popular content to all regions saves storage but makes a cold video slower for distant viewers.',
    },
  },
  {
    id: 'video-pass-dash-jit',
    label:
      'Strong: CMAF mezzanine with just-in-time DASH/HLS packaging and staged encoding',
    expect: 'pass',
    note: 'A genuinely different valid pipeline: whole-file encoding per rendition with a fast first pass, a single fMP4 mezzanine per rendition, and just-in-time packaging at regional origins into DASH or HLS, plus multi-CDN. It trades origin compute for storage and must score well despite differing from the pre-packaged chunked approach.',
    answers: {
      functional:
        'Upload with resume and status, transcoding into a bitrate ladder, adaptive playback on all device types, private/unlisted/public visibility, delete, and view counts that may lag. I add one feature: videos publish first with a reduced ladder and gain higher renditions shortly after. Excluded: live, recommendations, comments, DRM, ads.',
      nonFunctional:
        'p95 start under 2 s, rebuffer under 1%, playback 99.95%, processing 99.9%. 10-minute video watchable within 15 minutes. Visibility changes apply to new sessions immediately and to running sessions when their token expires (under 10 minutes). Durable storage for sources and renditions. Cost: origin egress kept under 5% of total egress through caching.',
      capacity:
        'Peak egress = 2M viewers x 3 Mbps = 6 Tbps, i.e. 6,000 Gbps, which only a CDN can serve economically. Segment requests at 4 s segments: 2M / 4 = 500k/s. Ingest: 50k/day x 0.5 GB = 25 TB/day. Renditions: ladder at about 10 Mbps total x 420 s / 8 = about 525 MB per video, about 26 TB/day; since we store one CMAF copy rather than one per format, that is all, about 9.5 PB/year of renditions plus 9 PB/year of sources. Transcoding: assume a 16-vCPU worker encodes 240p/480p at about 4x realtime, 360p/720p at 2x and 1080p at 1x. Fast pass (360p and 720p on separate workers) for a 10-minute video takes about 5 minutes. Per source minute the full ladder costs 0.25 + 0.25 + 0.5 + 0.5 + 1 = 2.5 worker-minutes, so 350k source-minutes/day needs about 875k worker-minutes/day, about 610 workers on average and roughly 1,800 at a 3x peak.',
      api: 'POST /uploads returns a resumable upload session URL on object storage (the client sends byte ranges and can query the committed offset after a disconnect). POST /uploads/{id}/finish creates the processing job. GET /videos/{id} -> {status, visibility, renditionsReady}. GET /videos/{id}/manifest.mpd or /master.m3u8 via the CDN, with a signed cookie or token minted by GET /videos/{id}/playback-token. PATCH and DELETE /videos/{id}. Views are reported by the player as batched heartbeat events.',
      database:
        'Object storage for sources and CMAF mezzanines (one fragmented MP4 per rendition plus an index). Metadata in a relational database: videos(id PK, owner_id, title, visibility, status, duration, created_at) with an index on (owner_id, created_at), and renditions(video_id, height, bitrate, path, ready). 50M rows is small; reads are served from read replicas and a cache, writes are only uploads and pipeline status updates (a few per second). View heartbeats go to a stream and are rolled up every minute into a counts table; play counts are never incremented synchronously.',
      architecture:
        '1. Client uploads to object storage in its nearest region via a resumable session. 2. finish emits an UploadCompleted event; a workflow orchestrator runs: probe/validate -> fast pass (360p, 720p) in parallel workers -> mark PUBLISHED -> full pass (240p, 480p, 1080p) -> add renditions. 3. Each rendition job encodes the whole file into a CMAF fMP4 with aligned 4 s fragments. 4. Playback: the player asks for a manifest from the CDN; on a miss the request goes to a regional just-in-time packager, which reads the CMAF index and generates a DASH or HLS manifest and segments from byte ranges of the same file. 5. The CDN caches both formats’ outputs. 6. Edge validates the signed token before serving private content.',
      scalability:
        'Two CDNs behind DNS-based steering by performance and cost; both point at regional origins (packager clusters) in the three viewer regions with an origin shield in front. Packagers are stateless and autoscale on request rate; because they only rewrap bytes they are cheap, and the shield collapses concurrent misses for the same segment into one origin fetch. Popular renditions are replicated to all three regions; the long tail stays in its upload region in a colder tier, and 1080p of videos with fewer than 100 views in 90 days is deleted and regenerated on demand from the source. Transcoding runs on autoscaled workers fed by the workflow’s task queues.',
      failures:
        'Workflow steps are durable and retried with backoff; encoding outputs go to deterministic paths and a rendition is marked ready only after its file and index are fully written, so a crashed worker never publishes a partial file. Corrupt or unsupported sources fail fast in the probe step and notify the creator. A packager crash just turns into a CDN retry against another instance. If one CDN degrades, steering moves traffic to the other within minutes. If a region’s origin fails, its shield falls back to another region’s replica for popular content; long-tail videos uploaded there are unavailable until recovery, an accepted risk at 99.95%. If processing is backed up, playback is unaffected, and new uploads show “processing” longer.',
      tradeoffs:
        'Just-in-time packaging stores one copy per rendition instead of one per format, saving a large share of rendition storage, at the cost of an origin compute tier and slightly higher latency on cache misses; pre-packaging would be simpler to operate. Whole-file encoding avoids chunk-boundary artifacts and stitching but cannot speed up a single long file, so I meet the 15-minute target with a reduced first ladder instead. Deleting long-tail 1080p saves storage but means a rare viewer may wait for regeneration or get 720p. Two CDNs cost more engineering and contract overhead but remove the CDN as a single point of failure.',
    },
  },
  {
    id: 'video-fail-shallow',
    label: 'Weak: generic and vague',
    expect: 'fail',
    note: 'Mentions a CDN and a queue but never describes the upload path, adaptive bitrate packaging, privacy, or failure handling, and has no numbers. It should score well below the pass mark.',
    answers: {
      functional: 'Users upload videos and other users watch them.',
      nonFunctional:
        'The system should be fast, highly available and scalable to millions of users.',
      capacity:
        'Videos are large, so we need a lot of storage and bandwidth. We will use the cloud so it can grow as needed.',
      api: 'POST /upload uploads a video. GET /video/{id} plays a video.',
      database:
        'We will use a NoSQL database because it scales well, and S3 for the video files.',
      architecture:
        'Users upload to the server, which saves to S3 and sends a message to a queue. A worker converts the video. Users watch through a CDN.',
      scalability:
        'The CDN handles scaling for video. We will add more servers and workers when needed.',
      failures:
        'If a worker fails, the queue will retry. We will monitor errors.',
      tradeoffs:
        'A CDN costs money but makes videos load faster. NoSQL is faster than SQL.',
    },
  },
  {
    id: 'video-fail-wrong',
    label: 'Weak: confident but incorrect',
    expect: 'fail',
    note: 'Detailed but wrong: peak egress is understated by 1,000x (Gbps vs Tbps), video bytes are stored as database blobs and streamed from app servers in one region with no CDN, transcoding runs synchronously in the upload request, and there is no adaptive bitrate. These are fundamental errors, not preferences.',
    answers: {
      functional:
        'Upload, transcode to a single 1080p MP4 so every viewer gets the best quality, playback, privacy and view counts.',
      nonFunctional:
        'Start time under 2 s and 100% availability. Strong consistency for view counts so they are always exact.',
      capacity:
        'Peak bandwidth is 2M viewers x 3 Mbps = 6 Gbps, which a few 10 Gbps network cards can handle, so we do not need a CDN. Storage is 50k uploads x 500 MB = 25 GB per day.',
      api: 'POST /videos uploads the whole file in one request; the response returns when transcoding is done. GET /videos/{id}/stream returns the full MP4 file.',
      database:
        'Videos are stored as BLOB columns in a PostgreSQL table next to their metadata, so a video and its data are always consistent. Each play runs UPDATE videos SET views = views + 1 WHERE id = ? inside the playback request.',
      architecture:
        'A load balancer in front of 20 app servers in our US region. The upload request writes the file to the database and runs the transcoder in the same request. Playback requests read the BLOB from the database and stream it to the client. Private videos are protected because their URLs are hard to guess.',
      scalability:
        'We scale app servers vertically. The database is one large primary; video bytes are cached in app server memory so popular videos do not hit the database.',
      failures:
        'If the upload request times out, the user uploads again. If the database fails, we restore from backup. App servers are stateless so they can be restarted.',
      tradeoffs:
        'Skipping the CDN saves a lot of money. Serving one 1080p file is simpler than adaptive bitrate and gives better quality for everyone.',
    },
  },
]

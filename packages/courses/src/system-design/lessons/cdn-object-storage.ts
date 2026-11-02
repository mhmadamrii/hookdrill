import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'cdn-object-storage',
  title: 'CDN and Object Storage',
  summary:
    'Large files belong in object storage, a service that stores whole files under keys and serves them over HTTP. A content delivery network keeps cached copies of them at edge locations near users, steered by Cache-Control headers. Together they take heavy, static traffic off your app servers.',
  minutes: 18,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-cdn-object-storage-1',
      text: 'describe how object storage organises data (buckets, keys, objects, metadata) and explain why large files belong there rather than in your database or on an app server’s disk.',
    },
    {
      id: 'sd-cdn-object-storage-2',
      text: 'explain how a CDN serves a request from an edge cache or from the origin, and choose Cache-Control directives for static assets and for personalised responses.',
    },
    {
      id: 'sd-cdn-object-storage-3',
      text: 'design upload and delivery paths that use presigned URLs for direct transfers and versioned file names instead of cache invalidation.',
    },
  ],
  concept: [
    {
      heading: 'Big files, far-away users',
      blocks: [
        {
          type: 'text',
          md: 'Picture a photo-sharing app that started simply: uploads go to the app server, which saves them to its local disk and serves them back. Two problems show up as it grows.\n\n- **More servers break it.** Once a load balancer spreads traffic across several app servers, a photo saved on server A is missing when the request lands on server B. App servers should be interchangeable, so files cannot live on their disks.\n- **Distance costs time.** From Networking Basics you know every request pays for round trips. A user on another continent waits on a long network path for every image, and every byte also costs your servers bandwidth that could have gone to real application work.\n\nTwo services fix these. **Object storage** gives files a durable home that every server can reach over HTTP. A **content delivery network (CDN)** keeps cached copies of those files on servers close to users. Caching Fundamentals introduced caches in general; a CDN is a shared cache spread around the world, and HTTP headers tell it what it may keep and for how long.',
        },
      ],
    },
    {
      heading: 'Object storage and the CDN, precisely',
      blocks: [
        {
          type: 'text',
          md: '**Object storage.** Amazon S3 is the best-known example; Google Cloud Storage and Azure Blob Storage work along the same lines. In S3’s terms:\n\n- A **bucket** is a container for objects.\n- An **object** is a file plus **metadata**: name-value pairs such as `Content-Type` and last-modified date, and any custom metadata you add.\n- A **key** is the object’s unique name inside the bucket, such as `photos/puppy.jpg`. In S3 general purpose buckets the key space is flat; the slashes are part of the name, and "folders" are just shared prefixes.\n- You work with whole objects over an HTTP API: `PUT` to store, `GET` to read, `DELETE` to remove. To change an object you upload a replacement.\n\nS3 documents **strong read-after-write consistency**: once a `PUT` succeeds, later reads return the new data. If two clients write the same key at the same time, the last write wins; there is no locking. Objects are **private by default**.\n\nObject storage suits large, mostly unchanging files: images, video, backups, exports, static site assets. It is not a database: there are no queries or joins over file contents, so the **metadata you search on** (owner, title, upload time, the object key) goes in your database, which stores a reference to the object.\n\n**Presigned URLs.** To let a browser upload or download a private object without your server handling the bytes, your server creates a **presigned URL**: a URL signed with your credentials that allows one operation (for example `PUT` on one key) until it expires. S3 allows up to 7 days with long-term credentials, and a URL expires sooner if the credentials that signed it expire first. AWS calls these URLs **bearer tokens**: anyone holding one can use it, as many times as they like, until it expires.\n\n**The CDN.** A CDN is a network of edge servers in many locations. With Amazon CloudFront, a request is routed to the edge location that gives the lowest latency. If that edge has a cached copy (a **hit**), it answers immediately. If not (a **miss**), it fetches the file from the **origin** you configured, such as an S3 bucket or your web server, returns it, and keeps a copy for the next request according to the caching rules.\n\n**Cache-Control** headers from the origin set those rules. The ones that matter most:\n\n- `max-age=N`: the response is fresh for N seconds; browsers and shared caches may reuse it without asking the origin.\n- `s-maxage=N`: a lifetime for **shared caches only** (CDNs, proxies). It overrides `max-age` there; browsers ignore it.\n- `public` / `private`: `private` means only the user’s own browser may store it, never a shared cache such as a CDN.\n- `no-cache`: caches **may store** the response but **must revalidate** it with the origin before every reuse. It does not mean "do not cache".\n- `no-store`: no cache, private or shared, may store the response at all.\n- `immutable`: the response will not change while fresh, so clients need not revalidate it even on reload.\n\n**Revalidation** is cheap when the origin sends a validator. With an `ETag`, the cache asks `If-None-Match: "<etag>"`; if nothing changed, the origin replies **`304 Not Modified`** with no body and the cache reuses its copy.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Object storage',
              definition:
                'A service that stores whole files as objects in buckets, each addressed by a key and read or written over an HTTP API.',
            },
            {
              term: 'Presigned URL',
              definition:
                'A time-limited URL, signed with the owner’s credentials, that lets whoever holds it perform one operation, such as uploading or downloading a specific object.',
            },
            {
              term: 'Edge location',
              definition:
                'A CDN site close to users where cached copies of content are kept and served.',
            },
            {
              term: 'Origin',
              definition:
                'The source of truth a CDN fetches from on a cache miss, such as a storage bucket or a web server.',
            },
            {
              term: 'Shared cache',
              definition:
                'A cache that serves responses to many users, such as a CDN or proxy. Its opposite is a private cache, such as one browser’s cache.',
            },
            {
              term: 'Cache busting',
              definition:
                'Putting a version or content hash in a file’s URL, so a changed file gets a new URL and old cached copies are simply never requested again.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Two paths: uploading and delivering',
      blocks: [
        {
          type: 'diagram',
          caption:
            'Uploads go straight from the browser to object storage with a presigned URL; the API only hands out the URL and records metadata. Downloads go through the CDN edge, which fetches from the bucket only on a miss.',
          nodes: [
            { id: 'browser', label: 'Browser', kind: 'client', col: 0, row: 2 },
            { id: 'edge', label: 'CDN edge', kind: 'cache', col: 2, row: 0 },
            {
              id: 'api',
              label: 'API service',
              kind: 'service',
              col: 2,
              row: 3,
            },
            {
              id: 'bucket',
              label: 'Object storage bucket',
              kind: 'store',
              col: 4,
              row: 1,
            },
            { id: 'db', label: 'Metadata DB', kind: 'store', col: 4, row: 4 },
          ],
          edges: [
            { from: 'browser', to: 'edge', label: 'GET image' },
            { from: 'edge', to: 'bucket', label: 'on miss: fetch' },
            { from: 'browser', to: 'api', label: 'ask for upload URL' },
            {
              from: 'browser',
              to: 'bucket',
              label: 'PUT via presigned URL',
              dashed: true,
            },
            { from: 'api', to: 'db', label: 'save key + owner' },
          ],
        },
        {
          type: 'example',
          title: 'Uploading and serving a profile photo',
          md: '1. The browser asks the API: "I want to upload a JPEG for my profile."\n2. The API checks the user is logged in, picks a new key such as `avatars/7f3c2a.jpg`, and returns a presigned `PUT` URL for that key that expires in a few minutes.\n3. The browser uploads the file straight to the bucket. The app server never touches the bytes.\n4. The browser tells the API the upload finished. The API records the key against the user in the database.\n5. Pages show the photo through the CDN, at a URL containing that key. The first viewer near a given edge causes a miss and a fetch from the bucket; later viewers there get a hit.\n6. When the user changes their photo, it gets a **new key**. Nothing needs to be purged: pages simply point at the new URL, and the old copy ages out of caches.\n\nBecause each key’s content never changes, the photo can be served with a long `max-age` and `immutable`.',
        },
      ],
    },
    {
      heading: 'How real systems use them',
      blocks: [
        {
          type: 'text',
          md: '- **Versioned asset names.** MDN recommends cache busting for static assets: put a version or hash in the URL, serve those files with a long `max-age` plus `immutable`, and serve the HTML that references them with `no-cache` so browsers always revalidate it and pick up new asset URLs.\n- **Versioning over invalidation.** CloudFront lets you invalidate (purge) cached paths, but its documentation recommends versioned file names for files you update often. The reasons it gives include that an invalidation does not reach copies already held in browsers or corporate proxies, and that invalidations can cost money while versioning does not.\n- **Personalised responses.** MDN warns that personalised content must not be stored in a shared cache. Mark it `private`; for personalised HTML that must stay current, MDN suggests `no-cache, private`.\n- **Private files.** S3 objects are private by default. Apps share them with presigned URLs, and CloudFront can serve private content with signed URLs or signed cookies.\n- **Default lifetimes.** If the origin sends no caching headers, CloudFront documents a default of 24 hours at the edge. Relying on defaults is risky; set `Cache-Control` explicitly.',
        },
      ],
    },
  ],
  application: {
    heading: 'Serving user uploads at scale, and the limits',
    blocks: [
      {
        type: 'text',
        md: 'A typical media path: the client uploads directly to object storage with a presigned URL, the database stores the object key and ownership, and every read goes through a CDN whose origin is the bucket. App servers handle only small JSON requests, so they stay stateless and easy to scale.\n\nWhere it falls short:\n\n- **Only cacheable content benefits.** Responses that differ per user, or that must be fresh on every request, either cannot be shared at the edge or need revalidation that still reaches the origin.\n- **The first request per edge is a miss.** A file viewed once in each region gains little from a CDN. CDNs pay off for content many people request.\n- **Purges are slow to fully take effect.** Even after a CDN invalidation, browsers and other caches can keep serving a copy until its lifetime ends. New URLs are the reliable way to change content.\n- **Presigned URLs leak like passwords.** Anyone with the URL can use it until it expires, so keep expiry short and scope each URL to one key and one method.\n- **Concurrent writes to one key are last-writer-wins.** If two uploads target the same key, one silently replaces the other. Unique keys per upload avoid the problem.',
      },
    ],
  },
  misconceptions: [
    {
      claim: '`Cache-Control: no-cache` means the response is never cached.',
      correction:
        '`no-cache` lets caches store the response but requires them to revalidate it with the origin before each reuse. To forbid storing it at all, use `no-store`.',
    },
    {
      claim:
        'A CDN keeps all of your files, so it can replace your origin storage.',
      correction:
        'A CDN caches copies at the edge for as long as the caching rules allow, and fetches from the origin on a miss. The origin, such as a storage bucket, remains the source of truth.',
    },
    {
      claim:
        'Invalidating a path on the CDN guarantees every user sees the new file right away.',
      correction:
        'An invalidation clears the CDN’s copies, but browsers and corporate proxies may keep their own copies until they expire. Versioned file names avoid the problem because the new file has a new URL.',
    },
  ],
  questions: [
    {
      id: 'sd-cdn-object-storage-q1',
      objective: 'sd-cdn-object-storage-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'In Amazon S3, what uniquely identifies an object within a bucket?',
      options: [
        {
          id: 'a',
          text: 'A hash of the object’s contents, computed when it is uploaded',
          explanation:
            'Objects are addressed by name, not by content. Two different keys can hold identical bytes.',
        },
        {
          id: 'b',
          text: 'Its folder path inside a directory tree stored on one disk',
          explanation:
            'General purpose buckets have a flat key space; slashes in a key only look like folders.',
        },
        {
          id: 'c',
          text: 'Its key, plus a version ID when bucket versioning is on',
          explanation:
            'Correct. Bucket, key and (with versioning) version ID together identify an object.',
        },
        {
          id: 'd',
          text: 'The time the object was uploaded, down to the millisecond',
          explanation:
            'Upload time is metadata. Writing the same key again replaces the object rather than creating a new identity.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-cdn-object-storage-q2',
      objective: 'sd-cdn-object-storage-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which Cache-Control directive sets a freshness lifetime that applies only to shared caches such as a CDN?',
      options: [
        {
          id: 'a',
          text: '`s-maxage`',
          explanation:
            'Correct. Shared caches use it in place of max-age; private caches such as browsers ignore it.',
        },
        {
          id: 'b',
          text: '`max-age`',
          explanation:
            'max-age applies to every cache, browsers included, unless a shared cache has an s-maxage to use instead.',
        },
        {
          id: 'c',
          text: '`private`',
          explanation:
            'private stops shared caches from storing the response at all; it does not give them a lifetime.',
        },
        {
          id: 'd',
          text: '`immutable`',
          explanation:
            'immutable says the response will not change while fresh. It does not set a lifetime or target shared caches.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-cdn-object-storage-q3',
      objective: 'sd-cdn-object-storage-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'What does `Cache-Control: no-cache` on a response tell caches?',
      options: [
        {
          id: 'a',
          text: 'No cache, private or shared, may store any part of the response',
          explanation: 'That is no-store. no-cache allows storing.',
        },
        {
          id: 'b',
          text: 'Only the user’s own browser may store it, never a shared cache',
          explanation:
            'That is private. no-cache does not restrict which caches may store the response.',
        },
        {
          id: 'c',
          text: 'Caches may serve a stale copy while fetching a fresh one in the background',
          explanation:
            'That describes stale-while-revalidate, the opposite of forcing a check first.',
        },
        {
          id: 'd',
          text: 'Caches may store it but must revalidate with the origin before each reuse',
          explanation:
            'Correct. With a validator such as an ETag, revalidation often returns a cheap 304 Not Modified.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-cdn-object-storage-q4',
      objective: 'sd-cdn-object-storage-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A user requests an image from a CDN edge location that has no copy of it. What normally happens?',
      options: [
        {
          id: 'a',
          text: 'The edge returns 404 until someone pushes the file to that location',
          explanation:
            'A CDN such as CloudFront does not need files pushed in advance; it fetches what it lacks from the origin.',
        },
        {
          id: 'b',
          text: 'The edge fetches it from the origin, returns it, and keeps a copy per the caching rules',
          explanation:
            'Correct. This is a cache miss. Later requests at that edge can be hits while the copy is fresh.',
        },
        {
          id: 'c',
          text: 'The edge permanently redirects the browser to download from the origin itself',
          explanation:
            'Redirecting would skip the edge for good, losing the benefit of the CDN. The edge fetches on the user’s behalf.',
        },
        {
          id: 'd',
          text: 'The edge waits until the next scheduled sync copies every file from the origin',
          explanation:
            'CDNs fetch on demand, per request. They do not copy the whole origin on a schedule.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-cdn-object-storage-q5',
      objective: 'sd-cdn-object-storage-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why do most designs keep user-uploaded videos in object storage rather than in database BLOB columns or on app server disks?',
      options: [
        {
          id: 'a',
          text: 'It serves large files over HTTP, scales apart from app servers, and keeps the database small',
          explanation:
            'Correct. App servers stay stateless, the database holds only metadata, and the bucket can sit behind a CDN.',
        },
        {
          id: 'b',
          text: 'It supports SQL queries and joins across the contents of stored files',
          explanation:
            'Object storage has no query language over file contents. Searchable metadata belongs in the database.',
        },
        {
          id: 'c',
          text: 'It lets you edit bytes in the middle of a large file faster than a database can',
          explanation:
            'You replace a whole object to change it. In-place partial edits are not how object storage works.',
        },
        {
          id: 'd',
          text: 'Relational databases are unable to store binary data of any size',
          explanation:
            'Databases can store binary columns. The reasons are cost, size and load, not impossibility.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-cdn-object-storage-q6',
      objective: 'sd-cdn-object-storage-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Mobile clients upload videos of several gigabytes. Each upload streams through your API servers, which then write it to object storage, tying the servers up for minutes. What is the best change?',
      options: [
        {
          id: 'a',
          text: 'Raise the API servers’ request timeouts so long uploads stop failing',
          explanation:
            'This hides the symptom; the servers are still busy relaying every byte.',
        },
        {
          id: 'b',
          text: 'Buffer each upload in Redis first, then copy it to object storage',
          explanation:
            'An in-memory cache is a poor and costly place for multi-gigabyte files, and the bytes still pass through your servers.',
        },
        {
          id: 'c',
          text: 'Put the CDN in front of the upload endpoint so it caches incoming uploads',
          explanation:
            'A CDN caches responses to reads. Uploads are writes; caching them would not take load off the API.',
        },
        {
          id: 'd',
          text: 'Have the API return a short-lived presigned PUT URL so clients upload to storage directly',
          explanation:
            'Correct. The API only authorises the upload and records the key; the bytes go straight to object storage.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-cdn-object-storage-q7',
      objective: 'sd-cdn-object-storage-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'You deploy a new `/app.js` several times a day. It is served with `max-age=31536000`, and after each deploy some users keep running the old script. Which fix follows recommended practice?',
      options: [
        {
          id: 'a',
          text: 'Keep the name `/app.js` and invalidate that path on the CDN after each deploy',
          explanation:
            'Invalidation clears the CDN, but browsers that cached /app.js for a year keep using their copy.',
        },
        {
          id: 'b',
          text: 'Put a content hash in the name, cache it long with `immutable`, and serve the HTML with `no-cache`',
          explanation:
            'Correct. Each build gets a new URL, and the always-revalidated HTML points browsers to it.',
        },
        {
          id: 'c',
          text: 'Serve `/app.js` with `no-store` so no browser or CDN ever keeps a copy',
          explanation:
            'This removes staleness by throwing caching away entirely: every page view downloads the script again.',
        },
        {
          id: 'd',
          text: 'Set `s-maxage=0` on the HTML pages and leave `/app.js` exactly as it is',
          explanation:
            'The stale file is app.js in browser caches; changing the HTML’s CDN lifetime does not affect it.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-cdn-object-storage-q8',
      objective: 'sd-cdn-object-storage-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        '`GET /api/me` returns the logged-in user’s profile and passes through your CDN. Which header stops the CDN from serving one user’s profile to another, while still letting the browser keep a copy that it revalidates?',
      options: [
        {
          id: 'a',
          text: '`Cache-Control: public, max-age=300`',
          explanation:
            'public allows shared caches to store it, so the CDN could hand one user’s profile to others.',
        },
        {
          id: 'b',
          text: '`Cache-Control: s-maxage=60`',
          explanation:
            's-maxage gives shared caches a lifetime, which invites the CDN to store the personalised response.',
        },
        {
          id: 'c',
          text: '`Cache-Control: private, no-cache`',
          explanation:
            'Correct. private keeps it out of shared caches; no-cache lets the browser store it but revalidate before reuse.',
        },
        {
          id: 'd',
          text: '`Cache-Control: no-store`',
          explanation:
            'This keeps it out of the CDN, but also stops the browser storing it, which the question wanted to allow.',
        },
      ],
      answer: 'c',
    },
  ],
  scenario: {
    prompt:
      'A recipe-sharing site lets users upload photos of their dishes (illustratively, up to 20 MB each). Today the app server saves photos to its local disk and serves them itself. Most visitors are on other continents from the single server, pages load slowly, and when the team added a second app server behind a load balancer, about half the photos started returning 404.\n\nRedesign how photos are uploaded, stored and delivered. Say where the bytes go, what the database stores, which URLs and Cache-Control headers you use, and how a user replacing a photo is handled.',
    modelAnswer:
      '**Why it broke.** Photos live on one server’s disk, so a request routed to the other server cannot find them. Serving them from one far-away location also makes every image slow.\n\n**Storage.** Move photos to an **object storage bucket** (kept private). Each upload gets a new, unique key such as `recipes/<recipeId>/<random-id>.jpg`. The database stores only the key, owner, recipe and upload time. App servers then hold no files and are interchangeable.\n\n**Upload path.** The browser asks the API for an upload URL. The API checks the user may edit that recipe, picks the key, and returns a **presigned PUT URL** limited to that key with a short expiry (minutes). The browser uploads directly to the bucket, then calls the API to confirm, and the API records the key. Large uploads no longer tie up app servers.\n\n**Delivery.** Put a **CDN** in front of the bucket as its origin. Pages reference images by CDN URL. The first view near each edge is a miss that fetches from the bucket; later views there are hits close to the user.\n\n**Headers.** Because a key’s content never changes, images get `Cache-Control: public, max-age=31536000, immutable`. Recipe HTML that lists the photos is served with `no-cache` (or a short `s-maxage` at the CDN) so it picks up new image URLs quickly. Anything personalised, such as a "my recipes" page, gets `private`.\n\n**Replacing a photo.** Upload the new photo to a **new key**, update the database to point at it, and the page now references a new URL. No CDN invalidation is needed, and no browser can be stuck on the old image. The old object can be deleted later by a cleanup job.\n\nOther valid answers might proxy uploads through the API for small images, or use CDN invalidation instead of new keys for rare changes, as long as they note the trade-offs (server load, and stale copies in browser caches).',
    checklist: [
      'Explains that files on one app server’s disk break once there are several servers',
      'Stores files in object storage and only keys and metadata in the database',
      'Uploads directly to storage with a short-lived presigned URL scoped to one key',
      'Serves images through a CDN with the bucket as origin',
      'Uses long-lived, immutable caching for images and a short or revalidated policy for HTML that references them',
      'Handles replacement with a new key or versioned URL rather than relying on invalidation',
    ],
  },
  takeaways: [
    'Object storage keeps whole files under keys in buckets, served over HTTP; the database keeps only the key and searchable metadata.',
    'Presigned URLs let clients upload or download directly to storage for a limited time, but anyone holding one can use it until it expires.',
    'A CDN answers from an edge cache on a hit and fetches from the origin on a miss, so it helps most for content many users request.',
    '`no-cache` means store but revalidate before reuse, `no-store` means do not store at all, and `private` keeps a response out of shared caches.',
    'Give changed files new URLs (cache busting) instead of relying on invalidation, which cannot reach copies already in browsers.',
  ],
  references: [
    {
      title: 'What is Amazon S3?',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html',
      kind: 'source',
    },
    {
      title: 'Download and upload objects with presigned URLs',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html',
      kind: 'source',
    },
    {
      title: 'What is Amazon CloudFront?',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html',
      kind: 'source',
    },
    {
      title: 'Invalidate files to remove content',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html',
      kind: 'source',
    },
    {
      title: 'Cache-Control',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
      kind: 'source',
    },
    {
      title: 'HTTP caching',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching',
      kind: 'source',
    },
    {
      title: 'RFC 9111: HTTP Caching',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc9111',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}

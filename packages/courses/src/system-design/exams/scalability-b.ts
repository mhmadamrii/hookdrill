import type { Question } from '../../types'

export const examQuestions: Question[] = [
  {
    id: 'sd-scalability-x5',
    objective: 'sd-async-processing-3',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'Each sign-up sends a welcome email through a provider that allows a fixed number of sends per second. During a launch, sign-ups briefly arrive far faster than that limit. Which design keeps sign-ups fast and emails flowing?',
    options: [
      {
        id: 'a',
        text: 'Send the email inside the sign-up request and retry right away whenever the provider answers 429',
        explanation:
          'Users wait on every send, and immediate retries hit the provider even harder while it is already limiting you.',
      },
      {
        id: 'b',
        text: 'Rate limit the sign-up endpoint to the provider’s send rate so emails can never back up',
        explanation:
          'This turns away new users to protect a non-urgent email. The provider’s limit should shape when emails go out, not who may sign up.',
      },
      {
        id: 'c',
        text: 'Enqueue an email job per sign-up and have workers send through a token bucket set below the provider’s limit',
        explanation:
          'Correct. Sign-up returns immediately, the queue absorbs the burst, and paced workers that back off on 429 drain it within the provider’s limit.',
      },
      {
        id: 'd',
        text: 'Cache the rendered welcome email on the CDN so the provider sees fewer requests',
        explanation:
          'Each user still needs their own send. Caching the email body does not reduce how many sends the provider has to accept.',
      },
    ],
    answer: 'c',
  },
  {
    id: 'sd-scalability-x6',
    objective: 'sd-cdn-object-storage-2',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'A news site serves article pages through a CDN. The page is the same for every reader, and the app builds it from article data cached in Redis with cache-aside. When an editor fixes a typo, the fix should reach readers within about a minute while the CDN still absorbs most traffic. Which combination works?',
    options: [
      {
        id: 'a',
        text: 'Serve the HTML with `max-age=0, s-maxage=60`, and delete the article’s Redis key when the edit is saved',
        explanation:
          'Correct. The CDN copy lives at most 60 seconds, browsers revalidate each time, and the deleted key makes the next rebuild read the edited article.',
      },
      {
        id: 'b',
        text: 'Serve the HTML with `no-store` and stop caching article data in Redis',
        explanation:
          'Edits appear immediately, but every page view now reaches the app and database. The requirement was for the CDN to keep absorbing most traffic.',
      },
      {
        id: 'c',
        text: 'Serve the HTML with `max-age=86400`, and switch the Redis cache to write-back',
        explanation:
          'Browsers and the CDN may keep the old page for a day, and write-back only changes how writes reach the database.',
      },
      {
        id: 'd',
        text: 'Serve the HTML with `private, max-age=60`, and give the Redis key a 60-second TTL',
        explanation:
          'private stops the CDN from storing the page at all, so every request goes to the origin even though the page is identical for everyone.',
      },
    ],
    answer: 'a',
  },
  {
    id: 'sd-scalability-x7',
    objective: 'sd-cache-strategies-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'When a hugely popular cached item expires, thousands of different users miss at the same moment and the database spikes. A teammate proposes a per-user rate limit on that endpoint to protect the database. What is the best response?',
    options: [
      {
        id: 'a',
        text: 'Agree: a per-user limit caps the number of database queries during the expiry',
        explanation:
          'Each user sends only one or two requests, well under any sensible per-user limit, so the limiter would let nearly every one through.',
      },
      {
        id: 'b',
        text: 'Replace it with a global limit that rejects requests once database load is high',
        explanation:
          'Load shedding protects the database, but it fails user requests that one shared rebuild could have served. It treats the symptom.',
      },
      {
        id: 'c',
        text: 'Make the item’s TTL much longer so that it expires far less often',
        explanation:
          'A longer TTL makes the spike rarer but not smaller, and it lets the item stay stale for longer.',
      },
      {
        id: 'd',
        text: 'Explain the spike comes from many users at once; let one request rebuild while others get the old value',
        explanation:
          'Correct. It is a cache stampede. Coalescing or a rebuild lock, with stale values served meanwhile, turns thousands of misses into one query.',
      },
    ],
    answer: 'd',
  },
  {
    id: 'sd-scalability-x8',
    objective: 'sd-async-processing-1',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'Users upload videos that must be transcoded into several resolutions and then streamed worldwide. Which flow is sound?',
    options: [
      {
        id: 'a',
        text: 'The API receives the upload, transcodes it during the request, and returns 200 when every resolution is ready',
        explanation:
          'Transcoding can take minutes, so requests time out and hold servers, and the upload bytes flow through the API as well.',
      },
      {
        id: 'b',
        text: 'Upload via presigned URL, enqueue a transcode job and return 202, have workers write renditions, serve them via CDN',
        explanation:
          'Correct. Bytes skip the app servers, slow work runs in the background with a status to check, and finished files are delivered from the edge.',
      },
      {
        id: 'c',
        text: 'Upload via presigned URL and let the CDN transcode each video the first time a viewer requests it',
        explanation:
          'A CDN caches and delivers what the origin gives it. It is not where the transcoding job runs, and the first viewer would wait for it.',
      },
      {
        id: 'd',
        text: 'Upload to the API server’s disk and have a nightly batch job transcode and copy every video to the CDN',
        explanation:
          'Files on one server’s disk break with several servers, and videos would be unavailable for up to a day.',
      },
    ],
    answer: 'b',
  },
]

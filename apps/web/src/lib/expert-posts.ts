import { createServerFn } from '@tanstack/react-start'
import { fetchTweet, type Tweet } from 'react-tweet/api'

/**
 * Posts by people building software with AI, shown on Builder Lab.
 * Every id was checked against X (author and text) on 2026-10-26.
 */
export const EXPERT_POSTS = [
  { id: '2026731645169185220', author: 'Andrej Karpathy', handle: 'karpathy' },
  { id: '2015883857489522876', author: 'Andrej Karpathy', handle: 'karpathy' },
  {
    id: '2026410054111342650',
    author: 'TBPN (Patrick Collison)',
    handle: 'tbpn',
  },
  {
    id: '2044884503391355326',
    author: 'Gergely Orosz',
    handle: 'GergelyOrosz',
  },
  { id: '2024933972523057610', author: 'Andrej Karpathy', handle: 'karpathy' },
  { id: '2014569897079316482', author: 'Bindu Reddy', handle: 'bindureddy' },
  { id: '2045574058654478472', author: 'Soleio', handle: 'soleio' },
] as const

export type ExpertPost = (typeof EXPERT_POSTS)[number] & { tweet: Tweet | null }

// X rate-limits uncached servers; posts rarely change, so an hour is plenty.
const TTL_MS = 60 * 60 * 1000
const cache = new Map<string, { at: number; tweet: Tweet | null }>()

async function load(id: string): Promise<Tweet | null> {
  const hit = cache.get(id)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.tweet
  try {
    const { data } = await fetchTweet(id)
    const tweet = data ?? null
    cache.set(id, { at: Date.now(), tweet })
    return tweet
  } catch {
    // Network or rate-limit failure: keep a stale copy if we have one.
    return hit?.tweet ?? null
  }
}

/** Fetched on the server, so visitors' browsers never call X's API. */
export const getExpertPosts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ExpertPost[]> =>
    Promise.all(
      EXPERT_POSTS.map(async (p) => ({ ...p, tweet: await load(p.id) })),
    ),
)

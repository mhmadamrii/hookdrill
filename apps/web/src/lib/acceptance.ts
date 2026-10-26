import { useQuery } from '@tanstack/react-query'
import { useTRPC } from './trpc'

/** Below this many attempts a rate is noise, so the UI shows "New" instead. */
export const MIN_ATTEMPTS = 10

/**
 * Real acceptance per problem: the share of users who ran it and passed every
 * test. Until server grading ships, a "pass" is a browser-verified one.
 */
export function useAcceptance() {
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.stats.acceptance.queryOptions(),
    staleTime: 5 * 60_000,
  })
  const bySlug = new Map((query.data ?? []).map((r) => [r.slug, r]))
  const rateOf = (slug: string): number | null => {
    const r = bySlug.get(slug)
    return r && r.attempted >= MIN_ATTEMPTS
      ? (r.solved / r.attempted) * 100
      : null
  }
  return { rateOf, isLoading: query.isPending }
}

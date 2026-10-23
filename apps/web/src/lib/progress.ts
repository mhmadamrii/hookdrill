import { useQuery } from '@tanstack/react-query'
import { useSession } from './auth-client'
import { useTRPC } from './trpc'

export type ProblemStatus = 'solved' | 'attempted' | 'none'

/**
 * The signed-in user's real progress, keyed by slug. "solved" means every
 * public test passed in the browser (phase 1); server grading comes later.
 */
export function useMyProgress() {
  const { data: session, isPending } = useSession()
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.progress.list.queryOptions(),
    enabled: !!session,
  })
  const bySlug = new Map((query.data ?? []).map((p) => [p.slug, p]))
  const status = (slug: string): ProblemStatus => {
    const p = bySlug.get(slug)
    return !p ? 'none' : p.publicPassedAt ? 'solved' : 'attempted'
  }
  return {
    session,
    signedIn: !!session,
    isLoading: isPending || (!!session && query.isPending),
    rows: query.data ?? [],
    bySlug,
    status,
  }
}

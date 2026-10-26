import { useQuery } from '@tanstack/react-query'
import { playableProblems } from './problems'
import { useTRPC } from './trpc'

/** Client-side rotation by UTC day, used only if the API can't answer. */
function offlineDaily(now = Date.now()) {
  const day = Math.floor(now / 86_400_000)
  return playableProblems[day % playableProblems.length]
}

/** Today's problem (UTC), picked by the server so everyone gets the same one. */
export function useDailyProblem() {
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.daily.today.queryOptions(),
    staleTime: 10 * 60_000,
    retry: 1,
  })
  const daily = query.isPending ? null : (query.data ?? offlineDaily())
  return {
    daily: daily && {
      slug: daily.slug,
      title: daily.title,
      difficulty: daily.difficulty,
    },
    isLoading: query.isPending,
  }
}

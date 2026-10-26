import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from './auth-client'
import { useTRPC } from './trpc'

/** The signed-in user's fame, streak and this month's check-in days. */
export function useFameStatus() {
  const { data: session, isPending } = useSession()
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.fame.status.queryOptions(),
    enabled: !!session,
  })
  return {
    signedIn: !!session,
    isLoading: isPending || (!!session && query.isPending),
    status: query.data ?? null,
  }
}

/** Checks in for today, then refreshes the status and the fame board. */
export function useCheckIn() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  return useMutation(
    trpc.fame.checkIn.mutationOptions({
      onSettled: () =>
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.fame.status.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.leaderboard.fame.pathKey(),
          }),
        ]),
    }),
  )
}

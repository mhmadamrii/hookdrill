import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarClock, Trophy, Users } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TimeLeft, contestTime, endOf } from '@/components/contests/time-left'
import { useSettledSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(main)/contests/')({
  head: () => ({ meta: [{ title: 'Contests · HookDrill' }] }),
  component: Contests,
})

const phaseLabel = { live: 'Live', upcoming: 'Upcoming', ended: 'Ended' }

function Contests() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { session } = useSettledSession()
  const list = useQuery({
    ...trpc.contests.list.queryOptions(),
    refetchInterval: 30_000,
  })
  const register = useMutation({
    ...trpc.contests.register.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: trpc.contests.list.queryKey(),
      }),
  })
  const order = { live: 0, upcoming: 1, ended: 2 }
  const contests = [...(list.data ?? [])].sort(
    (a, b) =>
      order[a.phase] - order[b.phase] ||
      (a.phase === 'ended' ? -1 : 1) *
        (Date.parse(a.startsAt) - Date.parse(b.startsAt)),
  )

  return (
    <>
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Contests</h1>
          <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
            Timed rounds of React problems. Solve in the workspace; each passing
            run counts. Standings are ICPC-style: problems solved, then time
            plus 5 minutes per wrong try.
          </p>
        </div>
        {list.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <ul className="flex max-w-4xl flex-col gap-3">
            {contests.map((c) => (
              <li
                key={c.slug}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4',
                  c.phase === 'live' && 'border-primary/50',
                )}
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-medium">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5',
                        c.phase === 'live'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground',
                      )}
                    >
                      {phaseLabel[c.phase]}
                    </span>
                    {c.phase !== 'ended' && (
                      <span className="text-muted-foreground tabular-nums">
                        {c.phase === 'live' ? 'Ends in ' : 'Starts in '}
                        <TimeLeft
                          to={
                            c.phase === 'live'
                              ? endOf(c.startsAt, c.durationMinutes)
                              : c.startsAt
                          }
                        />
                      </span>
                    )}
                  </p>
                  <Link
                    to="/contests/$slug"
                    params={{ slug: c.slug }}
                    className="mt-1.5 block text-lg font-semibold hover:text-brand"
                  >
                    {c.title}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" />
                      {contestTime.format(new Date(c.startsAt))} ·{' '}
                      {c.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Trophy className="size-3.5" />
                      {c.problems} problems
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Users className="size-3.5" />
                      {c.registrations} registered
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {c.phase !== 'ended' &&
                    (c.registered ? (
                      <span className="text-sm font-medium text-accepted">
                        Registered
                      </span>
                    ) : session ? (
                      <Button
                        variant={c.phase === 'live' ? 'default' : 'secondary'}
                        disabled={register.isPending}
                        onClick={() => register.mutate({ slug: c.slug })}
                      >
                        Register
                      </Button>
                    ) : (
                      <Button asChild variant="secondary">
                        <Link to="/signin">Sign in to register</Link>
                      </Button>
                    ))}
                  <Button asChild variant="outline">
                    <Link to="/contests/$slug" params={{ slug: c.slug }}>
                      {c.phase === 'ended'
                        ? 'Results'
                        : c.phase === 'live'
                          ? 'Enter'
                          : 'Details'}
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 max-w-4xl text-xs leading-relaxed text-muted-foreground">
          Tests run in your browser and results are taken on trust, so standings
          and contest rating can be gamed. Treat them as practice, not proof.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react'
import { contestBySlug } from '@hookdrill/challenges/contests'
import { DifficultyText } from '@/components/difficulty'
import { RankBadge } from '@/components/leaderboard/rating-table'
import { TimeLeft, contestTime, endOf } from '@/components/contests/time-left'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSettledSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(main)/contests/$slug')({
  loader: ({ params }) => {
    const c = contestBySlug(params.slug)
    if (!c) throw notFound()
    return { title: c.title }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.title} · Contests · HookDrill` }]
      : [],
  }),
  component: ContestPage,
})

function ContestPage() {
  const { slug } = Route.useParams()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { session } = useSettledSession()
  const q = useQuery({
    ...trpc.contests.detail.queryOptions({ slug }),
    // Live standings refresh every 15 s.
    refetchInterval: (s) => (s.state.data?.phase === 'live' ? 15_000 : false),
  })
  const register = useMutation({
    ...trpc.contests.register.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: trpc.contests.detail.queryKey({ slug }),
      }),
  })
  const c = q.data

  return (
    <>
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <Link
          to="/contests"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Contests
        </Link>
        {!c ? (
          <Skeleton className="mt-4 h-40 w-full max-w-4xl" />
        ) : (
          <div className="max-w-5xl">
            <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{c.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contestTime.format(new Date(c.startsAt))} ·{' '}
                  {c.durationMinutes} min · {c.problemCount} problems
                </p>
              </div>
              <div className="text-right">
                {c.phase !== 'ended' && (
                  <p className="text-xs text-muted-foreground">
                    {c.phase === 'live' ? 'Ends in' : 'Starts in'}
                  </p>
                )}
                <p className="text-2xl font-semibold tabular-nums">
                  {c.phase === 'ended' ? (
                    'Final'
                  ) : (
                    <TimeLeft
                      to={
                        c.phase === 'live'
                          ? endOf(c.startsAt, c.durationMinutes)
                          : c.startsAt
                      }
                    />
                  )}
                </p>
              </div>
            </header>

            {c.phase !== 'ended' && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4 text-sm">
                {c.registered ? (
                  <p className="flex items-center gap-2 font-medium text-accepted">
                    <CheckCircle2 className="size-4" /> You’re registered.
                    {c.phase === 'upcoming' &&
                      ' Problems appear here when the round starts.'}
                  </p>
                ) : session ? (
                  <>
                    <p className="text-muted-foreground">
                      Register to submit during the round.
                    </p>
                    <Button
                      disabled={register.isPending}
                      onClick={() => register.mutate({ slug })}
                    >
                      Register
                    </Button>
                  </>
                ) : (
                  <Button asChild>
                    <Link to="/signin">Sign in to register</Link>
                  </Button>
                )}
              </div>
            )}

            {c.problems.length > 0 && (
              <section aria-labelledby="problems-h" className="mt-6">
                <h2 id="problems-h" className="text-lg font-semibold">
                  Problems
                </h2>
                <ul className="mt-3 divide-y rounded-lg border bg-card">
                  {c.problems.map((p) => (
                    <li
                      key={p.slug}
                      className="flex flex-wrap items-center gap-3 px-4 py-3"
                    >
                      <span className="grid size-7 place-items-center rounded-md bg-secondary text-sm font-semibold">
                        {p.label}
                      </span>
                      <span className="min-w-0 flex-1 font-medium">
                        {p.title}
                      </span>
                      <DifficultyText level={p.difficulty} short />
                      <span className="w-16 text-right text-sm text-muted-foreground tabular-nums">
                        {p.points} pts
                      </span>
                      <span className="w-24 text-right text-sm tabular-nums">
                        {p.mine?.minutes != null ? (
                          <span className="text-accepted">
                            Solved {p.mine.minutes}′
                          </span>
                        ) : p.mine?.wrong ? (
                          <span className="text-hard">
                            {p.mine.wrong} wrong
                          </span>
                        ) : null}
                      </span>
                      {c.phase === 'live' && c.registered && (
                        <Button asChild size="sm">
                          <Link
                            to="/problems/$slug"
                            params={{ slug: p.slug }}
                            search={{ contest: slug } as never}
                          >
                            <Play /> Solve
                          </Link>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="standings-h" className="mt-6">
              <h2 id="standings-h" className="text-lg font-semibold">
                Standings
              </h2>
              {c.standings.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {c.phase === 'upcoming'
                    ? 'Standings appear once the round starts.'
                    : 'No submissions yet.'}
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-lg border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs hover:bg-transparent">
                        <TableHead className="w-12 pl-4 text-center">
                          #
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Solved</TableHead>
                        <TableHead className="text-right">Penalty</TableHead>
                        {contestBySlug(slug)!.problems.map((p) => (
                          <TableHead key={p.label} className="text-center">
                            {p.label}
                          </TableHead>
                        ))}
                        {c.phase === 'ended' && (
                          <TableHead className="pr-4 text-right">
                            Rating
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {c.standings.map((s, i) => (
                        <TableRow
                          key={i}
                          className={cn(
                            s.isMe &&
                              'bg-primary/[0.07] even:bg-primary/[0.07]',
                          )}
                        >
                          <TableCell className="py-2 pl-4 text-center">
                            <RankBadge pos={s.rank} />
                          </TableCell>
                          <TableCell className="py-2 font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell className="py-2 text-right tabular-nums">
                            {s.solved}
                          </TableCell>
                          <TableCell className="py-2 text-right text-muted-foreground tabular-nums">
                            {s.penalty}
                          </TableCell>
                          {contestBySlug(slug)!.problems.map((p) => {
                            const cell = s.problems[p.label]
                            return (
                              <TableCell
                                key={p.label}
                                className="py-2 text-center text-xs tabular-nums"
                              >
                                {cell?.minutes != null ? (
                                  <span className="font-semibold text-accepted">
                                    +{cell.wrong || ''}
                                    <span className="block font-normal text-muted-foreground">
                                      {cell.minutes}′
                                    </span>
                                  </span>
                                ) : cell?.wrong ? (
                                  <span className="text-hard">
                                    −{cell.wrong}
                                  </span>
                                ) : (
                                  ''
                                )}
                              </TableCell>
                            )
                          })}
                          {c.phase === 'ended' && (
                            <TableCell className="py-2 pr-4 text-right font-semibold tabular-nums">
                              +
                              {(s as { ratingAwarded?: number })
                                .ratingAwarded ?? 0}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Tests run in the browser and results are trusted, so standings can
              be gamed. Final results, rating and +30 participation fame are
              awarded when the round ends.
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

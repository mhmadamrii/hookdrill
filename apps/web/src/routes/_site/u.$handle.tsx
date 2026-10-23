import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Flame, MapPin, Trophy, UserX } from 'lucide-react'
import { HeatmapLayout } from '@/components/dashboard/activity-panel'
import { Panel, SampleBadge } from '@/components/dashboard/panel'
import { RatingChart } from '@/components/profile/rating-chart'
import {
  ratingHistory,
  recentContests,
  seedFor,
  solvedSplit,
} from '@/components/profile/sample-player'
import { RatingName } from '@/components/rating-name'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { players, sampleActivity, tierFor } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_site/u/$handle')({
  head: ({ params }) => ({
    meta: [{ title: `${params.handle} · Sample profile · HookDrill` }],
  }),
  component: PublicProfile,
})

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countryName = (code: string) => {
  try {
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

function PublicProfile() {
  const { handle } = Route.useParams()
  const player = players.find((p) => p.handle === handle)
  if (!player) return <NotFound handle={handle} />

  const tier = tierFor(player.rating)
  const history = ratingHistory(player)
  const peak = Math.max(...history)
  const peakTier = tierFor(peak)
  const split = solvedSplit(player)
  const activity = sampleActivity(365, seedFor(player.handle))
  const submissions = activity.reduce((n, d) => n + d.count, 0)
  const contests = recentContests(player, history)
  const activeDays = activity.filter((d) => d.count > 0).length
  let maxStreak = 0
  activity.reduce((run, d) => {
    const next = d.count > 0 ? run + 1 : 0
    maxStreak = Math.max(maxStreak, next)
    return next
  }, 0)

  return (
    <>
      <main className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" />
            Leaderboard
          </Link>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <SampleBadge label="Sample profile" />
            Generated sample data; not a real person.
          </p>
        </div>

        <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-5 rounded-lg border bg-card p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-5">
          <span
            aria-hidden
            className={cn(
              'grid size-14 place-items-center rounded-lg bg-surface-2 text-2xl font-semibold md:size-20 md:text-3xl',
              tier.className,
            )}
          >
            {player.handle.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tracking-tight">
              <RatingName
                handle={player.handle}
                rating={player.rating}
                className="truncate"
              />
              <span className={cn('text-sm font-medium', tier.className)}>
                {tier.name}
              </span>
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {countryName(player.country)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="size-3.5" />
                Global rank{' '}
                <span className="font-medium text-foreground tabular-nums">
                  #{player.rank}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flame className="size-3.5" />
                {player.streak}-day streak
              </span>
            </p>
          </div>
          <dl className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-3 border-t pt-4 sm:grid-cols-4 md:grid-cols-2 md:col-span-1 md:border-t-0 md:border-l md:pt-0 md:pl-6 xl:grid-cols-4">
            <HeaderStat
              term="Rating"
              value={player.rating}
              className={tier.className}
            />
            <HeaderStat
              term="Peak"
              value={peak}
              className={peakTier.className}
            />
            <HeaderStat term="Contests" value={player.contests} />
            <HeaderStat term="Solved" value={player.solved} />
          </dl>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel
            title="Rating"
            sample
            action={
              <span className="text-xs text-muted-foreground">
                Hover for each contest
              </span>
            }
          >
            <RatingChart history={history} />
          </Panel>
          <Panel title="Solved by difficulty" sample>
            <SolvedBreakdown split={split} total={player.solved} />
          </Panel>
        </div>

        <Panel
          title={
            <>
              {submissions} submissions{' '}
              <span className="font-normal text-muted-foreground">
                in the past year
              </span>
            </>
          }
          sample
        >
          <HeatmapLayout
            days={activity}
            facts={[
              ['Active days', activeDays],
              ['Max streak', `${maxStreak} days`],
            ]}
          />
        </Panel>

        <Panel title="Recent contests" sample bodyClassName="px-0 pb-1">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Contest</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 text-right font-medium">Rank</th>
                  <th className="px-4 py-2 text-right font-medium">Change</th>
                  <th className="px-4 py-2 text-right font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((c) => (
                  <tr
                    key={c.contest.id}
                    className="border-b last:border-0 even:bg-surface-2/50"
                  >
                    <td className="px-4 py-2.5 font-medium">
                      {c.contest.name}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                      {new Date(c.contest.startsAt).toLocaleDateString('en', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {c.rank}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-right font-medium tabular-nums',
                        c.delta >= 0 ? 'text-accepted' : 'text-wrong',
                      )}
                    >
                      {c.delta >= 0 ? '+' : ''}
                      {c.delta}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-right font-semibold tabular-nums',
                        tierFor(c.rating).className,
                      )}
                    >
                      {c.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </main>
      <SiteFooter />
    </>
  )
}

function HeaderStat({
  term,
  value,
  className,
}: {
  term: string
  value: number
  className?: string
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className={cn('text-lg font-semibold tabular-nums', className)}>
        {value}
      </dd>
    </div>
  )
}

const levelRows = [
  { key: 'easy', label: 'Easy', text: 'text-easy', bg: 'bg-easy' },
  { key: 'medium', label: 'Medium', text: 'text-medium', bg: 'bg-medium' },
  { key: 'hard', label: 'Hard', text: 'text-hard', bg: 'bg-hard' },
] as const

function SolvedBreakdown({
  split,
  total,
}: {
  split: Record<'easy' | 'medium' | 'hard', number>
  total: number
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-baseline gap-1.5 tabular-nums">
        <span className="text-4xl font-semibold tracking-tight">{total}</span>
        <span className="text-sm text-muted-foreground">problems solved</span>
      </p>
      <div
        className="flex h-2 gap-0.5 overflow-hidden rounded-full"
        aria-hidden
      >
        {levelRows.map((l) => (
          <span
            key={l.key}
            className={l.bg}
            style={{ width: `${(split[l.key] / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {levelRows.map((l) => (
          <li key={l.key} className="flex items-center justify-between">
            <span className={cn('font-medium', l.text)}>{l.label}</span>
            <span className="tabular-nums">
              {split[l.key]}
              <span className="ml-2 text-xs text-muted-foreground">
                {Math.round((split[l.key] / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NotFound({ handle }: { handle: string }) {
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[1440px] place-items-center px-4 py-12 md:px-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-lg border bg-card px-6 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-surface-2 text-muted-foreground">
          <UserX className="size-5" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          No player called “{handle}”
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Public profiles are sample data for now, and this handle is not one of
          them. The leaderboard lists every sample player.
        </p>
        <Button asChild className="mt-6">
          <Link to="/leaderboard">Open the leaderboard</Link>
        </Button>
      </div>
    </main>
  )
}

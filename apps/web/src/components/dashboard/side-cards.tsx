import { Link } from '@tanstack/react-router'
import { CalendarClock, ChevronRight, Clock, ListChecks } from 'lucide-react'
import { DifficultyText } from '@/components/difficulty'
import { RatingName } from '@/components/rating-name'
import { StatusIcon } from '@/components/status-icon'
import { Button } from '@/components/ui/button'
import { playableProblems } from '@/lib/problems'
import type { ProblemStatus } from '@/lib/progress'
import { players, upcomingContests } from '@/lib/sample-data'
import { Panel } from './panel'

const linkClass =
  'rounded-sm text-xs font-medium text-brand hover:underline underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none'

/** One playable problem per day, rotating through the real catalogue. */
export function TodaysProblem({
  status,
}: {
  status: (slug: string) => ProblemStatus
}) {
  const now = new Date()
  const dayIndex = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
  )
  const p = playableProblems[dayIndex % playableProblems.length]
  if (!p) return null
  const st = status(p.slug)
  return (
    <Panel
      title="Today's problem"
      action={
        <time className="text-xs text-muted-foreground tabular-nums">
          {now.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </time>
      }
    >
      <div className="flex items-start gap-2.5">
        <StatusIcon status={st} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-medium">
            <span className="text-muted-foreground tabular-nums">
              {p.number}.{' '}
            </span>
            {p.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <DifficultyText level={p.difficulty} className="mr-2" />
            {p.tags.join(' · ')}
          </p>
        </div>
      </div>
      <Button
        asChild
        variant={st === 'solved' ? 'outline' : 'default'}
        size="sm"
        className="mt-3 w-full"
      >
        <Link to="/problems/$slug" params={{ slug: p.slug }}>
          {st === 'solved'
            ? 'Solve it again'
            : st === 'attempted'
              ? 'Resume'
              : 'Solve today’s problem'}
        </Link>
      </Button>
    </Panel>
  )
}

export function UpcomingContests() {
  return (
    <Panel
      title="Upcoming contests"
      sample
      action={
        <Link to="/contests" className={linkClass}>
          All
        </Link>
      }
    >
      <ul className="flex flex-col divide-y">
        {upcomingContests.map((c) => {
          const start = new Date(c.startsAt)
          return (
            <li
              key={c.id}
              className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 text-center leading-none">
                <span className="text-2xs font-medium text-muted-foreground uppercase">
                  {start.toLocaleDateString('en', { month: 'short' })}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {start.getDate()}
                </span>
              </span>
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium">{c.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3" />
                    {start.toLocaleTimeString('en', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {c.durationMin} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="size-3" />
                    {c.problems} problems
                  </span>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export function TopThisWeek() {
  return (
    <Panel
      title="Top this week"
      sample
      action={
        <Link to="/leaderboard" className={linkClass}>
          Leaderboard
        </Link>
      }
    >
      <ol className="flex flex-col">
        {players.slice(0, 5).map((p) => (
          <li key={p.handle}>
            <Link
              to="/u/$handle"
              params={{ handle: p.handle }}
              className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="w-4 text-right text-xs font-medium text-muted-foreground tabular-nums">
                {p.rank}
              </span>
              <RatingName
                handle={p.handle}
                rating={p.rating}
                className="truncate"
              />
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {p.rating}
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

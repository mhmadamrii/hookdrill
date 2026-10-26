import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  CalendarCheck,
  CheckCircle2,
  Flame,
  Loader2,
  LogIn,
} from 'lucide-react'
import type { Difficulty } from '@hookdrill/challenges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { problems, topics } from '@/lib/problems'
import { useCheckIn, useFameStatus } from '@/lib/fame'
import { useMyProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'

const panel = 'rounded-xl border bg-card p-4'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const pad = (n: number) => String(n).padStart(2, '0')

/** Today's UTC date, known only after mount (avoids SSR mismatch). */
function useUtcToday() {
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => setToday(new Date()), [])
  return today
}

const fameFmt = new Intl.NumberFormat('en')

/** Daily check-in: the month in UTC, days checked in, streak and fame. */
function CheckInCalendar() {
  const today = useUtcToday()
  const { signedIn, isLoading, status } = useFameStatus()
  const checkIn = useCheckIn()

  if (!today || isLoading) {
    return (
      <section className={panel}>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-52 w-full" />
        <Skeleton className="mt-4 h-9 w-full" />
      </section>
    )
  }

  const year = today.getUTCFullYear()
  const month = today.getUTCMonth()
  const todayDate = today.getUTCDate()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const checked = new Set(status?.monthDays ?? [])
  const isChecked = (d: number) =>
    checked.has(`${year}-${pad(month + 1)}-${pad(d)}`)

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  return (
    <section className={panel} aria-labelledby="checkin-cal">
      <div className="flex items-center justify-between">
        <h2 id="checkin-cal" className="text-sm font-semibold">
          {today.toLocaleDateString('en', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </h2>
        {status && (
          <Link
            to="/leaderboard"
            search={{ board: 'fame' }}
            className="rounded-sm text-xs font-medium text-muted-foreground tabular-nums outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {fameFmt.format(status.fame)} fame
          </Link>
        )}
      </div>
      {status && (
        <p className="mt-2 flex items-center gap-1.5 text-sm">
          <Flame className="size-4 text-medium" />
          <span className="font-semibold tabular-nums">{status.streak}</span>
          <span className="text-muted-foreground">day check-in streak</span>
        </p>
      )}
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-xs">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 font-medium text-muted-foreground">
            {d}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`e${i}`} />
          ) : (
            <span key={d} className="flex flex-col items-center gap-0.5">
              <span
                aria-current={d === todayDate ? 'date' : undefined}
                className={cn(
                  'grid size-7 place-items-center rounded-full tabular-nums',
                  d === todayDate
                    ? 'bg-accepted font-semibold text-white'
                    : d > todayDate
                      ? 'text-muted-foreground/60'
                      : 'text-foreground',
                )}
              >
                {d}
              </span>
              <span
                aria-hidden
                className={cn(
                  'size-1 rounded-full',
                  isChecked(d) ? 'bg-accepted' : 'bg-transparent',
                )}
              />
            </span>
          ),
        )}
      </div>

      <div className="mt-4">
        {!signedIn ? (
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to="/signin">
              <LogIn /> Sign in to check in
            </Link>
          </Button>
        ) : status?.checkedIn ? (
          <p className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-secondary text-sm font-medium">
            <CheckCircle2 className="size-4 text-accepted" />
            {checkIn.data
              ? `Checked in, +${checkIn.data.amount} fame`
              : 'Checked in today'}
          </p>
        ) : (
          <Button
            size="sm"
            className="w-full"
            disabled={checkIn.isPending || !status}
            onClick={() => checkIn.mutate()}
          >
            {checkIn.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CalendarCheck />
            )}
            Check in
            {status && (
              <span className="opacity-80">+{status.nextAward} fame</span>
            )}
          </Button>
        )}
        {checkIn.isError && (
          <p role="alert" className="mt-2 text-xs text-wrong">
            Couldn’t check in. Try again in a moment.
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {status?.checkedIn
            ? `Next check-in opens at 00:00 UTC, worth +${status.nextAward}.`
            : 'Days reset at 00:00 UTC. Check in daily to grow your streak.'}
        </p>
      </div>
    </section>
  )
}

const levels: Array<[Difficulty, string, string, string]> = [
  ['easy', 'Easy', 'bg-easy', 'text-easy'],
  ['medium', 'Med.', 'bg-medium', 'text-medium'],
  ['hard', 'Hard', 'bg-hard', 'text-hard'],
]

function YourProgress() {
  const { signedIn, isLoading, status } = useMyProgress()
  return (
    <section className={panel} aria-labelledby="your-progress">
      <h2 id="your-progress" className="text-sm font-semibold">
        Your progress
      </h2>
      {isLoading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : !signedIn ? (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            Sign in to keep your solved problems and attempts across devices.
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link to="/signin">
              <LogIn /> Sign in to track progress
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {levels.map(([level, label, bar, text]) => {
            const all = problems.filter((p) => p.difficulty === level)
            const solved = all.filter((p) => status(p.slug) === 'solved').length
            return (
              <li key={level}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className={cn('font-medium', text)}>{label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    <span className="font-semibold text-foreground">
                      {solved}
                    </span>
                    /{all.length}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn('h-full rounded-full', bar)}
                    style={{ width: `${(solved / all.length) * 100}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function TrendingTopics({ onSelect }: { onSelect: (tag: string) => void }) {
  return (
    <section className={panel} aria-labelledby="trending">
      <h2 id="trending" className="text-sm font-semibold">
        Trending topics
      </h2>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {topics.slice(0, 14).map((t) => (
          <li key={t.name}>
            <button
              type="button"
              onClick={() => onSelect(t.name)}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 text-xs font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {t.name}
              <span className="rounded-full bg-medium/20 px-1.5 text-2xs text-medium tabular-nums">
                {t.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function RightRail({
  onSelectTopic,
}: {
  onSelectTopic: (tag: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 xl:sticky xl:top-[4.5rem]">
      <CheckInCalendar />
      <YourProgress />
      <TrendingTopics onSelect={onSelectTopic} />
    </div>
  )
}

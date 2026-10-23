import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Flame, LogIn } from 'lucide-react'
import type { Difficulty } from '@hookdrill/challenges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { problems, topics } from '@/lib/problems'
import { useMyProgress } from '@/lib/progress'
import { sampleActivity } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const panel = 'rounded-xl border bg-card p-4'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Today in the visitor's time zone, known only after mount (avoids SSR mismatch). */
function useToday() {
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => setToday(new Date()), [])
  return today
}

function DailyCalendar() {
  const today = useToday()
  const { signedIn, isLoading, rows } = useMyProgress()

  if (!today || isLoading) {
    return (
      <section className={panel}>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-52 w-full" />
      </section>
    )
  }

  const year = today.getFullYear()
  const month = today.getMonth()
  const todayDate = today.getDate()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()

  // Signed in: the user's real practice days. Signed out: labelled sample dots.
  const active = new Set<string>()
  if (signedIn) {
    for (const r of rows) active.add(dayKey(new Date(r.updatedAt)))
  } else {
    sampleActivity(todayDate, 40).forEach((d, i) => {
      if (d.count > 0) active.add(dayKey(new Date(year, month, i + 1)))
    })
  }
  let streak = 0
  const cursor = new Date(year, month, todayDate)
  // A streak survives until the end of today, so start from yesterday if today is empty.
  if (!active.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (active.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  return (
    <section className={panel} aria-labelledby="daily-cal">
      <div className="flex items-center justify-between">
        <h2 id="daily-cal" className="text-sm font-semibold">
          {today.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
        </h2>
        {!signedIn && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-2xs font-medium text-muted-foreground">
            Sample
          </span>
        )}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm">
        <Flame className="size-4 text-medium" />
        <span className="font-semibold tabular-nums">{streak}</span>
        <span className="text-muted-foreground">
          day practice streak{signedIn ? '' : ' (sample)'}
        </span>
      </p>
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
                  d < todayDate && active.has(dayKey(new Date(year, month, d)))
                    ? 'bg-accepted'
                    : 'bg-transparent',
                )}
              />
            </span>
          ),
        )}
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
      <DailyCalendar />
      <YourProgress />
      <TrendingTopics onSelect={onSelectTopic} />
    </div>
  )
}

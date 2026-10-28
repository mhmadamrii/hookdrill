import { Link, useSearch } from '@tanstack/react-router'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/lib/auth-client'
import { useCheckIn, useFameStatus } from '@/lib/fame'
import { ratingTiers } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const fameFmt = new Intl.NumberFormat('en')

export function YourPosition({ board }: { board: 'rating' | 'fame' }) {
  const { data: session, isPending } = useSession()
  const user = session?.user
  const fame = useFameStatus()
  const checkIn = useCheckIn()
  const period = useSearch({
    from: '/(main)/leaderboard',
    select: (s) => s.period,
  })
  const s = fame.status
  const rank =
    board === 'fame' ? (period === 'month' ? s?.monthRank : s?.rank) : null
  const value =
    board === 'fame'
      ? s && `${fameFmt.format(period === 'month' ? s.monthFame : s.fame)} fame`
      : 'Unrated'

  return (
    <section
      aria-labelledby="your-position"
      className="rounded-lg border bg-card p-4"
    >
      <h2 id="your-position" className="text-sm font-semibold">
        Your position
      </h2>
      {isPending || (user && board === 'fame' && fame.isLoading) ? (
        <div className="mt-3 flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-surface-2 px-3 py-2.5">
          <span className="w-6 text-center text-sm font-semibold text-muted-foreground tabular-nums">
            {rank ?? '–'}
          </span>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
            <UserRound className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user ? user.name : 'You'}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {user ? value : board === 'fame' ? '0 fame' : 'Unrated'}
            </p>
          </div>
        </div>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        {!user
          ? board === 'fame'
            ? 'Sign in and check in daily to join the fame board.'
            : 'Sign in to start earning rating once server grading opens.'
          : board === 'fame'
            ? rank
              ? s?.checkedIn
                ? 'Checked in today. Come back tomorrow to keep your streak.'
                : `Check in today for +${s?.nextAward} fame.`
              : 'Check in once to join the board.'
            : 'Rating comes from server-graded solves and contests, which are on the way.'}
      </p>
      {!isPending && !user && (
        <Button asChild size="sm" variant="outline" className="mt-3 w-full">
          <Link to="/signin">Sign in</Link>
        </Button>
      )}
      {user && board === 'fame' && s && !s.checkedIn && (
        <Button
          size="sm"
          className="mt-3 w-full"
          disabled={checkIn.isPending}
          onClick={() => checkIn.mutate()}
        >
          Check in, +{s.nextAward} fame
        </Button>
      )}
    </section>
  )
}

/** How fame is earned. Mirrors apps/api/src/services/fame.ts. */
export function FameRules() {
  const rules: Array<[string, string, string?]> = [
    ['Daily check-in', '+10'],
    ['Streak bonus', '+2 a day, up to +20'],
    ["Solve today's problem", '+50', 'With server grading'],
    ['Take part in a contest', '+30', 'With rated contests'],
  ]
  return (
    <section
      aria-labelledby="fame-rules"
      className="rounded-lg border bg-card p-4"
    >
      <h2 id="fame-rules" className="text-sm font-semibold">
        How fame works
      </h2>
      <ul className="mt-3 space-y-2.5">
        {rules.map(([what, amount, note]) => (
          <li
            key={what}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span>
              {what}
              {note && (
                <span className="block text-xs text-muted-foreground">
                  {note}
                </span>
              )}
            </span>
            <span className="shrink-0 font-medium tabular-nums">{amount}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Days reset at 00:00 UTC. Fame never goes down.
      </p>
    </section>
  )
}

export function TierLegend() {
  // ratingTiers is ordered high to low; show the ladder from the bottom up.
  const ladder = ratingTiers
    .map((t, i) => ({ ...t, max: i === 0 ? null : ratingTiers[i - 1].min - 1 }))
    .reverse()

  return (
    <section aria-labelledby="tiers" className="rounded-lg border bg-card p-4">
      <h2 id="tiers" className="text-sm font-semibold">
        Rating tiers
      </h2>
      <ul className="mt-3 space-y-1.5">
        {ladder.map((t) => (
          <li key={t.name} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden
              className={cn(
                'size-2.5 shrink-0 rounded-full bg-current',
                t.className,
              )}
            />
            <span className={cn('flex-1 font-medium', t.className)}>
              {t.name}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {t.max === null ? `${t.min}+` : `${t.min}–${t.max}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

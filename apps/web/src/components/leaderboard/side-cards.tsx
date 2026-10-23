import { Link } from '@tanstack/react-router'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/lib/auth-client'
import { ratingTiers } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

export function YourPosition() {
  const { data: session, isPending } = useSession()
  const user = session?.user

  return (
    <section
      aria-labelledby="your-position"
      className="rounded-lg border bg-card p-4"
    >
      <h2 id="your-position" className="text-sm font-semibold">
        Your position
      </h2>
      {isPending ? (
        <div className="mt-3 flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-surface-2 px-3 py-2.5">
          <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
            –
          </span>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
            <UserRound className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user ? user.name : 'You'}
            </p>
            <p className="text-xs text-muted-foreground">Unrated</p>
          </div>
        </div>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        {user
          ? 'You join the table after your first rated contest.'
          : 'Sign in, then take part in a rated contest to get a rating.'}
      </p>
      {!isPending && !user && (
        <Button asChild size="sm" variant="outline" className="mt-3 w-full">
          <Link to="/signin">Sign in</Link>
        </Button>
      )}
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

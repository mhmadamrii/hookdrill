import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RatingName } from '@/components/rating-name'
import { SampleNote, CountryPill } from '@/components/leaderboard/sample-note'
import { useSession } from '@/lib/auth-client'
import { players } from '@/lib/sample-data'
import { numberFmt } from './format'

export function ContestRatingCard() {
  const { data: session, isPending } = useSession()
  const top = players.slice(0, 5)

  return (
    <aside
      aria-labelledby="contest-rating"
      className="rounded-lg border bg-card"
    >
      <div className="p-5">
        <h2 id="contest-rating" className="font-semibold">
          Contest rating
        </h2>
        {isPending ? (
          <Skeleton className="mt-3 h-9 w-32" />
        ) : (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-muted-foreground">
              Unrated
            </span>
            {session?.user && (
              <span className="truncate text-sm text-muted-foreground">
                {session.user.name}
              </span>
            )}
          </div>
        )}
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          A rating appears after your first rated contest. Each contest then
          moves it up or down depending on where you finish against the other
          participants.
        </p>
        {!isPending && !session?.user && (
          <Button asChild size="sm" className="mt-4">
            <Link to="/signin">Sign in to take part</Link>
          </Button>
        )}
      </div>
      <div className="border-t p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Global top 5</h3>
          <SampleNote />
        </div>
        <ol className="mt-3 space-y-1">
          {top.map((p) => (
            <li key={p.handle}>
              <Link
                to="/u/$handle"
                params={{ handle: p.handle }}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="w-4 text-right text-xs font-semibold text-muted-foreground tabular-nums">
                  {p.rank}
                </span>
                <RatingName
                  handle={p.handle}
                  rating={p.rating}
                  className="min-w-0 flex-1 truncate"
                />
                <CountryPill code={p.country} />
                <span className="w-12 text-right font-semibold tabular-nums">
                  {numberFmt.format(p.rating)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <Link
          to="/leaderboard"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          Full leaderboard
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </aside>
  )
}

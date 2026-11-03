import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { tierFor } from '@/lib/sample-data'
import { useTRPC } from '@/lib/trpc'
import { cn } from '@/lib/utils'

const fmt = new Intl.NumberFormat('en')

export function RankBadge({ pos }: { pos: number }) {
  if (pos > 3)
    return <span className="text-muted-foreground tabular-nums">{pos}</span>
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/12 text-xs font-bold text-brand tabular-nums ring-1 ring-primary/25 ring-inset">
      {pos}
    </span>
  )
}

/** Rating from solved problems and contests. Solves are self-reported. */
export function RatingTable() {
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.leaderboard.rating.queryOptions(),
    staleTime: 60_000,
  })
  const rows = query.data ?? []
  return (
    <section
      aria-labelledby="rating"
      className="min-w-0 self-start rounded-lg border bg-card"
    >
      <h2 id="rating" className="sr-only">
        Rating
      </h2>
      <p className="border-b p-3 text-sm text-muted-foreground sm:px-4">
        Earned by solving problems (their points, once each) and placing in
        contests.
      </p>
      {query.isPending ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="px-6 py-14 text-center">
          <p className="font-medium">Couldn’t load the rating board</p>
          <Button variant="link" size="sm" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-secondary">
            <Trophy className="size-5 text-muted-foreground" />
          </span>
          <p className="mt-4 font-semibold">No one is rated yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Solve a problem to put your name on the board.
          </p>
          <Button asChild variant="secondary" className="mt-5">
            <Link to="/problems">Go to problems</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="text-xs hover:bg-transparent">
              <TableHead className="w-12 pl-4 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Solved</TableHead>
              <TableHead className="pr-4 text-right">Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const tier = tierFor(r.rating)
              return (
                <TableRow
                  key={`${r.rank}-${i}`}
                  aria-current={r.isMe ? 'true' : undefined}
                  className={cn(
                    'even:bg-surface-2/60',
                    r.isMe && 'bg-primary/[0.07] even:bg-primary/[0.07]',
                  )}
                >
                  <TableCell className="py-2 pl-4 text-center">
                    <RankBadge pos={r.rank} />
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="size-7">
                        {r.image && <AvatarImage src={r.image} alt="" />}
                        <AvatarFallback className="text-xs">
                          {r.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn('truncate font-medium', tier.className)}
                      >
                        {r.name}
                      </span>
                      {r.isMe && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-medium text-brand">
                          You
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-right text-muted-foreground tabular-nums">
                    {r.solved}
                  </TableCell>
                  <TableCell className="py-2 pr-4 text-right font-semibold tabular-nums">
                    {fmt.format(r.rating)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </section>
  )
}

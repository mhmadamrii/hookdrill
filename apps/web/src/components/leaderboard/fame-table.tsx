import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Flame, Users } from 'lucide-react'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useTRPC } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import { RankBadge } from './rating-table'

export type FamePeriod = 'all' | 'month'

const fameFmt = new Intl.NumberFormat('en')

export function FameTable({
  period,
  onPeriodChange,
}: {
  period: FamePeriod
  onPeriodChange: (period: FamePeriod) => void
}) {
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.leaderboard.fame.queryOptions({ period }),
    staleTime: 60_000,
  })
  const rows = query.data ?? []

  return (
    <section
      aria-labelledby="fame"
      className="min-w-0 self-start rounded-lg border bg-card"
    >
      <h2 id="fame" className="sr-only">
        Fame
      </h2>
      <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-sm text-muted-foreground">
          Earned by checking in daily and solving today’s problem.
        </p>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={period}
          onValueChange={(v) => v && onPeriodChange(v as FamePeriod)}
          aria-label="Period"
        >
          <ToggleGroupItem value="all" className="px-3">
            All time
          </ToggleGroupItem>
          <ToggleGroupItem value="month" className="px-3">
            This month
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {query.isPending ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="px-6 py-14 text-center">
          <p className="font-medium">Couldn’t load the fame board</p>
          <Button variant="link" size="sm" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-secondary">
            <Users className="size-5 text-muted-foreground" />
          </span>
          <p className="mt-4 font-semibold">
            {period === 'month'
              ? 'No fame earned this month yet'
              : 'No one has earned fame yet'}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Check in from the problems page to put your name on the board.
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
              <TableHead className="text-right">Streak</TableHead>
              <TableHead className="pr-4 text-right">
                {period === 'month' ? 'Fame this month' : 'Fame'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
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
                    <span className="truncate font-medium">{r.name}</span>
                    {r.isMe && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-medium text-brand">
                        You
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-right text-muted-foreground tabular-nums">
                  {r.streak > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Flame className="size-3.5 text-medium" />
                      {r.streak} d
                    </span>
                  ) : (
                    '–'
                  )}
                </TableCell>
                <TableCell className="py-2 pr-4 text-right font-semibold tabular-nums">
                  {fameFmt.format(r.fame)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}

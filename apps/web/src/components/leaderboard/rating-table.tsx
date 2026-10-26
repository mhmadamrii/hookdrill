import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Search, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RatingName } from '@/components/rating-name'
import { players, tierFor } from '@/lib/sample-data'
import { cn } from '@/lib/utils'
import { SampleNote } from './sample-note'

const PAGE_SIZE = 15

export function RankBadge({ pos }: { pos: number }) {
  if (pos > 3)
    return <span className="text-muted-foreground tabular-nums">{pos}</span>
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/12 text-xs font-bold text-brand tabular-nums ring-1 ring-primary/25 ring-inset">
      {pos}
    </span>
  )
}

export function RatingTable() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = players.map((p) => ({ ...p, pos: p.rank }))
    return q ? base.filter((r) => r.handle.toLowerCase().includes(q)) : base
  }, [query])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const from = rows.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1
  const to = Math.min(current * PAGE_SIZE, rows.length)

  return (
    <section
      aria-labelledby="ratings"
      className="min-w-0 rounded-lg border bg-card"
    >
      <h2 id="ratings" className="sr-only">
        Ratings
      </h2>
      <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-sm text-muted-foreground">
          Points from first solves and contests. Never goes down.
        </p>
        <div className="relative sm:w-60">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search handle"
            aria-label="Search by handle"
            className="h-8 pl-8"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="text-xs hover:bg-transparent">
            <TableHead className="w-12 pl-4 text-center">#</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Solved
            </TableHead>
            <TableHead className="hidden text-right md:table-cell">
              Contests
            </TableHead>
            <TableHead className="hidden pr-4 text-right md:table-cell">
              Streak
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((p) => (
            <TableRow
              key={p.handle}
              className={cn(
                'even:bg-surface-2/60',
                p.pos <= 3 && 'bg-primary/[0.045] even:bg-primary/[0.045]',
              )}
            >
              <TableCell className="py-2 pl-4 text-center">
                <RankBadge pos={p.pos} />
              </TableCell>
              <TableCell className="py-2">
                <Link
                  to="/u/$handle"
                  params={{ handle: p.handle }}
                  className="rounded-sm underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <RatingName handle={p.handle} rating={p.rating} />
                </Link>
                <span className="ml-2 hidden text-xs text-muted-foreground lg:inline">
                  {tierFor(p.rating).name}
                </span>
              </TableCell>
              <TableCell
                className={cn(
                  'py-2 text-right font-semibold tabular-nums',
                  tierFor(p.rating).className,
                )}
              >
                {p.rating}
              </TableCell>
              <TableCell className="hidden py-2 text-right tabular-nums sm:table-cell">
                {p.solved}
              </TableCell>
              <TableCell className="hidden py-2 text-right tabular-nums md:table-cell">
                {p.contests}
              </TableCell>
              <TableCell className="hidden py-2 pr-4 text-right text-muted-foreground tabular-nums md:table-cell">
                {p.streak} d
              </TableCell>
            </TableRow>
          ))}
          {visible.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="py-14 text-center">
                <SearchX
                  className="mx-auto size-5 text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-2 font-medium">
                  No handle matches “{query.trim()}”
                </p>
                <Button variant="link" size="sm" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="tabular-nums">
            {from}–{to} of {rows.length}
          </span>
          <SampleNote />
        </div>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft />
          </Button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={n === current ? 'secondary' : 'ghost'}
              size="icon-sm"
              aria-current={n === current ? 'page' : undefined}
              aria-label={`Page ${n}`}
              onClick={() => setPage(n)}
              className="tabular-nums"
            >
              {n}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next page"
            disabled={current === pageCount}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight />
          </Button>
        </nav>
      </div>
    </section>
  )
}

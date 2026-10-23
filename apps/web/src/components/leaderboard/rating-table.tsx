import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Search, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RatingName } from '@/components/rating-name'
import { players, tierFor, type Player } from '@/lib/sample-data'
import { cn } from '@/lib/utils'
import { CountryPill, SampleNote } from './sample-note'

const PAGE_SIZE = 15
type View = 'global' | 'week' | 'country'

/** Deterministic sample rating change over the last 7 days. */
const weeklyDelta = (p: Player) => ((p.rank * 29 + 11) % 97) - 31

const countries = Array.from(new Set(players.map((p) => p.country))).sort()

interface Row extends Player {
  pos: number
  delta: number
}

function buildRows(view: View, country: string): Row[] {
  const withDelta = players.map((p) => ({
    ...p,
    delta: weeklyDelta(p),
    pos: 0,
  }))
  let list = withDelta
  if (view === 'week')
    list = [...withDelta].sort(
      (a, b) => b.delta - a.delta || b.rating - a.rating,
    )
  if (view === 'country') list = withDelta.filter((p) => p.country === country)
  return list.map((p, i) => ({ ...p, pos: i + 1 }))
}

function RankBadge({ pos }: { pos: number }) {
  if (pos > 3)
    return <span className="text-muted-foreground tabular-nums">{pos}</span>
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/12 text-xs font-bold text-brand tabular-nums ring-1 ring-primary/25 ring-inset">
      {pos}
    </span>
  )
}

function Delta({ value }: { value: number }) {
  if (value === 0)
    return <span className="text-muted-foreground tabular-nums">0</span>
  return (
    <span
      className={cn(
        'font-medium tabular-nums',
        value > 0 ? 'text-accepted' : 'text-wrong',
      )}
    >
      {value > 0 ? `+${value}` : `−${Math.abs(value)}`}
    </span>
  )
}

export function RatingTable() {
  const [view, setView] = useState<View>('global')
  const [country, setCountry] = useState('JP')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = buildRows(view, country)
    return q ? base.filter((r) => r.handle.toLowerCase().includes(q)) : base
  }, [view, country, query])

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
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={view}
            onValueChange={(v) => {
              setView(v as View)
              setPage(1)
            }}
          >
            <TabsList>
              <TabsTrigger value="global" className="px-3">
                Global rating
              </TabsTrigger>
              <TabsTrigger value="week" className="px-3">
                This week
              </TabsTrigger>
              <TabsTrigger value="country" className="px-3">
                Country
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {view === 'country' && (
            <Select
              value={country}
              onValueChange={(v) => {
                setCountry(v)
                setPage(1)
              }}
            >
              <SelectTrigger size="sm" aria-label="Country" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
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
            <TableHead className="hidden sm:table-cell">Country</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            {view === 'week' && (
              <TableHead className="text-right">7 days</TableHead>
            )}
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
              <TableCell className="hidden py-2 sm:table-cell">
                <CountryPill code={p.country} />
              </TableCell>
              <TableCell
                className={cn(
                  'py-2 text-right font-semibold tabular-nums',
                  tierFor(p.rating).className,
                )}
              >
                {p.rating}
              </TableCell>
              {view === 'week' && (
                <TableCell className="py-2 text-right">
                  <Delta value={p.delta} />
                </TableCell>
              )}
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
              <TableCell colSpan={8} className="py-14 text-center">
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

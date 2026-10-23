import { Link } from '@tanstack/react-router'
import { History, PlayCircle, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SampleNote } from '@/components/leaderboard/sample-note'
import type { Contest } from '@/lib/sample-data'
import { formatDate, formatDuration, kindLabel, numberFmt } from './format'

function VirtualButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* span keeps the tooltip reachable while the button is disabled */}
        <span tabIndex={0} className="inline-flex rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          <Button variant="outline" size="xs" disabled className="pointer-events-none">
            <PlayCircle aria-hidden />
            Virtual
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Virtual participation opens with server grading</TooltipContent>
    </Tooltip>
  )
}

export function PastContests({ contests }: { contests: Contest[] }) {
  return (
    <section aria-labelledby="past-contests" className="rounded-lg border bg-card">
      <Tabs defaultValue="past" className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <h2 id="past-contests" className="text-lg font-semibold tracking-tight">
              Past contests
            </h2>
            <SampleNote />
          </div>
          <TabsList>
            <TabsTrigger value="past" className="px-3">
              Past
            </TabsTrigger>
            <TabsTrigger value="mine" className="px-3">
              My contests
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="past">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 sm:pl-5">Contest</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Problems</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Participants</TableHead>
                <TableHead className="pr-4 text-right sm:pr-5">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contests.map((c) => (
                <TableRow key={c.id} className="even:bg-surface-2/60">
                  <TableCell className="py-3 pl-4 sm:pl-5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      {c.kind === 'special' && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                          {kindLabel[c.kind]}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground md:hidden">
                      {formatDate(c.startsAt)} · {formatDuration(c.durationMin)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                    {formatDate(c.startsAt)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                    {formatDuration(c.durationMin)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">{c.problems}</TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {c.participants === null ? '—' : numberFmt.format(c.participants)}
                  </TableCell>
                  <TableCell className="pr-4 text-right sm:pr-5">
                    <VirtualButton />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="mine">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
              <History className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-4 font-medium">You haven't joined a contest yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Contests you take part in will be listed here with your rank and rating change.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link to="/problems">
                <Trophy aria-hidden />
                Practise problems meanwhile
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}

import { Link, useNavigate } from '@tanstack/react-router'
import { Lock, SearchX } from 'lucide-react'
import { DifficultyText } from '@/components/difficulty'
import { StatusIcon } from '@/components/status-icon'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Problem } from '@/lib/problems'
import type { ProblemStatus } from '@/lib/progress'
import { cn } from '@/lib/utils'

export function ProblemTable({
  rows,
  statusOf,
  statusLoading,
  onClear,
}: {
  rows: Problem[]
  statusOf: (slug: string) => ProblemStatus
  statusLoading: boolean
  onClear: () => void
}) {
  const navigate = useNavigate()

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-secondary">
          <SearchX className="size-5 text-muted-foreground" />
        </span>
        <h3 className="mt-4 font-semibold">No problems match these filters</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try a different search, or clear the topic, track and filters to see the full library.
        </p>
        <Button variant="secondary" className="mt-5" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    )
  }

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead className="sr-only">
        <tr>
          <th scope="col">Status</th>
          <th scope="col">Title</th>
          <th scope="col">Acceptance</th>
          <th scope="col">Difficulty</th>
          <th scope="col">Availability</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const open = () => navigate({ to: '/problems/$slug', params: { slug: p.slug } })
          return (
            <tr
              key={p.slug}
              onClick={p.playable ? open : undefined}
              className={cn(
                'group h-11 odd:bg-card [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg',
                p.playable ? 'cursor-pointer hover:bg-accent odd:hover:bg-accent' : 'text-muted-foreground',
              )}
            >
              <td className="w-10 pl-3">
                {statusLoading ? (
                  <Skeleton className="size-4 rounded-full" />
                ) : (
                  <StatusIcon status={statusOf(p.slug)} />
                )}
              </td>
              <td className="max-w-0 pr-3">
                {p.playable ? (
                  <Link
                    to="/problems/$slug"
                    params={{ slug: p.slug }}
                    onClick={(e) => e.stopPropagation()}
                    className="block truncate rounded-sm font-medium text-foreground outline-none group-hover:text-brand focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {p.number}. {p.title}
                  </Link>
                ) : (
                  <span className="block truncate opacity-75">
                    {p.number}. {p.title}
                  </span>
                )}
              </td>
              <td className="w-24 pr-3 text-right tabular-nums max-sm:hidden">
                <span className={cn(!p.playable && 'opacity-75')}>
                  {p.acceptance === null ? '—' : `${p.acceptance.toFixed(1)}%`}
                </span>
              </td>
              <td className="w-16 pr-3 sm:w-20">
                <DifficultyText level={p.difficulty} short className={cn(!p.playable && 'opacity-60')} />
              </td>
              <td className="w-10 pr-3 text-right">
                {!p.playable && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label="Coming soon"
                        className="inline-grid size-6 place-items-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <Lock className="size-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">Coming soon</TooltipContent>
                  </Tooltip>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

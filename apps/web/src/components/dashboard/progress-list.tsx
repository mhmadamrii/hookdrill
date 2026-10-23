import { Link } from '@tanstack/react-router'
import { DifficultyText } from '@/components/difficulty'
import { StatusIcon } from '@/components/status-icon'
import { TestStrip, stripFromCounts } from '@/components/test-strip'
import { cn } from '@/lib/utils'
import { isSolved, plural, relativeTime, type ResolvedRow } from './stats'

/** The user's progress rows: status, problem, last-run strip, relative time. */
export function ProgressList({ rows, className }: { rows: ResolvedRow[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {rows.map((r, i) => {
        const playable = r.problem?.playable
        const title = (
          <>
            {r.problem && <span className="text-muted-foreground tabular-nums">{r.problem.number}. </span>}
            {r.title}
          </>
        )
        return (
          <li
            key={r.slug}
            className={cn(
              'grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-md px-3 py-2.5 sm:grid-cols-[1rem_minmax(0,1fr)_auto_7rem]',
              i % 2 === 0 && 'bg-surface-2/60',
            )}
          >
            <StatusIcon status={isSolved(r) ? 'solved' : 'attempted'} />
            <div className="min-w-0">
              {playable ? (
                <Link
                  to="/problems/$slug"
                  params={{ slug: r.slug }}
                  className="block truncate text-sm font-medium hover:text-brand focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {title}
                </Link>
              ) : (
                <span className="block truncate text-sm font-medium">{title}</span>
              )}
              <p className="text-xs text-muted-foreground">
                {r.problem && <DifficultyText level={r.problem.difficulty} short className="mr-2" />}
                {plural(r.runs, 'run')}
                {r.hintsRevealed > 0 && ` · ${plural(r.hintsRevealed, 'hint')}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {r.lastTotal > 0 ? (
                <>
                  <TestStrip cells={stripFromCounts(r.lastPassed, r.lastTotal)} size="sm" className="max-sm:hidden" />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {r.lastPassed}/{r.lastTotal}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">No runs yet</span>
              )}
            </div>
            <time
              dateTime={r.updated.toISOString()}
              title={r.updated.toLocaleString()}
              className="col-start-2 text-xs text-muted-foreground sm:col-start-auto sm:text-right"
            >
              {relativeTime(r.updated)}
            </time>
          </li>
        )
      })}
    </ul>
  )
}

import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { playableProblems } from '@/lib/problems'
import { cn } from '@/lib/utils'
import { Panel } from './panel'
import { solvedByDifficulty, summarize, type ProgressRow } from './stats'

const track = {
  easy: 'bg-easy/15',
  medium: 'bg-medium/15',
  hard: 'bg-hard/15',
} as const
const fill = { easy: 'bg-easy', medium: 'bg-medium', hard: 'bg-hard' } as const
const label = { easy: 'Easy', medium: 'Med.', hard: 'Hard' } as const
const text = {
  easy: 'text-easy',
  medium: 'text-medium',
  hard: 'text-hard',
} as const

/** LeetCode-style solved breakdown against the whole catalogue, plus run stats. */
export function SolvedPanel({
  rows,
  className,
}: {
  rows: ProgressRow[]
  className?: string
}) {
  const s = summarize(rows)
  const byLevel = solvedByDifficulty(rows)
  return (
    <Panel
      className={className}
      title="Solved"
      action={
        <Tooltip>
          <TooltipTrigger
            aria-label="How solves are counted"
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Info className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            A problem counts as solved when every public test passes in your
            browser. Hidden tests and the server verdict come later.
          </TooltipContent>
        </Tooltip>
      }
    >
      <div className="@container">
        <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr] @4xl:grid-cols-[auto_minmax(0,1fr)_auto] @4xl:gap-8">
          <div className="flex flex-col">
            <p className="flex items-baseline gap-1 tabular-nums">
              <span className="text-4xl font-semibold tracking-tight">
                {s.solved}
              </span>
              <span className="text-sm text-muted-foreground">
                /{playableProblems.length}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Solved (public tests)
            </p>
            {s.attempted > 0 && (
              <p className="mt-1 text-xs text-medium">
                {s.attempted} attempted
              </p>
            )}
          </div>
          <ul className="flex flex-col gap-2.5">
            {byLevel.map((d) => (
              <li
                key={d.level}
                className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 text-xs"
              >
                <span className={cn('font-medium', text[d.level])}>
                  {label[d.level]}
                </span>
                <span
                  className={cn(
                    'h-1.5 overflow-hidden rounded-full',
                    track[d.level],
                  )}
                >
                  <span
                    className={cn('block h-full rounded-full', fill[d.level])}
                    style={{
                      width: `${d.total ? (d.solved / d.total) * 100 : 0}%`,
                    }}
                  />
                </span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {d.solved}
                  </span>
                  /{d.total}
                </span>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 sm:col-span-2 sm:grid-cols-4 @4xl:col-span-1 @4xl:grid-cols-2 @4xl:gap-x-8 @4xl:border-t-0 @4xl:border-l @4xl:pt-0 @4xl:pl-8">
            <Stat term="Runs" value={s.runs} />
            <Stat
              term="Current streak"
              value={s.streak}
              unit={s.streak === 1 ? 'day' : 'days'}
            />
            <Stat term="Active days" value={s.activeDays} />
            <Stat term="Rating" value="Unrated" muted />
          </dl>
        </div>
      </div>
    </Panel>
  )
}

function Stat({
  term,
  value,
  unit,
  muted,
}: {
  term: string
  value: number | string
  unit?: string
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd
        className={cn(
          'text-base font-semibold tabular-nums',
          muted && 'text-muted-foreground',
        )}
      >
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </dd>
    </div>
  )
}

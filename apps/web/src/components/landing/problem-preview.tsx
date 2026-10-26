import { Link } from '@tanstack/react-router'
import { ArrowRight, Lock } from 'lucide-react'
import { DifficultyText } from '@/components/difficulty'
import { StatusIcon } from '@/components/status-icon'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AcceptanceCell } from '@/components/problems/problem-table'
import { useAcceptance } from '@/lib/acceptance'
import { playableProblems, topics } from '@/lib/problems'
import { useMyProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'

const preview = playableProblems.filter((p) => p.track === 'react').slice(0, 8)

export function ProblemPreview() {
  const progress = useMyProgress()
  const acceptance = useAcceptance()
  return (
    <section aria-labelledby="problems-heading" className="border-y bg-card/40">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 md:px-6 md:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col">
          <h2
            id="problems-heading"
            className="text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl"
          >
            Problems you would actually ship
          </h2>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground">
            Lists, forms, focus traps, async search. Each one is a component a
            product team needs, with tests that check the behaviour rather than
            the markup. Two are open today; the rest of the catalogue is on the
            way.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Topics">
            {topics.slice(0, 8).map((t) => (
              <li
                key={t.name}
                className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-3 text-[13px]"
              >
                {t.name}
                <span className="text-muted-foreground tabular-nums">
                  {t.count}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/problems"
            className="group mt-8 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            Browse all problems
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <div className="grid grid-cols-[1.75rem_minmax(0,1fr)_3.5rem_1.5rem] items-center gap-3 border-b px-4 py-2.5 text-[13px] text-muted-foreground sm:grid-cols-[1.75rem_minmax(0,1fr)_6rem_5rem_1.5rem]">
            <span aria-hidden />
            <span>Title</span>
            <span className="text-right max-sm:hidden">Acceptance</span>
            <span>Difficulty</span>
            <span className="sr-only">Access</span>
          </div>
          <ul className="p-1.5">
            {preview.map((p) => {
              const row = (
                <>
                  <span className="grid place-items-center">
                    {p.playable ? (
                      <StatusIcon status={progress.status(p.slug)} />
                    ) : (
                      <span className="size-4" />
                    )}
                  </span>
                  <span
                    className={cn(
                      'truncate font-medium',
                      !p.playable && 'text-foreground/70',
                    )}
                  >
                    {p.number}. {p.title}
                  </span>
                  <span className="text-right text-muted-foreground tabular-nums max-sm:hidden">
                    <AcceptanceCell rate={acceptance.rateOf(p.slug)} />
                  </span>
                  <DifficultyText level={p.difficulty} short />
                  <span className="grid place-items-center">
                    {!p.playable && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            tabIndex={0}
                            aria-label="Coming soon"
                            className="grid size-6 place-items-center rounded-md text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                          >
                            <Lock className="size-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Coming soon</TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </>
              )
              const cls =
                'grid grid-cols-[1.75rem_minmax(0,1fr)_3.5rem_1.5rem] items-center gap-3 rounded-md px-2.5 py-2.5 text-sm sm:grid-cols-[1.75rem_minmax(0,1fr)_6rem_5rem_1.5rem]'
              return (
                <li key={p.slug} className="odd:bg-surface-2/70 rounded-md">
                  {p.playable ? (
                    <Link
                      to="/problems/$slug"
                      params={{ slug: p.slug }}
                      className={cn(
                        cls,
                        'transition-colors hover:bg-accent hover:text-brand focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                      )}
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className={cls} aria-disabled>
                      {row}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

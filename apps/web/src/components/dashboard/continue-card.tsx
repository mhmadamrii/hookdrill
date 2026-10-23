import { Link } from '@tanstack/react-router'
import { ArrowRight, Play } from 'lucide-react'
import { DifficultyPill } from '@/components/difficulty'
import { TestStrip, stripFromCounts } from '@/components/test-strip'
import { Button } from '@/components/ui/button'
import { playableProblems, type Problem } from '@/lib/problems'
import { cn } from '@/lib/utils'
import { Panel } from './panel'
import { isSolved, plural, relativeTime, type ResolvedRow } from './stats'

/** Picks up the most recently touched unsolved problem, or suggests where to start. */
export function ContinueCard({ rows, className }: { rows: ResolvedRow[]; className?: string }) {
  const current = rows.find((r) => !isSolved(r) && r.problem?.playable)
  if (current?.problem) {
    const p = current.problem
    return (
      <Panel className={className} title="Continue where you left off">
        <ProblemHead problem={p} />
        <div className="mt-4 rounded-md bg-surface-2 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Last run {relativeTime(current.updated)}</span>
            <span className="tabular-nums">
              <span className="font-medium text-foreground">{current.lastPassed}</span> of {current.lastTotal} public
              tests passed
            </span>
          </div>
          {current.lastTotal > 0 ? (
            <TestStrip cells={stripFromCounts(current.lastPassed, current.lastTotal)} className="mt-2.5 flex-wrap" />
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Opened, not run yet.</p>
          )}
        </div>
        <Footer
          meta={`${plural(current.runs, 'run')} · ${plural(current.hintsRevealed, 'hint')} used`}
          slug={p.slug}
          label="Resume"
        />
      </Panel>
    )
  }

  const solved = new Set(rows.filter(isSolved).map((r) => r.slug))
  const next = playableProblems.find((p) => !solved.has(p.slug))
  if (!next) {
    return (
      <Panel className={className} title="All caught up">
        <p className="text-sm text-muted-foreground">
          You have passed the public tests on every playable problem. New problems are on the way; the catalogue shows
          what is coming.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/problems">See the catalogue</Link>
        </Button>
      </Panel>
    )
  }
  const fresh = rows.length === 0
  return (
    <Panel className={className} title={fresh ? 'Start here' : 'Up next'}>
      <ProblemHead problem={next} />
      <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">
        {fresh
          ? 'Build it by hand in the editor, run the public tests, and watch the strip turn green one test at a time.'
          : 'Your started problems are all passing. This one is still open.'}
      </p>
      <Footer meta="Not started" slug={next.slug} label={`Start with ${next.title}`} icon />
    </Panel>
  )
}

function ProblemHead({ problem }: { problem: Problem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h3 className="text-lg font-semibold tracking-tight">
        <span className="text-muted-foreground tabular-nums">{problem.number}. </span>
        {problem.title}
      </h3>
      <DifficultyPill level={problem.difficulty} />
      <span className="flex flex-wrap gap-1.5">
        {problem.tags.map((t) => (
          <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            {t}
          </span>
        ))}
      </span>
    </div>
  )
}

function Footer({ meta, slug, label, icon }: { meta: string; slug: string; label: string; icon?: boolean }) {
  return (
    <div className={cn('mt-4 flex flex-wrap items-center justify-between gap-3')}>
      <span className="text-xs text-muted-foreground">{meta}</span>
      <Button asChild>
        <Link to="/problems/$slug" params={{ slug }}>
          {icon ? <Play /> : null}
          {label}
          {icon ? null : <ArrowRight />}
        </Link>
      </Button>
    </div>
  )
}

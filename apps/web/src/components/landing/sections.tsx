import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Clock,
  FileCode2,
  ListChecks,
  Minus,
  Trophy,
} from 'lucide-react'
import { RatingName } from '@/components/rating-name'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { problems, playableProblems } from '@/lib/problems'
import { players, studyTracks, upcomingContests } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const container = 'mx-auto max-w-[1440px] px-4 md:px-6'
const h2 = 'text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl'

function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('font-normal text-muted-foreground', className)}
    >
      Sample data
    </Badge>
  )
}

/* ------------------------------------------------------------------ */

const inEditor = [
  'React and TypeScript with syntax colouring',
  'A live preview that re-renders as you type',
  'Every test by name, with a verdict per test',
  'Hints, revealed one at a time when you ask',
]
const leftOut = [
  'AI completion and suggested fixes',
  'The test source',
  'Anything that writes the component for you',
]

export function WhyByHand() {
  return (
    <section
      aria-labelledby="why-heading"
      className={cn(container, 'py-20 md:py-28')}
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div>
          <h2
            id="why-heading"
            className="text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl"
          >
            AI writes code all day. Your hands still have to know how.
          </h2>
          <div className="mt-6 max-w-[62ch] space-y-4 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            <p>
              The job is moving from typing code to deciding what to build,
              directing agents and verifying what they ship. That only works if
              you can read code well enough to catch what’s wrong, and that
              skill fades quietly when you stop using it.
            </p>
            <p>
              HookDrill trains both halves. Drills keep your hands sharp: a
              spec, an empty{' '}
              <span className="font-mono text-[0.9em] text-foreground">
                App.tsx
              </span>
              , and tests that only care whether it works. Builder Lab, coming
              next, trains the rest: specs, agents and verification.
            </p>
            <p>
              <Link
                to="/future"
                className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
              >
                Read how software gets built next
                <ArrowRight className="size-4" />
              </Link>
            </p>
          </div>
        </div>

        <div className="grid content-start gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:pt-3">
          <div>
            <h3 className="text-sm font-semibold">In the editor</h3>
            <ul className="mt-3 space-y-2.5 text-[15px]">
              {inEditor.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-accepted" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Left out on purpose</h3>
            <ul className="mt-3 space-y-2.5 text-[15px] text-muted-foreground">
              {leftOut.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Minus className="mt-0.5 size-4 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function TrackRow({
  title,
  blurb,
  level,
  count,
}: {
  title: string
  blurb: string
  level: string
  count: number
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 py-3.5">
      <span className="font-medium">{title}</span>
      <span className="text-[13px] text-muted-foreground tabular-nums">
        {count} problems
      </span>
      <span className="text-sm text-muted-foreground">{blurb}</span>
      <span className="text-[13px] text-muted-foreground">{level}</span>
    </li>
  )
}

export function Tracks() {
  const react = studyTracks.filter((t) => t.track === 'react')
  const dsa = studyTracks.filter((t) => t.track === 'dsa')
  const dsaTitles = problems.filter((p) => p.track === 'dsa').slice(0, 5)
  return (
    <section
      aria-labelledby="tracks-heading"
      className={cn(container, 'pb-20 md:pb-28')}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id="tracks-heading" className={h2}>
            React UI first. Algorithms next.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
            The React track is open now. A DSA track with the classic interview
            set is being built on the same editor and test runner.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="rounded-lg border bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-semibold">React UI</h3>
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-accepted/12 px-2.5 text-xs font-medium text-accepted">
              <span className="size-1.5 rounded-full bg-accepted" />
              Live
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Open today:{' '}
            {playableProblems.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && ', '}
                <Link
                  to="/problems/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {p.title}
                </Link>
              </span>
            ))}
            .
          </p>
          <div className="mt-5 flex items-center justify-between border-b pb-2 text-[13px] text-muted-foreground">
            <span>Planned study plans</span>
            <span>Outline, sample</span>
          </div>
          <ul className="divide-y">
            {react.map((t) => (
              <TrackRow
                key={t.slug}
                title={t.title}
                blurb={t.blurb}
                level={t.level}
                count={t.problems}
              />
            ))}
          </ul>
        </div>

        <div className="flex flex-col rounded-lg border border-dashed p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-semibold">
              Data structures and algorithms
            </h3>
            <span className="inline-flex h-6 items-center rounded-full bg-secondary px-2.5 text-xs font-medium text-muted-foreground">
              Coming later
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Same rules: no AI, hidden tests, one cell per test.
          </p>
          <ul className="mt-5 divide-y border-t">
            {dsa.map((t) => (
              <TrackRow
                key={t.slug}
                title={t.title}
                blurb={t.blurb}
                level={t.level}
                count={t.problems}
              />
            ))}
          </ul>
          <p className="mt-auto pt-6 text-[13px] text-muted-foreground">
            First up: {dsaTitles.map((p) => p.title).join(', ')}.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const dateFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

export function Arena() {
  const next = upcomingContests[0]
  const top = players.slice(0, 5)
  return (
    <section aria-labelledby="arena-heading" className="border-t bg-card/40">
      <div className={cn(container, 'py-20 md:py-24')}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="arena-heading" className={h2}>
            Weekly contests and a rating
          </h2>
          <SampleBadge className="mt-1" />
        </div>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Timed rounds of UI problems, scored by the same hidden tests. This is
          a preview of how contests and the leaderboard will look.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* next contest */}
          <div className="flex flex-col rounded-lg border bg-card p-5 md:p-6">
            <p className="text-2xl font-semibold tracking-tight">{next.name}</p>
            <dl className="mt-5 grid grid-cols-3 gap-4 border-y py-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Starts</dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {dateFmt.format(new Date(next.startsAt))} UTC
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" /> Length
                </dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {next.durationMin} min
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <ListChecks className="size-3.5" /> Problems
                </dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {next.problems}
                </dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-6 w-fit">
              <Link to="/contests">
                See all contests <ArrowRight />
              </Link>
            </Button>
          </div>

          {/* leaderboard */}
          <div className="min-w-0 rounded-lg border bg-card">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Trophy className="size-4 text-medium" />
                Global ranking
              </span>
              <Link
                to="/leaderboard"
                className="rounded-sm text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Full leaderboard
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-[13px] text-muted-foreground">
                <tr>
                  <th className="w-12 py-2.5 pl-5 font-normal">#</th>
                  <th className="py-2.5 font-normal">Handle</th>
                  <th className="py-2.5 text-right font-normal max-sm:hidden">
                    Solved
                  </th>
                  <th className="py-2.5 pr-5 text-right font-normal">Rating</th>
                </tr>
              </thead>
              <tbody>
                {top.map((p) => (
                  <tr key={p.handle} className="border-t">
                    <td className="py-3 pl-5 text-muted-foreground tabular-nums">
                      {p.rank}
                    </td>
                    <td className="py-3">
                      <RatingName handle={p.handle} rating={p.rating} />
                    </td>
                    <td className="py-3 text-right tabular-nums max-sm:hidden">
                      {p.solved}
                    </td>
                    <td className="py-3 pr-5 text-right font-medium tabular-nums">
                      {p.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className={cn(container, 'py-20 md:py-24')}>
      <div className="relative overflow-hidden rounded-xl bg-primary px-6 py-12 text-primary-foreground md:px-12 md:py-16">
        {/* Decorative: the empty file the headline talks about, cropped by the card edge. */}
        <FileCode2
          aria-hidden
          strokeWidth={1.25}
          className="pointer-events-none absolute -bottom-16 left-[50%] size-72 -rotate-12 text-primary-foreground/15 max-md:-right-16 max-md:left-auto max-md:size-56"
        />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl">
              An empty App.tsx is waiting.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-primary-foreground/80 md:text-lg">
              Start with Todo List: one component, six tests, nothing to lean on
              but what you know.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 focus-visible:ring-primary-foreground/60"
            >
              <Link to={signedIn ? '/dashboard' : '/problems'}>
                {signedIn ? 'Go to dashboard' : 'Start practicing'}{' '}
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-primary-foreground ring-1 ring-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground dark:hover:bg-primary-foreground/10"
            >
              <Link to="/problems/$slug" params={{ slug: 'todo-list' }}>
                Open Todo List
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

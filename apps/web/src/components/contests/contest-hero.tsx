import { CalendarClock, Clock, ListChecks, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SampleNote } from '@/components/leaderboard/sample-note'
import type { Contest } from '@/lib/sample-data'
import { Countdown, RelativeStart } from './countdown'
import { formatDate, formatDuration, formatTime, kindLabel } from './format'

function register() {
  toast('Contests open with server grading', {
    description: 'Registration starts once submissions are graded on the server. Practice problems work today.',
  })
}

/** Decorative test-strip field: the brand's one-cell-per-test motif, scaled up. */
function StripField() {
  const rows = 6
  const cols = 8
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = (r * 7 + c * 13 + r * c) % 9
      const opacity = c < 4 + r ? (v < 6 ? 0.34 : 0.14) : v < 2 ? 0.2 : 0.07
      cells.push(
        <rect key={`${r}-${c}`} x={c * 22} y={r * 22} width="16" height="16" rx="4" fill="white" fillOpacity={opacity} />,
      )
    }
  }
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${cols * 22} ${rows * 22}`}
      className="pointer-events-none absolute top-1/2 right-[380px] hidden h-[132px] w-auto -translate-y-1/2 [mask-image:linear-gradient(to_right,transparent,black_45%)] xl:block"
    >
      {cells}
    </svg>
  )
}

export function ContestHero({ contest }: { contest: Contest }) {
  return (
    <section
      aria-labelledby="next-contest"
      className="relative overflow-hidden rounded-lg bg-primary text-primary-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-black/10"
      />
      <StripField />
      <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 id="next-contest" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {contest.name}
          </h2>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-primary-foreground/85">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden />
              <dt className="sr-only">Starts</dt>
              <dd>
                {formatDate(contest.startsAt)}, {formatTime(contest.startsAt)}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              <dt className="sr-only">Duration</dt>
              <dd>{formatDuration(contest.durationMin)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <ListChecks className="size-4" aria-hidden />
              <dt className="sr-only">Problems</dt>
              <dd>{contest.problems} problems</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
              Next contest · {kindLabel[contest.kind]}
            </span>
            <SampleNote className="border-white/40 text-primary-foreground/85" />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:flex-col lg:items-end">
          <Countdown startsAt={contest.startsAt} />
          <Button
            size="lg"
            onClick={register}
            className="bg-white font-semibold text-primary shadow-sm hover:bg-white/90 focus-visible:ring-white/60"
          >
            Register
          </Button>
        </div>
      </div>
    </section>
  )
}

export function UpcomingCard({ contest }: { contest: Contest }) {
  return (
    <section
      aria-label={contest.name}
      className="flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-center">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            {formatDate(contest.startsAt).split(', ')[1]?.split(' ')[0]}
          </span>
          <span className="text-lg leading-none font-bold tabular-nums">{new Date(contest.startsAt).getUTCDate()}</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{contest.name}</h3>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {kindLabel[contest.kind]}
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>
              {formatDate(contest.startsAt)}, {formatTime(contest.startsAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer className="size-3.5" aria-hidden />
              {formatDuration(contest.durationMin)} · {contest.problems} problems
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:shrink-0">
        <RelativeStart startsAt={contest.startsAt} className="text-sm font-medium text-brand" />
        <Button variant="outline" onClick={register}>
          Register
        </Button>
      </div>
    </section>
  )
}

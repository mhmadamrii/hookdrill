import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarClock,
  Route as RouteIcon,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useDailyProblem } from '@/lib/daily'
import { aiEngineer } from '@hookdrill/courses'
import { upcomingContests } from '@/lib/sample-data'

const card =
  'group relative isolate flex min-h-[160px] flex-col justify-between overflow-hidden rounded-xl p-5 text-white outline-none transition-[transform,filter] duration-300 ease-out hover:brightness-110 focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

function Cta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-white/95 px-3 text-xs font-semibold text-[#14172b] transition-colors group-hover:bg-white">
      {children}
      <ArrowRight className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
    </span>
  )
}

/* Decorative fills are fixed hex values, deliberately the same in both themes. */

function DailyArt() {
  // A grid of test cells: the brand's signature, most of them passing.
  const pattern = [
    1, 1, 1, 0, 1, 1, 1, 1, 1, 0.4, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0.4, 1, 1, 1,
  ]
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 150"
      className="absolute -right-6 bottom-0 -z-10 h-[78%] w-auto"
    >
      <circle cx="170" cy="20" r="80" fill="#ffffff" opacity="0.08" />
      <circle cx="170" cy="20" r="52" fill="#ffffff" opacity="0.07" />
      {pattern.map((v, i) => (
        <rect
          key={i}
          x={84 + (i % 6) * 18}
          y={70 + Math.floor(i / 6) * 18}
          width="13"
          height="13"
          rx="3"
          fill={v === 0 ? '#ff8aa3' : '#b8ffde'}
          opacity={v === 0 ? 0.85 : 0.22 + (v === 1 ? (i % 5) * 0.09 : 0)}
        />
      ))}
    </svg>
  )
}

function TrackArt() {
  // Ascending steps along a path: progress through a plan.
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 150"
      className="absolute -right-4 top-0 -z-10 h-full w-auto"
    >
      <path
        d="M40 140 C 90 135, 110 90, 150 70 S 200 20, 220 10"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeDasharray="4 6"
        fill="none"
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={84 + i * 28}
          y={112 - i * 26}
          width="22"
          height={38 + i * 26}
          rx="5"
          fill="#ffffff"
          opacity={0.1 + i * 0.05}
        />
      ))}
      <circle cx="176" cy="22" r="7" fill="#ffd36b" />
      <circle cx="176" cy="22" r="14" fill="#ffd36b" opacity="0.25" />
    </svg>
  )
}

function ContestArt() {
  // A countdown dial.
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 150"
      className="absolute -right-10 top-0 -z-10 h-full w-auto"
    >
      <circle
        cx="150"
        cy="78"
        r="62"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="14"
      />
      <circle
        cx="150"
        cy="78"
        r="62"
        fill="none"
        stroke="#ffc9d6"
        strokeOpacity="0.7"
        strokeWidth="14"
        strokeDasharray="120 400"
        strokeLinecap="round"
        transform="rotate(-90 150 78)"
      />
      <circle cx="150" cy="78" r="34" fill="#ffffff" opacity="0.08" />
      <path
        d="M150 78 L150 56 M150 78 L166 86"
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

const contestDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

export function Banners() {
  const { daily } = useDailyProblem()
  const contest = upcomingContests[0]
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {daily ? (
        <Link
          to="/problems/$slug"
          params={{ slug: daily.slug }}
          className={cn(card, 'bg-banner-daily')}
        >
          <DailyArt />
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              {daily.title}
            </h3>
            <p className="mt-1.5 flex max-w-[26ch] flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
              <Chip>
                <Zap className="size-3" /> Daily problem
              </Chip>
              <span className="font-medium text-white capitalize">
                {daily.difficulty}
              </span>
            </p>
          </div>
          <Cta>Solve today's problem</Cta>
        </Link>
      ) : (
        <div aria-busy className={cn(card, 'bg-banner-daily')}>
          <DailyArt />
          <div>
            <span className="block h-7 w-44 rounded-md bg-white/20" />
            <span className="mt-2 block h-5 w-32 rounded-full bg-white/15" />
          </div>
          <span className="block h-8 w-40 rounded-full bg-white/20" />
        </div>
      )}

      <Link
        to="/courses/$course"
        params={{ course: aiEngineer.slug }}
        className={cn(card, 'bg-banner-plan')}
      >
        <TrackArt />
        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            {aiEngineer.title}
          </h3>
          <p className="mt-1.5 flex max-w-[24ch] flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
            <Chip>
              <RouteIcon className="size-3" /> Course
            </Chip>
            Module 01 open · {aiEngineer.level}
          </p>
        </div>
        <Cta>Start the course</Cta>
      </Link>

      <Link
        to="/contests"
        className={cn(card, 'bg-banner-contest sm:col-span-2 xl:col-span-1')}
      >
        <ContestArt />
        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            {contest.name}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
            <Chip>
              <CalendarClock className="size-3" /> Next contest · Sample
            </Chip>
            {contestDate.format(new Date(contest.startsAt))} UTC ·{' '}
            {contest.durationMin} min
          </p>
        </div>
        <Cta>See contest details</Cta>
      </Link>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-2xs font-medium text-white">
      {children}
    </span>
  )
}

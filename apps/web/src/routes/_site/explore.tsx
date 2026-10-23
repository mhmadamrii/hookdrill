import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Atom, Binary, Check, Lock, Play } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { TrackMeta, TrackProgress } from '@/components/explore/track-card'
import { DifficultyText } from '@/components/difficulty'
import { Button } from '@/components/ui/button'
import { problems, type Track } from '@/lib/problems'
import { studyTracks } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_site/explore')({
  head: () => ({ meta: [{ title: 'Explore · HookDrill' }] }),
  component: Explore,
})

interface Skill {
  name: string
  track: Track
  tags: string[]
}

const skills: Skill[] = [
  { name: 'React state', track: 'react', tags: ['State', 'Derived State', 'History'] },
  { name: 'Lists & ordering', track: 'react', tags: ['Lists', 'Sorting', 'Reordering', 'Drag and Drop'] },
  { name: 'Accessibility', track: 'react', tags: ['Accessibility', 'Keyboard', 'Focus'] },
  { name: 'Async UI', track: 'react', tags: ['Async', 'Pagination'] },
  { name: 'Timers & effects', track: 'react', tags: ['Timers', 'Effects'] },
  { name: 'Forms', track: 'react', tags: ['Forms', 'Validation'] },
  { name: 'Performance', track: 'react', tags: ['Performance'] },
  { name: 'Arrays', track: 'dsa', tags: ['Array', 'Two Pointers', 'Binary Search'] },
  { name: 'Strings', track: 'dsa', tags: ['String', 'Sliding Window'] },
  { name: 'Hash tables', track: 'dsa', tags: ['Hash Table'] },
  { name: 'Graphs & trees', track: 'dsa', tags: ['Graph', 'BFS', 'Tree'] },
  { name: 'Dynamic programming', track: 'dsa', tags: ['Dynamic Programming'] },
  { name: 'Stacks & design', track: 'dsa', tags: ['Stack', 'Design'] },
]

function skillStats(s: Skill) {
  const list = problems.filter((p) => p.tags.some((t) => s.tags.includes(t)))
  return {
    total: list.length,
    open: list.filter((p) => p.playable).length,
    easy: list.filter((p) => p.difficulty === 'easy').length,
    medium: list.filter((p) => p.difficulty === 'medium').length,
    hard: list.filter((p) => p.difficulty === 'hard').length,
  }
}

const featured = studyTracks[0]
const featuredSteps = ['todo-list', 'playlist-builder', 'counter-with-undo', 'star-rating', 'shopping-cart']
  .map((slug) => problems.find((p) => p.slug === slug))
  .filter((p) => p !== undefined)

function FeaturedTrack() {
  return (
    <article className="relative overflow-hidden rounded-xl border bg-card lg:col-span-3">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-28"
        style={{ background: 'linear-gradient(120deg, #3340c9 0%, #5363f5 60%, #7c6cf5 100%)' }}
      >
        <svg viewBox="0 0 600 112" preserveAspectRatio="xMaxYMid slice" className="h-full w-full">
          <circle cx="560" cy="10" r="90" fill="#ffffff" opacity="0.08" />
          <circle cx="470" cy="120" r="60" fill="#ffffff" opacity="0.06" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={330 + i * 20}
              y={70}
              width="14"
              height="14"
              rx="3"
              fill="#b8ffde"
              opacity={i < 2 ? 0.9 : 0.18}
            />
          ))}
        </svg>
      </div>
      <div className="relative px-5 pt-16 pb-5 sm:px-6">
        <span className="grid size-14 place-items-center rounded-xl border-4 border-card bg-secondary">
          <Atom className="size-7 text-brand" />
        </span>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{featured.title}</h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">{featured.blurb}</p>
          </div>
          <Button asChild>
            <Link to="/problems/$slug" params={{ slug: 'todo-list' }}>
              <Play /> Start with Todo List
            </Link>
          </Button>
        </div>
        <TrackMeta track={featured} className="mt-4" />

        <ol className="mt-5 divide-y rounded-lg border">
          {featuredSteps.map((p, i) => (
            <li key={p.slug}>
              {p.playable ? (
                <Link
                  to="/problems/$slug"
                  params={{ slug: p.slug }}
                  className="flex h-11 items-center gap-3 px-3 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
                >
                  <span className="w-5 text-right text-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="flex-1 truncate font-medium">{p.title}</span>
                  <DifficultyText level={p.difficulty} short />
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ) : (
                <div className="flex h-11 items-center gap-3 px-3 text-sm text-muted-foreground">
                  <span className="w-5 text-right tabular-nums">{i + 1}</span>
                  <span className="flex-1 truncate">{p.title}</span>
                  <DifficultyText level={p.difficulty} short className="opacity-60" />
                  <Lock className="size-4" aria-label="Coming soon" />
                </div>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing 5 of {featured.problems}. Locked steps open when their tests ship.
        </p>
      </div>
    </article>
  )
}

function OtherReactTracks() {
  const rest = studyTracks.filter((t) => t.track === 'react' && t.slug !== featured.slug)
  return (
    <div className="flex flex-col rounded-xl border bg-card lg:col-span-2">
      <h3 className="border-b px-5 py-3.5 text-sm font-semibold">More React UI plans</h3>
      <ul className="flex flex-1 flex-col divide-y">
        {rest.map((t) => (
          <li key={t.slug} className="flex flex-1 flex-col justify-center gap-2 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t.blurb}</p>
              </div>
            </div>
            <TrackMeta track={t} />
            <TrackProgress />
          </li>
        ))}
      </ul>
    </div>
  )
}

function DsaTracks() {
  const dsa = studyTracks.filter((t) => t.track === 'dsa')
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
      {dsa.map((t, i) => (
        <article key={t.slug} className="relative flex gap-4 overflow-hidden rounded-xl border bg-card p-5">
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-lg text-white"
            style={{ background: i === 0 ? 'linear-gradient(135deg,#064f48,#0b7f70)' : 'linear-gradient(135deg,#5a1630,#a62a50)' }}
          >
            <Binary className="size-6" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">{t.title}</h3>
              <span className="text-xs text-muted-foreground">DSA track arrives later</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.blurb}</p>
            <TrackMeta track={t} />
            <TrackProgress />
          </div>
        </article>
      ))}
    </div>
  )
}

function SkillGroup({ track }: { track: Track }) {
  const list = skills.filter((s) => s.track === track).map((s) => ({ ...s, ...skillStats(s) }))
  const Icon = track === 'react' ? Atom : Binary
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn('size-4', track === 'react' ? 'text-brand' : 'text-easy')} />
        {track === 'react' ? 'React UI' : 'Data structures & algorithms'}
      </h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s.name}>
            <Link
              to="/problems"
              search={{ tag: s.tags[0] }}
              className="group flex flex-col gap-2.5 rounded-lg border bg-card px-4 py-3 outline-none transition-colors hover:border-ring/40 hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium group-hover:text-brand">{s.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  <span className="font-semibold text-foreground">{s.total}</span>{' '}
                  {s.total === 1 ? 'problem' : 'problems'}
                </span>
              </div>
              <div
                className="flex h-1.5 gap-0.5 overflow-hidden rounded-full"
                role="img"
                aria-label={`${s.easy} easy, ${s.medium} medium, ${s.hard} hard`}
              >
                {s.easy > 0 && <span className="bg-easy" style={{ flex: s.easy }} />}
                {s.medium > 0 && <span className="bg-medium" style={{ flex: s.medium }} />}
                {s.hard > 0 && <span className="bg-hard" style={{ flex: s.hard }} />}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {s.open > 0 ? (
                  <>
                    <Check className="size-3.5 text-accepted" />
                    {s.open} open now
                  </>
                ) : (
                  <>
                    <Lock className="size-3" />
                    Coming soon
                  </>
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Explore() {
  return (
    <>
      <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Explore</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Follow a study plan from start to finish, or pick one skill and drill it until the
              tests pass on the first run.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/problems">
              Browse all problems <ArrowRight />
            </Link>
          </Button>
        </header>

        <section id="tracks" aria-labelledby="tracks-h" className="mt-10 scroll-mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="tracks-h" className="text-xl font-semibold tracking-tight">
              Study tracks
            </h2>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Sample plans · progress shows 0% until you solve their problems
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            <FeaturedTrack />
            <OtherReactTracks />
            <DsaTracks />
          </div>
        </section>

        <section aria-labelledby="skills-h" className="mt-14">
          <h2 id="skills-h" className="text-xl font-semibold tracking-tight">
            Skills
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Problem counts by skill across the library. The bar shows the easy, medium and hard mix.
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-2">
            <SkillGroup track="react" />
            <SkillGroup track="dsa" />
          </div>
        </section>

        <section
          aria-labelledby="interview-h"
          className="relative mt-14 overflow-hidden rounded-xl bg-[#14172b] px-6 py-8 text-white md:px-10"
        >
          <svg aria-hidden viewBox="0 0 400 200" className="absolute top-0 right-0 h-full w-auto opacity-90 max-md:opacity-40">
            <circle cx="360" cy="40" r="120" fill="#4f5df0" opacity="0.35" />
            <circle cx="300" cy="190" r="70" fill="#00b8a3" opacity="0.18" />
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={170 + i * 22} y={150} width="16" height="16" rx="3" fill={i === 5 ? '#ff8aa3' : '#b8ffde'} opacity={i === 5 ? 0.8 : 0.35} />
            ))}
          </svg>
          <div className="relative max-w-xl">
            <h2 id="interview-h" className="text-2xl font-semibold tracking-tight">
              Prepare for interviews
            </h2>
            <p className="mt-2 text-white/80">
              Front-end interviews ask you to build a working component in under an hour. Practise
              the same thing: no AI, no copy-paste, just you, the editor and the tests.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild className="bg-white text-[#14172b] hover:bg-white/90">
                <Link to="/problems" search={{ track: 'react' }}>
                  Practise React UI problems
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link to="/problems">Open the problem library</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { listChallenges } from '@hookdrill/challenges'
import { DifficultyBadge } from '#/components/ui/DifficultyBadge'
import { Barline } from '@/components/ui/barline'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/')({
  loader: () => listChallenges(),
  component: Home,
})

function Home() {
  const challenges = Route.useLoaderData()
  const { data: session } = useSession()
  const trpc = useTRPC()
  const progress = useQuery({
    ...trpc.progress.list.queryOptions(),
    enabled: !!session,
  })
  const bySlug = new Map(progress.data?.map((p) => [p.slug, p]))

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="border-b-2 border-ink pb-4 text-5xl font-extrabold tracking-tight">
        <span className="text-cover">Book I</span> · Études
      </h1>
      <ul>
        {challenges.map((c, i) => {
          const p = bySlug.get(c.slug)
          return (
            <li key={c.id} className="border-b border-rule">
              <Link
                to="/challenges/$slug"
                params={{ slug: c.slug }}
                className="grid grid-cols-[5rem_1fr_auto_3rem] items-center gap-4 py-4 hover:bg-rule-soft/60"
              >
                <span className="text-sm font-bold text-cover">
                  Op. {i + 1}
                </span>
                <span>
                  <span className="block text-lg font-bold">{c.title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {p ? describe(p) : c.summary}
                  </span>
                </span>
                <DifficultyBadge difficulty={c.difficulty} />
                <Barline
                  state={p ? 'practice' : 'open'}
                  className="justify-self-end"
                />
              </Link>
            </li>
          )
        })}
      </ul>
      {!session && (
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/signin" className="underline">
            Sign in
          </Link>{' '}
          to save drafts and keep a practice record.
        </p>
      )}
    </main>
  )
}

function describe(p: {
  runs: number
  lastPassed: number
  lastTotal: number
  publicPassedAt: Date | null
}) {
  const runs = `${p.runs} ${p.runs === 1 ? 'run' : 'runs'}`
  if (p.publicPassedAt) return `Public tests passed · ${runs}`
  if (p.runs === 0) return 'Started'
  return `${runs} · last ${p.lastPassed}/${p.lastTotal}`
}

import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { listChallenges } from '@hookdrill/challenges'
import { Barline } from '@/components/ui/barline'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/me')({
  component: PracticeRecord,
})

function PracticeRecord() {
  const { data: session, isPending } = useSession()
  const trpc = useTRPC()
  const progress = useQuery({
    ...trpc.progress.list.queryOptions(),
    enabled: !!session,
  })

  if (isPending || (session && progress.isPending)) {
    return <p className="p-6 text-muted-foreground">Loading…</p>
  }
  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Practice record
        </h1>
        <p className="mt-3 text-ink-2">
          Sign in to keep a record of the études you practise.
        </p>
        <Button asChild variant="next" className="mt-6">
          <Link to="/signin">Sign in</Link>
        </Button>
      </main>
    )
  }

  const bySlug = new Map(progress.data?.map((p) => [p.slug, p]))
  const challenges = listChallenges()
  const passed = progress.data?.filter((p) => p.publicPassedAt).length ?? 0

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
        <h1 className="text-5xl font-extrabold tracking-tight">
          {session.user.name}
        </h1>
        <p className="text-sm text-ink-2">
          Public tests passed on <b className="text-ink">{passed}</b> of{' '}
          {challenges.length} études
        </p>
      </div>
      <p className="mt-4 max-w-prose text-sm text-muted-foreground">
        This record comes from tests run in your browser. Points and rankings
        start when submissions are graded on the server.
      </p>
      <ol className="mt-8 grid grid-cols-2 border-y border-ink md:grid-cols-5">
        {challenges.map((c, i) => {
          const p = bySlug.get(c.slug)
          return (
            <li
              key={c.id}
              className="flex items-stretch border-b border-rule md:border-b-0"
            >
              <Link
                to="/challenges/$slug"
                params={{ slug: c.slug }}
                className="flex flex-1 flex-col gap-1 p-4 hover:bg-rule-soft"
              >
                <span className="text-xs font-bold text-cover">
                  Op. {i + 1}
                </span>
                <span className="text-sm font-bold">{c.title}</span>
                <span className="text-xs text-muted-foreground">
                  {!p
                    ? 'Not played'
                    : p.publicPassedAt
                      ? 'Public tests passed'
                      : `${p.runs} ${p.runs === 1 ? 'run' : 'runs'}`}
                </span>
              </Link>
              <Barline
                state={p ? 'practice' : 'open'}
                className="my-3 h-auto"
              />
            </li>
          )
        })}
      </ol>
    </main>
  )
}

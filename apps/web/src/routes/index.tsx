import { Link, createFileRoute } from '@tanstack/react-router'
import { listChallenges } from '@hookdrill/challenges'
import { DifficultyBadge } from '#/components/ui/DifficultyBadge'

export const Route = createFileRoute('/')({
  loader: () => listChallenges(),
  component: Home,
})

function Home() {
  const challenges = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Challenges</h1>
      <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {challenges.map((c) => (
          <li key={c.id}>
            <Link
              to="/challenges/$slug"
              params={{ slug: c.slug }}
              className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50"
            >
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-zinc-500">{c.summary}</div>
              </div>
              <DifficultyBadge difficulty={c.difficulty} />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

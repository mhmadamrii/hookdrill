import { createFileRoute, notFound } from '@tanstack/react-router'
import { getChallenge } from '@hookdrill/challenges'
import { ChallengeWorkspace } from '#/features/challenge-workspace'

export const Route = createFileRoute('/challenges/$slug')({
  // The workspace is iframes + browser-only code; skip server rendering.
  ssr: false,
  loader: async ({ params }) => {
    const challenge = await getChallenge(params.slug)
    if (!challenge) throw notFound()
    return challenge
  },
  pendingComponent: () => <p className="p-6 text-zinc-500">Loading…</p>,
  notFoundComponent: () => <p className="p-6">Challenge not found.</p>,
  component: ChallengePage,
})

function ChallengePage() {
  const challenge = Route.useLoaderData()
  return <ChallengeWorkspace key={challenge.slug} challenge={challenge} />
}

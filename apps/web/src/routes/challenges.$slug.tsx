import { useEffect, useRef } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getChallenge,
  type Challenge,
  type FileMap,
} from '@hookdrill/challenges'
import { ChallengeWorkspace } from '#/features/challenge-workspace'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc'

const SAVE_DELAY_MS = 800

export const Route = createFileRoute('/challenges/$slug')({
  // The workspace is iframes + browser-only code; skip server rendering.
  ssr: false,
  loader: async ({ params }) => {
    const challenge = await getChallenge(params.slug)
    if (!challenge) throw notFound()
    return challenge
  },
  pendingComponent: Loading,
  notFoundComponent: () => <p className="p-6">Challenge not found.</p>,
  component: ChallengePage,
})

function Loading() {
  return <p className="p-6 text-muted-foreground">Loading…</p>
}

function ChallengePage() {
  const challenge = Route.useLoaderData()
  const { data: session, isPending } = useSession()

  if (isPending) return <Loading />
  if (!session) {
    return (
      <ChallengeWorkspace
        key={challenge.slug}
        challenge={challenge}
        status={
          <>
            <Link to="/signin" className="underline">
              Sign in
            </Link>{' '}
            to save your draft
          </>
        }
      />
    )
  }
  return <SignedInWorkspace challenge={challenge} />
}

function SignedInWorkspace({ challenge }: { challenge: Challenge }) {
  const { slug } = challenge
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const draft = useQuery({
    ...trpc.drafts.get.queryOptions({ slug }),
    // Loaded once per visit; the editor owns the code after that.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
  const progress = useQuery(trpc.progress.list.queryOptions())

  const save = useMutation(trpc.drafts.save.mutationOptions())
  const invalidateProgress = () =>
    queryClient.invalidateQueries({ queryKey: trpc.progress.list.queryKey() })
  const recordRun = useMutation(
    trpc.progress.recordRun.mutationOptions({ onSuccess: invalidateProgress }),
  )
  const revealHint = useMutation(
    trpc.progress.revealHint.mutationOptions({ onSuccess: invalidateProgress }),
  )

  // Debounced autosave; a pending save is flushed when leaving the page.
  const pending = useRef<{ files: FileMap; timer: number } | null>(null)
  const saveRef = useRef(save.mutate)
  saveRef.current = save.mutate
  useEffect(
    () => () => {
      if (!pending.current) return
      clearTimeout(pending.current.timer)
      saveRef.current({ slug, files: pending.current.files })
    },
    [slug],
  )
  function onFilesChange(files: FileMap) {
    if (pending.current) clearTimeout(pending.current.timer)
    const timer = window.setTimeout(() => {
      pending.current = null
      save.mutate({ slug, files })
    }, SAVE_DELAY_MS)
    pending.current = { files, timer }
  }

  if (draft.isPending || progress.isPending) return <Loading />

  const mine = progress.data?.find((p) => p.slug === slug)
  const status = save.isError
    ? "Couldn't save draft"
    : save.isPending
      ? 'Saving…'
      : save.data
        ? `Draft saved ${time(save.data.updatedAt)}`
        : draft.data
          ? `Draft from ${time(draft.data.updatedAt)}`
          : null

  return (
    <ChallengeWorkspace
      key={slug}
      challenge={challenge}
      initialFiles={draft.data?.files}
      initialHintsRevealed={mine?.hintsRevealed ?? 0}
      onFilesChange={onFilesChange}
      onTestRunComplete={(r) => recordRun.mutate({ slug, ...r })}
      onHintReveal={(count) => revealHint.mutate({ slug, count })}
      status={status}
    />
  )
}

function time(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

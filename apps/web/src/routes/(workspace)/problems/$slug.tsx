import { Suspense, lazy, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ListTree, Shuffle } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { useSettledSession } from '@/lib/auth-client'
import { findProblem, playableProblems } from '@/lib/problems'
import { useTRPC } from '@/lib/trpc'

import {
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from '@tanstack/react-router'

import {
  getChallenge,
  type Challenge,
  type FileMap,
} from '@hookdrill/challenges'
import type { ChallengeWorkspaceProps } from '#/features/challenge-workspace'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const SAVE_DELAY_MS = 800

// Sandpack is browser-only. A static import would be bundled into the server
// function (Nitro) and crash it with "self is not defined", so load it lazily.
const LazyWorkspace = lazy(() =>
  import('#/features/challenge-workspace').then((m) => ({
    default: m.ChallengeWorkspace,
  })),
)

function ChallengeWorkspace(props: ChallengeWorkspaceProps) {
  return (
    <Suspense fallback={<Loading />}>
      <LazyWorkspace {...props} />
    </Suspense>
  )
}

export const Route = createFileRoute('/(workspace)/problems/$slug')({
  // The workspace is iframes + browser-only code; skip server rendering.
  ssr: false,
  loader: async ({ params }) => {
    const challenge = await getChallenge(params.slug)
    if (!challenge) throw notFound()
    return challenge
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} · HookDrill` : 'HookDrill' },
    ],
  }),
  pendingComponent: Loading,
  component: ProblemPage,
})

function Loading() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
      Loading problem…
    </div>
  )
}

function ProblemPage() {
  const challenge = Route.useLoaderData()
  const { session, isPending } = useSettledSession()
  if (isPending) return <Loading />
  return session ? (
    <SignedInWorkspace challenge={challenge} />
  ) : (
    <ChallengeWorkspace
      key={challenge.slug}
      {...common(challenge)}
      record={null}
      signedIn={false}
      status={
        <>
          <Link to="/signin" className="text-brand hover:underline">
            Sign in
          </Link>{' '}
          to save your code
        </>
      }
    />
  )
}

/** Props shared by the signed-in and signed-out workspace. */
function common(
  challenge: Challenge,
): Pick<
  ChallengeWorkspaceProps,
  'challenge' | 'number' | 'tags' | 'nav' | 'actions'
> {
  const meta = findProblem(challenge.slug)
  return {
    challenge,
    number: meta?.number ?? 0,
    tags: meta?.tags ?? [],
    nav: <ProblemNav slug={challenge.slug} />,
    actions: (
      <>
        <ThemeToggle />
        <UserMenu />
      </>
    ),
  }
}

function ProblemNav({ slug }: { slug: string }) {
  const navigate = useNavigate()
  const i = playableProblems.findIndex((p) => p.slug === slug)
  const prev = playableProblems[i - 1]
  const next = playableProblems[i + 1]
  const go = (s: string) =>
    navigate({ to: '/problems/$slug', params: { slug: s } })
  const others = playableProblems.filter((p) => p.slug !== slug)

  return (
    <>
      <Link to="/" aria-label="HookDrill home" className="mr-1 shrink-0">
        <LogoMark className="size-6" />
      </Link>
      <Button asChild variant="ghost" size="sm" className="max-sm:hidden">
        <Link to="/problems">
          <ListTree /> Problem List
        </Link>
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!prev}
            onClick={() => prev && go(prev.slug)}
            aria-label="Previous problem"
          >
            <ChevronLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {prev ? `Previous: ${prev.title}` : 'First problem'}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!next}
            onClick={() => next && go(next.slug)}
            aria-label="Next problem"
          >
            <ChevronRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {next ? `Next: ${next.title}` : 'Last playable problem'}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="max-sm:hidden"
            disabled={others.length === 0}
            onClick={() =>
              go(others[Math.floor(Math.random() * others.length)].slug)
            }
            aria-label="Random problem"
          >
            <Shuffle />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Random problem</TooltipContent>
      </Tooltip>
    </>
  )
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
  const invalidateProgress = () => queryClient.invalidateQueries({ queryKey: trpc.progress.list.queryKey() }) // prettier-ignore
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

  const mine = progress.data?.find((p) => p.slug === slug) ?? null
  const status = save.isError
    ? "Couldn't save"
    : save.isPending
      ? 'Saving…'
      : save.data
        ? `Saved ${time(save.data.updatedAt)}`
        : draft.data
          ? `Restored from ${time(draft.data.updatedAt)}`
          : 'Saved'

  return (
    <ChallengeWorkspace
      key={slug}
      {...common(challenge)}
      record={mine}
      signedIn
      initialFiles={draft.data?.files}
      initialHintsRevealed={mine?.hintsRevealed ?? 0}
      onFilesChange={onFilesChange}
      onTestRunComplete={(r) => {
        // An interrupted run measured the browser, not the code.
        if (!r.interrupted)
          recordRun.mutate({ slug, passed: r.passed, total: r.total })
      }}
      onHintReveal={(count) => revealHint.mutate({ slug, count })}
      status={status}
    />
  )
}

function time(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogIn,
  Send,
  ShieldAlert,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  designFieldMaxLength,
  designFields,
  findItem,
  type DesignChallenge,
  type DesignField,
  type LevelCourse,
} from '@hookdrill/courses'
import { Prose } from '@/components/courses/blocks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useLevelProgress } from '@/lib/courses'
import { useTRPC } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import { ItemNav, MissingPrerequisites } from './lesson-view'

type Answers = Record<DesignField, string>
const emptyAnswers = () =>
  Object.fromEntries(designFields.map((f) => [f.id, ''])) as Answers

const savedAt = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
})

function Brief({
  title,
  challenge,
}: {
  title: string
  challenge: DesignChallenge
}) {
  const lists: Array<[string, string[]]> = [
    ['Business requirements', challenge.requirements],
    ['Expected traffic and scale', challenge.scale],
    ['Constraints', challenge.constraints],
  ]
  return (
    <>
      <div className="mt-6">
        <Prose source={challenge.brief} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {lists.map(([heading, items]) => (
          <section key={heading} className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">{heading}</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed marker:text-muted-foreground">
              {items.map((i) => (
                <li key={i} className="my-1">
                  {i}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section
        aria-labelledby="instructions-h"
        className="mt-6 rounded-lg border bg-card p-4"
      >
        <h2 id="instructions-h" className="text-sm font-semibold">
          Assessment instructions
        </h2>
        <div className="mt-2 text-[15px]">
          <Prose source={challenge.instructions} />
        </div>
      </section>
      <section aria-labelledby="rubric-h" className="mt-6">
        <h2 id="rubric-h" className="text-lg font-semibold tracking-tight">
          How {title} is graded
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rubric v{challenge.rubric.version}. Pass with{' '}
          {challenge.rubric.passMark}/100. Any well-reasoned design can score
          well; the grader judges reasoning against these criteria, not one
          reference answer.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-surface-2/60 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Criterion
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Weight
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  A strong answer
                </th>
              </tr>
            </thead>
            <tbody>
              {challenge.rubric.criteria.map((c) => (
                <tr key={c.id} className="border-t align-top">
                  <td className="px-4 py-3 font-medium">
                    {c.title}
                    {c.minScore !== undefined && (
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        Needs {c.minScore}+ to pass
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.weight}
                  </td>
                  <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export function ChallengeView({
  course,
  slug,
  challenge,
}: {
  course: LevelCourse
  slug: string
  challenge: DesignChallenge
}) {
  const trpc = useTRPC()
  const progress = useLevelProgress(course)
  const { item } = findItem(course, slug)!
  const state = progress.levels
    .flatMap((l) => l.items)
    .find((i) => i.item.slug === slug)!
  const signedIn = progress.signedIn
  const grading = useQuery(trpc.design.grading.queryOptions())
  const submission = useQuery({
    ...trpc.design.submission.queryOptions({
      course: course.slug,
      challenge: slug,
    }),
    enabled: signedIn,
  })

  const header = (
    <>
      <p className="text-sm text-muted-foreground">
        <Link
          to="/courses/$course/curriculum"
          params={{ course: course.slug }}
          hash={slug}
          className="hover:text-foreground"
        >
          Design challenge · v{challenge.version}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        {item.title}
      </h1>
      <p className="mt-2 text-muted-foreground">{item.summary}</p>
    </>
  )

  return (
    <article className="max-w-4xl pb-6">
      {header}
      <Brief title={item.title} challenge={challenge} />
      <div className="mt-10">
        {progress.isLoading || (signedIn && submission.isPending) ? (
          <Skeleton className="h-64 w-full" />
        ) : state.status === 'locked' ? (
          <MissingPrerequisites
            course={course}
            missing={state.missing}
            what="challenge"
          />
        ) : !signedIn ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Sign in to write drafts and submit your design for grading.
            </p>
            <Button asChild>
              <Link to="/signin">
                <LogIn /> Sign in
              </Link>
            </Button>
          </div>
        ) : submission.data && submission.data.status !== 'failed' ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
            <p className="flex items-center gap-2 text-sm">
              {submission.data.status === 'evaluating' ? (
                <Loader2 className="size-4 animate-spin text-brand" />
              ) : (
                <CheckCircle2 className="size-4 text-accepted" />
              )}
              {submission.data.status === 'evaluating'
                ? 'Your design is being graded.'
                : `Submitted and graded: ${submission.data.score}/100.`}
            </p>
            <Button asChild>
              <Link
                to="/courses/$course/challenge/$slug/result"
                params={{ course: course.slug, slug }}
              >
                See your result
              </Link>
            </Button>
          </div>
        ) : (
          <SubmissionForm
            course={course}
            slug={slug}
            gradingAvailable={grading.data?.available ?? false}
            stub={grading.data?.stub ?? false}
            failure={
              submission.data?.status === 'failed'
                ? (submission.data.error ?? 'Grading failed')
                : null
            }
            fieldHints={challenge.fieldHints}
          />
        )}
      </div>
      <ItemNav course={course} slug={slug} />
    </article>
  )
}

function SubmissionForm({
  course,
  slug,
  gradingAvailable,
  stub,
  failure,
  fieldHints,
}: {
  course: LevelCourse
  slug: string
  gradingAvailable: boolean
  stub: boolean
  failure: string | null
  fieldHints?: DesignChallenge['fieldHints']
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const ids = { course: course.slug, challenge: slug }
  const draft = useQuery(trpc.design.draft.queryOptions(ids))
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [dirty, setDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const loaded = useRef(false)
  const [confirming, setConfirming] = useState(false)
  const idempotencyKey = useRef<string | null>(null)

  useEffect(() => {
    if (loaded.current || draft.isPending) return
    loaded.current = true
    if (draft.data) {
      setAnswers({ ...emptyAnswers(), ...draft.data.answers })
      setLastSaved(new Date(draft.data.updatedAt))
    }
  }, [draft.isPending, draft.data])

  const save = useMutation({
    ...trpc.design.saveDraft.mutationOptions(),
    onSuccess: (row) => {
      setDirty(false)
      setLastSaved(new Date(row.updatedAt))
    },
  })

  // Autosave a moment after typing stops.
  useEffect(() => {
    if (!dirty) return
    const t = setTimeout(() => save.mutate({ ...ids, answers }), 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, dirty])

  // Warn before leaving with unsaved typing.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const submit = useMutation({
    ...trpc.design.submit.mutationOptions(),
    onSuccess: async () => {
      setDirty(false)
      await queryClient.invalidateQueries({
        queryKey: trpc.design.submission.queryKey(ids),
      })
      void navigate({
        to: '/courses/$course/challenge/$slug/result',
        params: { course: course.slug, slug },
      })
    },
  })

  const empty = designFields.filter((f) => !answers[f.id].trim())
  const openConfirm = () => {
    idempotencyKey.current = crypto.randomUUID()
    submit.reset()
    setConfirming(true)
  }

  if (draft.isPending) return <Skeleton className="h-64 w-full" />

  return (
    <section aria-labelledby="answer-h">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="answer-h" className="text-xl font-semibold tracking-tight">
            Your design
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drafts save as you type, as often as you like. You submit once.
          </p>
        </div>
        <p
          className="text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {save.isPending
            ? 'Saving…'
            : save.isError
              ? 'Couldn’t save. Keep typing to retry.'
              : dirty
                ? 'Unsaved changes'
                : lastSaved
                  ? `Draft saved ${savedAt.format(lastSaved)}`
                  : 'Not saved yet'}
        </p>
      </div>

      {failure && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-medium/40 bg-medium/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-medium" />
          <span>
            Grading didn’t complete, so this attempt wasn’t used. Your answers
            are here; submit again when ready.
          </span>
        </p>
      )}

      <ol className="mt-5 flex flex-col gap-5">
        {designFields.map((f, i) => {
          const value = answers[f.id]
          const hint = fieldHints?.[f.id]
          return (
            <li key={f.id}>
              <label htmlFor={`f-${f.id}`} className="block font-medium">
                <span className="mr-2 text-muted-foreground tabular-nums">
                  {i + 1}.
                </span>
                {f.label}
              </label>
              <p
                id={`f-${f.id}-hint`}
                className="mt-0.5 text-sm text-muted-foreground"
              >
                {f.hint}
                {hint && <span className="block text-brand">{hint}</span>}
              </p>
              <textarea
                id={`f-${f.id}`}
                aria-describedby={`f-${f.id}-hint`}
                value={value}
                maxLength={designFieldMaxLength}
                rows={f.id === 'architecture' ? 9 : 5}
                onChange={(e) => {
                  setAnswers((a) => ({ ...a, [f.id]: e.target.value }))
                  setDirty(true)
                }}
                className="mt-2 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              />
              <p
                className={cn(
                  'mt-1 text-right text-xs tabular-nums',
                  value.length > designFieldMaxLength * 0.9
                    ? 'text-medium'
                    : 'text-muted-foreground',
                )}
              >
                {value.length.toLocaleString('en')} /{' '}
                {designFieldMaxLength.toLocaleString('en')}
              </p>
            </li>
          )
        })}
      </ol>

      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 py-4 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {!gradingAvailable
            ? 'AI grading isn’t available right now. Your draft is kept; submit later.'
            : empty.length
              ? `${designFields.length - empty.length} of ${designFields.length} fields filled`
              : 'All fields filled.'}
        </p>
        <Button
          onClick={openConfirm}
          disabled={!gradingAvailable || empty.length > 0}
        >
          <Send /> Submit final answer
        </Button>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your final design?</DialogTitle>
            <DialogDescription>
              You get one submission for this challenge version. After you
              submit, your answers are locked and graded against the rubric.
            </DialogDescription>
          </DialogHeader>
          <p className="flex items-start gap-2 rounded-md bg-secondary/70 p-3 text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              {stub
                ? 'This environment grades with an offline practice stub, not AI.'
                : 'Your answers are sent to Google’s Gemini API for grading. Don’t include personal or confidential information.'}
            </span>
          </p>
          {submit.error && (
            <p role="alert" className="text-sm text-destructive">
              {submit.error.message}
            </p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep editing
            </Button>
            <Button
              disabled={submit.isPending}
              onClick={() =>
                submit.mutate({
                  ...ids,
                  answers,
                  idempotencyKey: idempotencyKey.current!,
                })
              }
            >
              {submit.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Submitting…
                </>
              ) : (
                'Submit for grading'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

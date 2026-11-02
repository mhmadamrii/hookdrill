import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  XCircle,
} from 'lucide-react'
import {
  designFields,
  findItem,
  weakCriterionScore,
  type DesignChallenge,
  type LevelCourse,
} from '@hookdrill/courses'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettledSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc'
import { cn } from '@/lib/utils'

const when = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function ScoreBar({ score, min }: { score: number; min?: number }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn(
          'h-full rounded-full',
          min !== undefined && score < min
            ? 'bg-hard'
            : score < weakCriterionScore
              ? 'bg-medium'
              : 'bg-accepted',
        )}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

function Bullets({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'good' | 'bad' | 'plain'
}) {
  if (!items.length) return null
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
      <ul className="mt-1.5 flex flex-col gap-1.5 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            {tone === 'good' ? (
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-accepted" />
            ) : tone === 'bad' ? (
              <XCircle className="mt-0.5 size-3.5 shrink-0 text-hard" />
            ) : (
              <span
                aria-hidden
                className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground"
              />
            )}
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResultView({
  course,
  slug,
  challenge,
}: {
  course: LevelCourse
  slug: string
  challenge: DesignChallenge
}) {
  const trpc = useTRPC()
  const { session, isPending } = useSettledSession()
  const { item } = findItem(course, slug)!
  const query = useQuery({
    ...trpc.design.submission.queryOptions({
      course: course.slug,
      challenge: slug,
    }),
    enabled: !!session,
    // Poll while the evaluation runs in the background.
    refetchInterval: (q) =>
      q.state.data?.status === 'evaluating' ? 2000 : false,
  })
  const s = query.data

  const back = (
    <Link
      to="/courses/$course/challenge/$slug"
      params={{ course: course.slug, slug }}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> {item.title}
    </Link>
  )

  if (isPending || (session && query.isPending))
    return (
      <div className="max-w-4xl">
        {back}
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    )

  if (!session || !s)
    return (
      <div className="max-w-4xl">
        {back}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          No result yet
        </h1>
        <p className="mt-2 text-muted-foreground">
          {session
            ? 'You haven’t submitted this challenge yet.'
            : 'Sign in to see your result.'}
        </p>
        <Button asChild className="mt-5">
          <Link
            to="/courses/$course/challenge/$slug"
            params={{ course: course.slug, slug }}
          >
            Go to the challenge
          </Link>
        </Button>
      </div>
    )

  if (s.status === 'evaluating')
    return (
      <div className="max-w-4xl">
        {back}
        <div
          className="mt-6 flex flex-col items-center rounded-lg border bg-card px-6 py-16 text-center"
          aria-live="polite"
        >
          <Loader2 className="size-8 animate-spin text-brand" />
          <h1 className="mt-4 text-xl font-semibold">Grading your design</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            The grader is scoring each criterion against the rubric. This
            usually takes under a minute; you can leave and come back.
          </p>
        </div>
      </div>
    )

  if (s.status === 'failed' || !s.result)
    return (
      <div className="max-w-4xl">
        {back}
        <div className="mt-6 flex flex-col items-center rounded-lg border bg-card px-6 py-14 text-center">
          <AlertTriangle className="size-8 text-medium" />
          <h1 className="mt-4 text-xl font-semibold">Grading didn’t finish</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Something went wrong while grading, so this attempt wasn’t used.
            Your answers are saved; submit again when you’re ready.
          </p>
          <Button asChild className="mt-5">
            <Link
              to="/courses/$course/challenge/$slug"
              params={{ course: course.slug, slug }}
            >
              Back to your answers
            </Link>
          </Button>
        </div>
      </div>
    )

  const r = s.result
  const weak = r.evaluations.filter(
    (e) =>
      e.score < weakCriterionScore ||
      (e.minScore !== undefined && e.score < e.minScore),
  )
  const lessons = [
    ...new Set(weak.flatMap((e) => challenge.remediation[e.criterion] ?? [])),
  ]
    .map((l) => findItem(course, l)?.item)
    .filter((i) => i !== undefined)

  return (
    <article className="max-w-4xl pb-6">
      {back}
      <header
        className={cn(
          'mt-4 flex flex-wrap items-center justify-between gap-6 rounded-lg border p-5',
          r.passed ? 'bg-accepted/[0.07]' : 'bg-medium/[0.07]',
        )}
      >
        <div className="min-w-0">
          <p
            className={cn(
              'flex items-center gap-2 text-sm font-semibold',
              r.passed ? 'text-accepted' : 'text-medium',
            )}
          >
            {r.passed ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <XCircle className="size-4" />
            )}
            {r.passed ? 'Passed' : 'Not passed'}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {item.title}
          </h1>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed">
            {r.summary}
          </p>
          {r.failedMinimums.length > 0 && (
            <p className="mt-2 text-sm text-hard">
              Below the minimum on:{' '}
              {r.evaluations
                .filter((e) => r.failedMinimums.includes(e.criterion))
                .map((e) => e.title)
                .join(', ')}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-5xl font-semibold tracking-tight tabular-nums">
            {r.score}
            <span className="text-xl text-muted-foreground">/100</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pass mark {r.passMark}
          </p>
        </div>
      </header>

      {r.criticalIssues.length > 0 && (
        <section className="mt-6 rounded-lg border border-hard/40 bg-hard/[0.05] p-4">
          <h2 className="flex items-center gap-2 font-semibold text-hard">
            <AlertTriangle className="size-4" /> Critical issues
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed">
            {r.criticalIssues.map((i) => (
              <li key={i} className="my-1">
                {i}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="criteria-h" className="mt-8">
        <h2 id="criteria-h" className="text-lg font-semibold tracking-tight">
          Criterion by criterion
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {r.evaluations.map((e) => (
            <li key={e.criterion} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{e.title}</h3>
                <p className="text-sm tabular-nums">
                  <span className="font-semibold">{e.score}</span>
                  <span className="text-muted-foreground">
                    /100 · weight {e.weight}
                    {e.minScore !== undefined && ` · needs ${e.minScore}`}
                  </span>
                </p>
              </div>
              <ScoreBar score={e.score} min={e.minScore} />
              <p className="mt-3 text-[15px] leading-relaxed">{e.feedback}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <Bullets title="Strengths" items={e.strengths} tone="good" />
                <Bullets title="Weaknesses" items={e.weaknesses} tone="bad" />
                <Bullets
                  title="To improve"
                  items={e.suggestions}
                  tone="plain"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {r.recommendations.length > 0 && (
          <section className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">Recommendations</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed marker:text-muted-foreground">
              {r.recommendations.map((i) => (
                <li key={i} className="my-1">
                  {i}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Lessons to revisit</h2>
          {lessons.length ? (
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {lessons.map((l) => (
                <li key={l.slug}>
                  <Link
                    to="/courses/$course/$lesson"
                    params={{ course: course.slug, lesson: l.slug }}
                    className="inline-flex items-center gap-2 hover:text-brand"
                  >
                    <BookOpen className="size-3.5 text-muted-foreground" />
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Every criterion scored {weakCriterionScore} or more.
            </p>
          )}
        </section>
      </div>

      <details className="mt-8 rounded-lg border bg-card">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Your submitted answers
        </summary>
        <div className="divide-y border-t">
          {designFields.map((f) => (
            <div key={f.id} className="px-4 py-3">
              <h3 className="text-sm font-medium">{f.label}</h3>
              {/* Learner text: shown as plain text, never as HTML. */}
              <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                {(s.answers as Record<string, string>)[f.id] ?? ''}
              </p>
            </div>
          ))}
        </div>
      </details>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Graded {s.evaluatedAt ? when.format(new Date(s.evaluatedAt)) : ''}{' '}
        against rubric v{s.rubricVersion} for challenge v{s.version}. Scores are
        computed from the criterion scores by HookDrill, not taken from the
        model. AI feedback can be wrong; weigh it against the lessons.
      </p>
    </article>
  )
}

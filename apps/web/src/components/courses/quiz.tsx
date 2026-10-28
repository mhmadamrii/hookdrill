import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  CircleAlert,
  LogIn,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import {
  drawPaper,
  passCount,
  rules,
  type Answers,
  type Assessment,
  type Course,
  type Question,
} from '@hookdrill/courses'
import { Button } from '@/components/ui/button'
import { useSubmitAssessment, type CourseProgress } from '@/lib/courses'
import { cn } from '@/lib/utils'
import { mdInline } from './blocks'

type Phase =
  | { name: 'intro' }
  | { name: 'taking'; paper: Question[]; answers: Answers }
  | {
      name: 'review'
      paper: Question[]
      answers: Answers
      correct: number
      passed: boolean
    }

const pct = (n: number) => `${Math.round(n * 100)}%`

/**
 * A lesson quiz or submodule exam: start, answer every question, submit for
 * server grading, then review every option's explanation and retry with a
 * freshly drawn paper.
 */
export function AssessmentCard({
  course,
  assessment,
  progress,
  locked,
  next,
}: {
  course: Course
  assessment: Assessment
  progress: CourseProgress
  /** Why it can't be taken yet, if it can't. */
  locked?: ReactNode
  /** Where to go after passing. */
  next?: ReactNode
}) {
  const [phase, setPhase] = useState<Phase>({ name: 'intro' })
  const submit = useSubmitAssessment(course)
  const top = useRef<HTMLDivElement>(null)
  const result = progress.results.get(assessment.id)
  const isExam = assessment.kind === 'exam'
  const noun = isExam ? 'exam' : 'quiz'

  const start = () => {
    submit.reset()
    setPhase({
      name: 'taking',
      paper: drawPaper(assessment.bank, assessment.size),
      answers: {},
    })
  }

  const send = (paper: Question[], answers: Answers) =>
    submit.mutate(
      { course: course.slug, assessment: assessment.id, answers },
      {
        onSuccess: (r) => {
          setPhase({
            name: 'review',
            paper,
            answers,
            correct: r.correct,
            passed: r.passed,
          })
          top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        },
      },
    )

  return (
    <div
      ref={top}
      className="scroll-mt-20 rounded-xl border bg-card"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {isExam ? 'Submodule exam' : 'Lesson quiz'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {assessment.size} questions · {passCount(assessment.size)} correct
            to pass ({pct(rules.passMark)}) · new questions each attempt
          </p>
        </div>
        {result && (
          <p
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium',
              result.passed ? 'text-accepted' : 'text-muted-foreground',
            )}
          >
            {result.passed && <CheckCircle2 className="size-4" />}
            {result.passed ? 'Passed' : 'Not passed yet'} · best{' '}
            {result.bestCorrect}/{result.total} · {result.attempts}{' '}
            {result.attempts === 1 ? 'attempt' : 'attempts'}
          </p>
        )}
      </div>

      {locked ? (
        <div className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div>{locked}</div>
        </div>
      ) : !progress.signedIn ? (
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted-foreground">
            Sign in to take the {noun}. Your results unlock the next part of the
            course.
          </p>
          <Button asChild>
            <Link to="/signin">
              <LogIn /> Sign in to start
            </Link>
          </Button>
        </div>
      ) : phase.name === 'intro' ? (
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-prose text-sm text-muted-foreground">
            {isExam
              ? 'Cumulative questions across every lesson in this submodule. Passing unlocks the next submodule.'
              : 'Check what you learned. After you submit, every option is explained, right or wrong.'}
          </p>
          <Button onClick={start} disabled={progress.isLoading}>
            {result ? (
              <>
                <RotateCcw /> {result.passed ? `Retake ${noun}` : 'Try again'}
              </>
            ) : (
              `Start ${noun}`
            )}
          </Button>
        </div>
      ) : phase.name === 'taking' ? (
        <Paper
          paper={phase.paper}
          answers={phase.answers}
          onAnswer={(id, option) =>
            setPhase({
              ...phase,
              answers: { ...phase.answers, [id]: option },
            })
          }
          onSubmit={() => send(phase.paper, phase.answers)}
          onCancel={() => setPhase({ name: 'intro' })}
          pending={submit.isPending}
          error={submit.error?.message}
        />
      ) : (
        <Review
          phase={phase}
          noun={noun}
          onRetry={start}
          next={phase.passed ? next : undefined}
        />
      )}
    </div>
  )
}

function Paper({
  paper,
  answers,
  onAnswer,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  paper: Question[]
  answers: Answers
  onAnswer: (question: string, option: string) => void
  onSubmit: () => void
  onCancel: () => void
  pending: boolean
  error?: string
}) {
  const answered = paper.filter((q) => answers[q.id]).length
  return (
    <form
      className="divide-y"
      onSubmit={(e) => {
        e.preventDefault()
        if (answered === paper.length) onSubmit()
      }}
    >
      {paper.map((q, i) => (
        <fieldset key={q.id} className="p-5">
          <legend className="contents">
            <span className="block text-xs font-medium text-muted-foreground">
              Question {i + 1} of {paper.length}
            </span>
            <span
              className="mt-1.5 block font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: mdInline(q.prompt) }}
            />
          </legend>
          <div className="mt-3 grid gap-2">
            {q.options.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 text-[15px] transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/[0.06] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50"
              >
                <input
                  type="radio"
                  name={q.id}
                  value={o.id}
                  checked={answers[q.id] === o.id}
                  onChange={() => onAnswer(q.id, o.id)}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span dangerouslySetInnerHTML={{ __html: mdInline(o.text) }} />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-b-xl bg-card/95 p-4 backdrop-blur">
        <p className="text-sm text-muted-foreground tabular-nums">
          {answered} of {paper.length} answered
          {error && (
            <span role="alert" className="ml-3 text-destructive">
              {error}
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={answered < paper.length || pending}>
            {pending ? 'Grading…' : 'Submit answers'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Review({
  phase,
  noun,
  onRetry,
  next,
}: {
  phase: Extract<Phase, { name: 'review' }>
  noun: string
  onRetry: () => void
  next?: ReactNode
}) {
  const { paper, answers, correct, passed } = phase
  return (
    <div>
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-4 p-5',
          passed ? 'bg-accepted/10' : 'bg-medium/10',
        )}
      >
        <div>
          <p
            className={cn(
              'text-lg font-semibold',
              passed ? 'text-accepted' : 'text-medium',
            )}
          >
            {passed ? 'Passed' : 'Not passed yet'} · {correct}/{paper.length}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {passed
              ? 'Review the explanations below, then move on.'
              : `You need ${passCount(paper.length)}. Read why each answer is right or wrong, then try a new set of questions.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={passed ? 'outline' : 'default'} onClick={onRetry}>
            <RotateCcw /> {passed ? `Retake ${noun}` : 'Try again'}
          </Button>
          {next}
        </div>
      </div>
      <ol className="divide-y border-t">
        {paper.map((q, i) => {
          const chosen = answers[q.id]
          const right = chosen === q.answer
          return (
            <li key={q.id} className="p-5">
              <p className="flex items-start gap-2 font-medium leading-relaxed">
                {right ? (
                  <CheckCircle2
                    aria-label="Correct"
                    className="mt-1 size-4 shrink-0 text-accepted"
                  />
                ) : (
                  <XCircle
                    aria-label="Incorrect"
                    className="mt-1 size-4 shrink-0 text-hard"
                  />
                )}
                <span>
                  <span className="sr-only">Question {i + 1}: </span>
                  <span
                    dangerouslySetInnerHTML={{ __html: mdInline(q.prompt) }}
                  />
                </span>
              </p>
              <ul className="mt-3 grid gap-2">
                {q.options.map((o) => {
                  const isAnswer = o.id === q.answer
                  const isChosen = o.id === chosen
                  return (
                    <li
                      key={o.id}
                      className={cn(
                        'rounded-lg border px-3.5 py-3 text-[15px]',
                        isAnswer && 'border-accepted/60 bg-accepted/[0.06]',
                        isChosen &&
                          !isAnswer &&
                          'border-hard/60 bg-hard/[0.06]',
                      )}
                    >
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span
                          dangerouslySetInnerHTML={{ __html: mdInline(o.text) }}
                        />
                        {(isAnswer || isChosen) && (
                          <span
                            className={cn(
                              'text-xs font-medium',
                              isAnswer ? 'text-accepted' : 'text-hard',
                            )}
                          >
                            {isAnswer && isChosen
                              ? 'Your answer · correct'
                              : isAnswer
                                ? 'Correct answer'
                                : 'Your answer'}
                          </span>
                        )}
                      </p>
                      <p
                        className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: mdInline(o.explanation),
                        }}
                      />
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

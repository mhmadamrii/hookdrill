import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  GraduationCap,
  Play,
} from 'lucide-react'
import { courseBySlug, passCount, rules, type Course } from '@hookdrill/courses'
import { CourseProgressBar, ItemIcon } from '@/components/courses/syllabus'
import { Button } from '@/components/ui/button'
import { useCourseProgress, type CourseProgress } from '@/lib/courses'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(main)/(library)/courses/$course/')({
  loader: ({ params }) => {
    const course = courseBySlug(params.course)
    if (!course) throw notFound()
    return { slug: course.slug }
  },
  head: ({ loaderData }) => {
    const course = loaderData && courseBySlug(loaderData.slug)
    return {
      meta: course
        ? [
            { title: `${course.title} · Courses · HookDrill` },
            { name: 'description', content: course.description },
          ]
        : [],
    }
  },
  component: CoursePage,
})

function CoursePage() {
  const { slug } = Route.useLoaderData()
  const course = courseBySlug(slug)!
  return (
    <div className="py-2 md:py-4">
      <Link
        to="/courses"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Courses
      </Link>
      {course.status === 'coming-soon' ? (
        <ComingSoon course={course} />
      ) : (
        <AvailableCourse course={course} />
      )}
    </div>
  )
}

function ComingSoon({ course }: { course: Course }) {
  return (
    <>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        {course.title}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{course.tagline}</p>
      <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-secondary">
          <BookOpen className="size-5 text-muted-foreground" />
        </span>
        <h2 className="mt-4 font-semibold">Syllabus in progress</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The lessons aren’t published yet. Until then, the problem library has
          React components to build by hand.
        </p>
        <Button asChild variant="secondary" className="mt-5">
          <Link to="/problems" search={{ track: 'react' }}>
            Practice React problems
          </Link>
        </Button>
      </div>
    </>
  )
}

function ContinueButton({
  course,
  progress,
}: {
  course: Course
  progress: CourseProgress
}) {
  const first = progress.states[0]?.submodules[0]?.lessons[0]?.lesson
  if (!first) return null
  const next = progress.next
  if (!next || !progress.signedIn || progress.done === 0)
    return (
      <Button asChild size="lg">
        <Link
          to="/courses/$course/$lesson"
          params={{ course: course.slug, lesson: first.slug }}
        >
          <Play /> {next ? 'Start the course' : 'Review the course'}
        </Link>
      </Button>
    )
  return next.kind === 'lesson' ? (
    <Button asChild size="lg">
      <Link
        to="/courses/$course/$lesson"
        params={{ course: course.slug, lesson: next.lesson.slug }}
      >
        <Play /> Continue: {next.lesson.title}
      </Link>
    </Button>
  ) : (
    <Button asChild size="lg">
      <Link
        to="/courses/$course/exam/$submodule"
        params={{ course: course.slug, submodule: next.submodule.slug }}
      >
        <GraduationCap /> Take the {next.submodule.title} exam
      </Link>
    </Button>
  )
}

function AvailableCourse({ course }: { course: Course }) {
  const progress = useCourseProgress(course)
  const modules = course.phases.flatMap((p) => p.modules)
  return (
    <>
      <header className="mt-2 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {course.title}
        </h1>
        <p className="mt-2 text-lg">{course.tagline}</p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {course.description}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {course.phases.length} phases · {modules.length} modules ·{' '}
          {modules.filter((m) => m.module).length} open now · {course.level}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ContinueButton course={course} progress={progress} />
          {!progress.signedIn && !progress.isLoading && (
            <p className="text-sm text-muted-foreground">
              Read freely; sign in to take quizzes and unlock what’s next.
            </p>
          )}
        </div>
      </header>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="path-h" className="min-w-0">
          <h2 id="path-h" className="sr-only">
            Learning path
          </h2>
          <ol className="flex flex-col gap-10">
            {course.phases.map((phase) => (
              <li key={phase.number}>
                <p className="text-xs font-medium text-muted-foreground">
                  Phase {phase.number}
                </p>
                <h3 className="text-lg font-semibold tracking-tight">
                  {phase.title}
                </h3>
                <p className="text-sm text-muted-foreground">{phase.summary}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {phase.modules.map((planned) => {
                    const state = progress.states.find(
                      (s) => s.module.number === planned.number,
                    )
                    return state ? (
                      <ModuleCard
                        key={planned.number}
                        course={course}
                        state={state}
                      />
                    ) : (
                      <li
                        key={planned.number}
                        className="rounded-xl border border-dashed px-5 py-4"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-medium">
                            <span className="mr-2 text-muted-foreground tabular-nums">
                              {String(planned.number).padStart(2, '0')}
                            </span>
                            {planned.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            In development
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {planned.topics.join(' · ')}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          {progress.signedIn && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">Your progress</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quizzes and exams passed
              </p>
              <CourseProgressBar
                className="mt-3"
                done={progress.done}
                total={progress.total}
              />
            </div>
          )}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold">What you’ll learn</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {course.outcomes.map((o) => (
                <li key={o} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accepted" />
                  {o}
                </li>
              ))}
            </ul>
            <h2 className="mt-5 font-semibold">Before you start</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground marker:text-muted-foreground">
              {course.prerequisites.map((p) => (
                <li key={p} className="my-1">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-5 text-sm">
            <h2 className="font-semibold">How you progress</h2>
            <ul className="mt-3 flex flex-col gap-2 text-muted-foreground">
              <li>
                Each lesson ends with a {rules.lessonQuizSize}-question quiz.
                Pass with {passCount(rules.lessonQuizSize)} correct.
              </li>
              <li>
                Pass every quiz in a submodule to open its {rules.examSize}
                -question exam. Pass with {Math.round(rules.passMark * 100)}%.
              </li>
              <li>Passing the exam unlocks the next submodule.</li>
              <li>
                Questions are drawn fresh each attempt, and every option is
                explained afterwards.
              </li>
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-5 text-sm">
            <h2 className="font-semibold">Built on</h2>
            <ul className="mt-2 flex flex-col gap-1.5">
              {course.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {s.publisher}: {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Lessons are written in our own words and checked against these and
              other primary sources.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}

function ModuleCard({
  course,
  state,
}: {
  course: Course
  state: CourseProgress['states'][number]
}) {
  const { module } = state
  return (
    <li className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b px-5 py-4">
        <div>
          <p className="font-semibold">
            <span className="mr-2 text-muted-foreground tabular-nums">
              {String(module.number).padStart(2, '0')}
            </span>
            {module.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{module.summary}</p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {state.passed}/{state.total} passed
        </span>
      </div>
      {state.submodules.map((s) => (
        <div
          key={s.submodule.slug}
          className="border-b px-2 py-3 last:border-b-0"
        >
          <p className="px-3 pb-1.5 text-sm font-medium">
            {s.submodule.title}
            {!s.unlocked && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Pass the previous exam to unlock
              </span>
            )}
          </p>
          <ul>
            {s.lessons.map(({ lesson, status }) => (
              <li key={lesson.slug}>
                <Link
                  to="/courses/$course/$lesson"
                  params={{ course: course.slug, lesson: lesson.slug }}
                  className={cn(
                    'group flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    status === 'locked' && 'text-muted-foreground',
                  )}
                >
                  <ItemIcon status={status} />
                  <span className="flex-1">{lesson.title}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                    <Clock className="size-3" />
                    {lesson.minutes} min
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/courses/$course/exam/$submodule"
                params={{ course: course.slug, submodule: s.submodule.slug }}
                className={cn(
                  'flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  s.exam === 'locked' && 'text-muted-foreground',
                )}
              >
                {s.exam === 'passed' ? (
                  <ItemIcon status="passed" />
                ) : (
                  <GraduationCap
                    className={cn(
                      'size-4 shrink-0',
                      s.exam === 'open'
                        ? 'text-brand'
                        : 'text-muted-foreground/70',
                    )}
                  />
                )}
                <span className="flex-1 font-medium">Submodule exam</span>
                <span className="text-xs text-muted-foreground">
                  {s.exam === 'locked'
                    ? 'Opens after every quiz'
                    : s.exam === 'passed'
                      ? 'Passed'
                      : 'Ready'}
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          </ul>
        </div>
      ))}
    </li>
  )
}

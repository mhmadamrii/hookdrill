import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowRight, Clock, X } from 'lucide-react'
import {
  assessments,
  courseBySlug,
  findLesson,
  lessonQuizId,
  type ContentLabel,
  type Course,
  type Lesson,
} from '@hookdrill/courses'
import { Blocks, mdInline } from '@/components/courses/blocks'
import { AssessmentCard } from '@/components/courses/quiz'
import { StepLink } from '@/components/courses/step-link'
import { LockedNotice, StepNav } from '@/components/courses/step-nav'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { courseSteps, useCourseProgress } from '@/lib/courses'

export const Route = createFileRoute(
  '/(main)/(course)/courses/$course/$lesson',
)({
  loader: ({ params }) => {
    const course = courseBySlug(params.course)
    const found =
      course?.status === 'available' && findLesson(course, params.lesson)
    if (!course || !found) throw notFound()
    return { title: found.lesson.title, course: course.title }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.title} · ${loaderData.course} · HookDrill` }]
      : [],
  }),
  component: LessonPage,
})

const labels: Record<ContentLabel, { name: string; hint: string }> = {
  foundational: {
    name: 'Foundational',
    hint: 'Established knowledge that changes slowly.',
  },
  'current-practice': {
    name: 'Current practice',
    hint: 'How the field works today. Reviewed often, since tools change fast.',
  },
  emerging: {
    name: 'Emerging research',
    hint: 'Active research. Expect this to change.',
  },
}

const reviewed = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

function LessonPage() {
  const params = Route.useParams()
  const course = courseBySlug(params.course)!
  const { module, submodule, lesson } = findLesson(course, params.lesson)!
  const progress = useCourseProgress(course)
  const sub = progress.states
    .flatMap((m) => m.submodules)
    .find((s) => s.submodule.slug === submodule.slug)!
  const status = sub.lessons.find((l) => l.lesson.slug === lesson.slug)!.status
  const assessment = assessments(course).get(lessonQuizId(lesson))!
  const label = labels[lesson.label]

  return (
    <article className="max-w-3xl pb-6">
      <p className="text-sm text-muted-foreground">
        <Link
          to="/courses/$course"
          params={{ course: course.slug }}
          className="hover:text-foreground"
        >
          Module {String(module.number).padStart(2, '0')} · {module.title}
        </Link>
        <span className="mx-1.5">/</span>
        {submodule.title}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {lesson.title}
      </h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" /> {lesson.minutes} min read
        </span>
        <span aria-hidden>·</span>
        <span
          title={label.hint}
          className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium"
        >
          {label.name}
        </span>
        <span aria-hidden>·</span>
        <span>Reviewed {reviewed.format(new Date(lesson.reviewedAt))}</span>
      </p>

      {progress.isLoading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : status === 'locked' ? (
        <div className="mt-8">
          <Locked course={course} beforeSlug={submodule.slug} />
        </div>
      ) : (
        <>
          <section
            aria-labelledby="objectives-h"
            className="mt-8 rounded-xl border bg-card p-5"
          >
            <h2 id="objectives-h" className="font-semibold">
              By the end, you can
            </h2>
            <ul className="mt-2 list-disc pl-5 marker:text-muted-foreground">
              {lesson.objectives.map((o) => (
                <li key={o.id} className="my-1.5 leading-relaxed">
                  {o.text}
                </li>
              ))}
            </ul>
          </section>

          {lesson.concept.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight">
                {s.heading}
              </h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          <section className="mt-10">
            <p className="text-xs font-medium text-brand">In practice</p>
            <h2 className="mt-1 mb-3 text-2xl font-semibold tracking-tight">
              {lesson.application.heading}
            </h2>
            <Blocks blocks={lesson.application.blocks} />
          </section>

          <section aria-labelledby="myths-h" className="mt-10">
            <h2
              id="myths-h"
              className="mb-4 text-2xl font-semibold tracking-tight"
            >
              Common misconceptions
            </h2>
            <ul className="flex flex-col gap-3">
              {lesson.misconceptions.map((m) => (
                <li key={m.claim} className="rounded-xl border p-4">
                  <p className="flex items-start gap-2 font-medium">
                    <X
                      aria-label="Misconception"
                      className="mt-1 size-4 shrink-0 text-hard"
                    />
                    <span
                      dangerouslySetInnerHTML={{ __html: mdInline(m.claim) }}
                    />
                  </p>
                  <p
                    className="mt-2 pl-6 text-[15px] leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: mdInline(m.correction) }}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Lesson quiz" className="mt-10">
            <AssessmentCard
              key={lesson.slug}
              course={course}
              assessment={assessment}
              progress={progress}
              next={<NextAfterPass course={course} slug={lesson.slug} />}
            />
          </section>

          <section aria-labelledby="refs-h" className="mt-10">
            <h2 id="refs-h" className="text-lg font-semibold">
              References
            </h2>
            <References lesson={lesson} />
          </section>
        </>
      )}

      <StepNav course={course} kind="lesson" slug={lesson.slug} />
    </article>
  )
}

function References({ lesson }: { lesson: Lesson }) {
  const groups = [
    {
      name: 'Sources',
      items: lesson.references.filter((r) => r.kind === 'source'),
    },
    {
      name: 'Further reading',
      items: lesson.references.filter((r) => r.kind === 'further'),
    },
  ].filter((g) => g.items.length > 0)
  return (
    <>
      {groups.map((g) => (
        <div key={g.name} className="mt-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {g.name}
          </h3>
          <ul className="mt-1.5 flex flex-col gap-1.5 text-sm">
            {g.items.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {r.title}
                </a>
                <span className="text-muted-foreground"> · {r.publisher}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Sources back the facts in this lesson. Sections marked “Teaching
        example” are our own illustrations.
      </p>
    </>
  )
}

/** After passing, point at the next lesson or the exam. */
function NextAfterPass({ course, slug }: { course: Course; slug: string }) {
  const steps = courseSteps(course)
  const next = steps[steps.findIndex((s) => s.slug === slug) + 1]
  if (!next) return null
  return (
    <Button asChild>
      <StepLink course={course.slug} step={next}>
        {next.kind === 'exam' ? 'Go to the exam' : 'Next lesson'} <ArrowRight />
      </StepLink>
    </Button>
  )
}

/** Shown in place of a lesson whose submodule isn't unlocked yet. */
function Locked({
  course,
  beforeSlug,
}: {
  course: Course
  beforeSlug: string
}) {
  const subs = course.phases
    .flatMap((p) => p.modules)
    .flatMap((m) => m.module?.submodules ?? [])
  const prev = subs[subs.findIndex((s) => s.slug === beforeSlug) - 1]
  return (
    <LockedNotice title="This lesson isn’t unlocked yet">
      {prev ? (
        <>
          <p>Pass the {prev.title} exam to open this submodule.</p>
          <Button asChild variant="secondary" className="mt-5">
            <Link
              to="/courses/$course/exam/$submodule"
              params={{ course: course.slug, submodule: prev.slug }}
            >
              Go to the {prev.title} exam
            </Link>
          </Button>
        </>
      ) : (
        <p>Pass the previous exam to open it.</p>
      )}
    </LockedNotice>
  )
}

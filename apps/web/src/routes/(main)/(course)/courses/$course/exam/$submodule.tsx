import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import {
  assessments,
  courseBySlug,
  examId,
  findSubmodule,
  loadLevelExam,
  passCount,
  type ModuleCourse,
} from '@hookdrill/courses'
import { ItemIcon } from '@/components/courses/syllabus'
import { AssessmentCard } from '@/components/courses/quiz'
import { StepLink } from '@/components/courses/step-link'
import { LockedNotice, StepNav } from '@/components/courses/step-nav'
import { LevelExamView } from '@/components/system-design/exam-view'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { courseSteps, useCourseProgress } from '@/lib/courses'

export const Route = createFileRoute(
  '/(main)/(course)/courses/$course/exam/$submodule',
)({
  loader: async ({ params }) => {
    const course = courseBySlug(params.course)
    if (!course || course.status !== 'available') throw notFound()
    if (course.format === 'levels') {
      // For level courses the segment is a level slug.
      const assessment = await loadLevelExam(course, params.submodule)
      if (!assessment) throw notFound()
      const level = course.levels.find((l) => l.slug === params.submodule)!
      return { title: level.title, course: course.title, assessment }
    }
    const found = findSubmodule(course, params.submodule)
    if (!found) throw notFound()
    return {
      title: found.submodule.title,
      course: course.title,
      assessment: null,
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.title} exam · ${loaderData.course} · HookDrill`,
          },
        ]
      : [],
  }),
  component: ExamRoute,
})

function ExamRoute() {
  const { assessment } = Route.useLoaderData()
  const params = Route.useParams()
  const course = courseBySlug(params.course)!
  return course.format === 'levels' && assessment ? (
    <LevelExamView
      course={course}
      levelSlug={params.submodule}
      assessment={assessment}
    />
  ) : (
    <ExamPage />
  )
}

function ExamPage() {
  const params = Route.useParams()
  const course = courseBySlug(params.course) as ModuleCourse
  const { module, submodule } = findSubmodule(course, params.submodule)!
  const progress = useCourseProgress(course)
  const state = progress.states
    .flatMap((m) => m.submodules)
    .find((s) => s.submodule.slug === submodule.slug)!
  const assessment = assessments(course).get(examId(submodule))!
  const remaining = state.lessons.filter((l) => l.status !== 'passed')

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
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {submodule.title}: exam
      </h1>
      <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
        {assessment.size} questions drawn from every lesson in this submodule,
        plus questions that combine them. You need{' '}
        {passCount(assessment.size, assessment.passMark)} correct to pass and
        unlock the next submodule.
      </p>

      <div className="mt-8">
        {progress.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !state.unlocked ? (
          <LockedNotice title="This submodule isn’t unlocked yet">
            Pass the previous submodule’s exam first.
          </LockedNotice>
        ) : (
          <AssessmentCard
            course={course}
            assessment={assessment}
            progress={progress}
            locked={
              state.exam === 'locked' && progress.signedIn ? (
                <>
                  <p>Pass every lesson quiz in this submodule first:</p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {remaining.map(({ lesson, status }) => (
                      <li key={lesson.slug}>
                        <Link
                          to="/courses/$course/$lesson"
                          params={{ course: course.slug, lesson: lesson.slug }}
                          className="inline-flex items-center gap-2 text-foreground hover:text-brand"
                        >
                          <ItemIcon status={status} />
                          {lesson.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : undefined
            }
            next={<NextAfterExam course={course} slug={submodule.slug} />}
          />
        )}
      </div>

      <StepNav course={course} kind="exam" slug={submodule.slug} />
    </article>
  )
}

function NextAfterExam({
  course,
  slug,
}: {
  course: ModuleCourse
  slug: string
}) {
  const steps = courseSteps(course)
  const next =
    steps[steps.findIndex((s) => s.kind === 'exam' && s.slug === slug) + 1]
  return (
    <Button asChild>
      {next ? (
        <StepLink course={course.slug} step={next}>
          Start the next submodule <ArrowRight />
        </StepLink>
      ) : (
        <Link to="/courses/$course" params={{ course: course.slug }}>
          Back to the course <ArrowRight />
        </Link>
      )}
    </Button>
  )
}

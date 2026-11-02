import { Link } from '@tanstack/react-router'
import type { Assessment, LevelCourse } from '@hookdrill/courses'
import { AssessmentCard } from '@/components/courses/quiz'
import { LockedNotice } from '@/components/courses/step-nav'
import { ItemIcon } from '@/components/courses/syllabus'
import { Skeleton } from '@/components/ui/skeleton'
import { useLevelProgress } from '@/lib/courses'

/** A level's final exam: cumulative questions across its lessons. */
export function LevelExamView({
  course,
  levelSlug,
  assessment,
}: {
  course: LevelCourse
  levelSlug: string
  assessment: Assessment
}) {
  const progress = useLevelProgress(course)
  const state = progress.levels.find((l) => l.level.slug === levelSlug)!
  const remaining = state.items.filter(
    (i) => i.item.kind === 'lesson' && i.status !== 'passed',
  )
  const pct = Math.round(assessment.passMark * 100)
  return (
    <article className="max-w-3xl pb-6">
      <p className="text-sm text-muted-foreground">
        <Link
          to="/courses/$course/curriculum"
          params={{ course: course.slug }}
          hash={levelSlug}
          className="hover:text-foreground"
        >
          Level {state.level.number} · {state.level.title}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {state.level.title}: level exam
      </h1>
      <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
        {assessment.size} questions drawn from every lesson in this level, plus
        questions that combine them. Pass with {pct}%.
      </p>
      <div className="mt-8">
        {progress.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <AssessmentCard
            course={course}
            assessment={assessment}
            progress={progress}
            locked={
              state.exam === 'locked' && progress.signedIn ? (
                <>
                  <p>Pass every lesson in this level first:</p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {remaining.map(({ item, status }) => (
                      <li key={item.slug}>
                        <Link
                          to="/courses/$course/$lesson"
                          params={{ course: course.slug, lesson: item.slug }}
                          className="inline-flex items-center gap-2 text-foreground hover:text-brand"
                        >
                          <ItemIcon status={status} />
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : undefined
            }
          />
        )}
      </div>
      {state.exam === 'planned' && (
        <div className="mt-6">
          <LockedNotice title="Not published yet">
            The exam opens once every lesson in this level is published.
          </LockedNotice>
        </div>
      )}
    </article>
  )
}

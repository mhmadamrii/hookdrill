import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Clock, ListChecks, X } from 'lucide-react'
import {
  findItem,
  lessonAssessment,
  type LevelCourse,
  type LevelItem,
  type Lesson,
} from '@hookdrill/courses'
import { Blocks, mdInline } from '@/components/courses/blocks'
import { labels, References, reviewed } from '@/components/courses/lesson-parts'
import { AssessmentCard } from '@/components/courses/quiz'
import { LockedNotice } from '@/components/courses/step-nav'
import { ItemIcon } from '@/components/courses/syllabus'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLevelProgress } from '@/lib/courses'
import { ScenarioPractice } from './scenario'

/** Links to a curriculum item: its lesson or challenge page. */
export function ItemLink({
  course,
  item,
  className,
  children,
}: {
  course: string
  item: LevelItem
  className?: string
  children: React.ReactNode
}) {
  return item.kind === 'lesson' ? (
    <Link
      to="/courses/$course/$lesson"
      params={{ course, lesson: item.slug }}
      className={className}
    >
      {children}
    </Link>
  ) : (
    <Link
      to="/courses/$course/challenge/$slug"
      params={{ course, slug: item.slug }}
      className={className}
    >
      {children}
    </Link>
  )
}

const navCard =
  'flex flex-col gap-1 rounded-lg border px-4 py-3 outline-none transition-colors hover:border-ring/40 hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50'

/** Previous and next item in curriculum order. */
export function ItemNav({
  course,
  slug,
}: {
  course: LevelCourse
  slug: string
}) {
  const items = course.levels.flatMap((l) => l.items)
  const i = items.findIndex((x) => x.slug === slug)
  const prev = items[i - 1]
  const next = items[i + 1]
  return (
    <nav
      aria-label="Previous and next"
      className="mt-10 grid gap-3 border-t pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <ItemLink course={course.slug} item={prev} className={navCard}>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="size-3" /> Previous
          </span>
          <span className="font-medium">{prev.title}</span>
        </ItemLink>
      ) : (
        <span />
      )}
      {next && (
        <ItemLink
          course={course.slug}
          item={next}
          className={`${navCard} sm:items-end sm:text-right`}
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Next <ArrowRight className="size-3" />
          </span>
          <span className="font-medium">{next.title}</span>
        </ItemLink>
      )}
    </nav>
  )
}

/** Shown in place of an item whose prerequisites aren't passed yet. */
export function MissingPrerequisites({
  course,
  missing,
  what,
}: {
  course: LevelCourse
  missing: LevelItem[]
  what: string
}) {
  return (
    <LockedNotice title={`This ${what} isn’t unlocked yet`}>
      <p>Pass these first:</p>
      <ul className="mt-3 flex flex-col items-center gap-1.5">
        {missing.map((m) => (
          <li key={m.slug}>
            <ItemLink
              course={course.slug}
              item={m}
              className="inline-flex items-center gap-2 text-foreground hover:text-brand"
            >
              <ItemIcon status="open" />
              {m.title}
            </ItemLink>
          </li>
        ))}
      </ul>
    </LockedNotice>
  )
}

export function LevelLessonView({
  course,
  lesson,
}: {
  course: LevelCourse
  lesson: Lesson
}) {
  const progress = useLevelProgress(course)
  const { level } = findItem(course, lesson.slug)!
  const state = progress.levels
    .flatMap((l) => l.items)
    .find((i) => i.item.slug === lesson.slug)!
  const label = labels[lesson.label]
  const items = course.levels.flatMap((l) => l.items)
  const next = items[items.findIndex((i) => i.slug === lesson.slug) + 1]

  return (
    <article className="max-w-3xl pb-6">
      <p className="text-sm text-muted-foreground">
        <Link
          to="/courses/$course/curriculum"
          params={{ course: course.slug }}
          hash={level.slug}
          className="hover:text-foreground"
        >
          Level {level.number} · {level.title}
        </Link>
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
      ) : state.status === 'locked' ? (
        <div className="mt-8">
          <MissingPrerequisites
            course={course}
            missing={state.missing}
            what="lesson"
          />
        </div>
      ) : (
        <>
          <section
            aria-labelledby="objectives-h"
            className="mt-8 rounded-lg border bg-card p-4"
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
                <li key={m.claim} className="rounded-lg border p-4">
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

          <section aria-label="Knowledge check" className="mt-10">
            <AssessmentCard
              key={lesson.slug}
              course={course}
              assessment={lessonAssessment(course, lesson)}
              progress={progress}
              next={
                next && (
                  <Button asChild>
                    <ItemLink course={course.slug} item={next}>
                      Next: {next.title} <ArrowRight />
                    </ItemLink>
                  </Button>
                )
              }
            />
          </section>

          {lesson.scenario && (
            <div className="mt-10">
              <ScenarioPractice
                lessonSlug={lesson.slug}
                scenario={lesson.scenario}
              />
            </div>
          )}

          {lesson.takeaways && (
            <section aria-labelledby="summary-h" className="mt-10">
              <h2
                id="summary-h"
                className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
              >
                <ListChecks className="size-5 text-muted-foreground" />
                Summary
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {lesson.takeaways.map((t) => (
                  <li
                    key={t}
                    className="border-l-2 border-primary/40 pl-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: mdInline(t) }}
                  />
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="refs-h" className="mt-10">
            <h2 id="refs-h" className="text-lg font-semibold">
              References
            </h2>
            <References lesson={lesson} />
          </section>
        </>
      )}

      <ItemNav course={course} slug={lesson.slug} />
    </article>
  )
}

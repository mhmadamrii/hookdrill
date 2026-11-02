import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, ListTree, Play } from 'lucide-react'
import type { LevelCourse } from '@hookdrill/courses'
import { CourseProgressBar } from '@/components/courses/syllabus'
import { Button } from '@/components/ui/button'
import { useLevelProgress, type LevelProgress } from '@/lib/courses'
import { ItemRow } from './item-row'
import { ItemLink } from './lesson-view'
import { RecentResults } from './recent-results'

const panel = 'rounded-lg border bg-card'
const panelHead =
  'flex h-12 items-center justify-between gap-3 border-b px-4 text-sm font-semibold'

/** Title by slug across the whole course. */
export function itemTitles(course: LevelCourse) {
  return new Map(
    course.levels.flatMap((l) => l.items).map((i) => [i.slug, i.title]),
  )
}

function ContinueLearning({
  course,
  progress,
}: {
  course: LevelCourse
  progress: LevelProgress
}) {
  const next = progress.next
  if (!next)
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" disabled aria-describedby="sd-next">
          <Play /> Start learning
        </Button>
        <p id="sd-next" className="text-sm text-muted-foreground">
          {progress.done > 0
            ? 'You’ve finished everything published so far.'
            : 'The first lessons are being written. The full curriculum is below.'}
        </p>
      </div>
    )
  return next.kind === 'item' ? (
    <Button asChild size="lg">
      <ItemLink course={course.slug} item={next.item}>
        <Play /> {progress.done > 0 ? 'Continue' : 'Start'}: {next.item.title}
      </ItemLink>
    </Button>
  ) : (
    <Button asChild size="lg">
      <Link
        to="/courses/$course/curriculum"
        params={{ course: course.slug }}
        hash={next.level.slug}
      >
        <Play /> Next: {next.level.title} exam
      </Link>
    </Button>
  )
}

export function LevelDashboard({ course }: { course: LevelCourse }) {
  const progress = useLevelProgress(course)
  const titles = itemTitles(course)
  const challenges = progress.levels.flatMap((l) =>
    l.items.filter((i) => i.item.kind === 'challenge'),
  )
  const items = course.levels.flatMap((l) => l.items)
  const lessons = items.filter((i) => i.kind === 'lesson').length
  const curriculumPath = `/courses/${course.slug}/curriculum`

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
        <p className="mt-4 text-sm text-muted-foreground tabular-nums">
          {course.levels.length} levels · {lessons} lessons ·{' '}
          {items.length - lessons} design challenges · {course.level}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ContinueLearning course={course} progress={progress} />
          <Button asChild variant="outline" size="lg">
            <Link
              to="/courses/$course/curriculum"
              params={{ course: course.slug }}
            >
              <ListTree /> Curriculum
            </Link>
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="levels-h" className={panel}>
            <h2 id="levels-h" className={panelHead}>
              Your progress
              {progress.signedIn && (
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {progress.done}/{progress.total} passed
                </span>
              )}
            </h2>
            <ol className="divide-y">
              {progress.levels.map((l) => {
                const written = l.items.filter(
                  (i) => i.status !== 'planned',
                ).length
                return (
                  <li key={l.level.slug}>
                    <Link
                      to="/courses/$course/curriculum"
                      params={{ course: course.slug }}
                      hash={l.level.slug}
                      className="group grid gap-2 px-4 py-3.5 outline-none transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center sm:gap-6"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Level {l.level.number}
                        </p>
                        <p className="font-medium group-hover:text-brand">
                          {l.level.title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {l.level.summary}
                        </p>
                      </div>
                      <div>
                        <CourseProgressBar done={l.passed} total={l.total} />
                        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                          {written === 0
                            ? 'In development'
                            : `${written} of ${l.items.length} published`}
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>

          <section aria-labelledby="challenges-h" className={panel}>
            <h2 id="challenges-h" className={panelHead}>
              Design challenges
              <span className="text-xs font-normal text-muted-foreground">
                Final assessments · one submission each
              </span>
            </h2>
            <ul className="divide-y">
              {challenges.map((state) => (
                <ItemRow
                  key={state.item.slug}
                  courseSlug={course.slug}
                  state={state}
                  titles={titles}
                  curriculumPath={curriculumPath}
                />
              ))}
            </ul>
          </section>

          <RecentResults course={course} signedIn={progress.signedIn} />
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <div className={`${panel} p-4`}>
            <h2 className="text-sm font-semibold">What you’ll learn</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {course.outcomes.map((o) => (
                <li key={o} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accepted" />
                  {o}
                </li>
              ))}
            </ul>
            <h2 className="mt-5 text-sm font-semibold">Before you start</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              {course.prerequisites.map((p) => (
                <li key={p} className="my-1">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${panel} p-4 text-sm`}>
            <h2 className="font-semibold">How you progress</h2>
            <ul className="mt-3 flex flex-col gap-2 text-muted-foreground">
              <li>
                Take lessons in any order once their prerequisites are passed.
              </li>
              <li>
                Each lesson ends with a {course.rules.lessonQuizSize}-question
                knowledge check. Pass with{' '}
                {Math.round(course.rules.passMark * 100)}%.
              </li>
              <li>Pass every lesson in a level to open its level exam.</li>
              <li>
                Design challenges are graded against a published rubric. Many
                designs can score well; reasoning and trade-offs count most.
              </li>
              <li>
                You get one final submission per challenge. Drafts are
                unlimited.
              </li>
            </ul>
          </div>
          <div className={`${panel} p-4 text-sm`}>
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
          </div>
          <Link
            to="/courses/$course/curriculum"
            params={{ course: course.slug }}
            className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-brand hover:underline"
          >
            See the full curriculum <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>
    </>
  )
}

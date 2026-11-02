import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import { courseBySlug, type LevelCourse } from '@hookdrill/courses'
import { ItemIcon } from '@/components/courses/syllabus'
import { itemTitles } from '@/components/system-design/dashboard'
import { ItemRow } from '@/components/system-design/item-row'
import { useLevelProgress } from '@/lib/courses'
import { cn } from '@/lib/utils'

export const Route = createFileRoute(
  '/(main)/(library)/courses/$course/curriculum',
)({
  loader: ({ params }) => {
    const course = courseBySlug(params.course)
    // Only level courses have a separate curriculum page.
    if (course?.format !== 'levels' || course.status !== 'available')
      throw notFound()
    return { slug: course.slug, title: course.title }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Curriculum · ${loaderData.title} · HookDrill` }]
      : [],
  }),
  component: CurriculumPage,
})

const examLabel = {
  planned: 'After every lesson in this level is published',
  locked: 'Opens when every lesson in this level is passed',
  open: 'Ready',
  passed: 'Passed',
} as const

function CurriculumPage() {
  const { slug } = Route.useLoaderData()
  const course = courseBySlug(slug) as LevelCourse
  const progress = useLevelProgress(course)
  const titles = itemTitles(course)

  return (
    <div className="max-w-4xl py-2 md:py-4">
      <p className="text-sm text-muted-foreground">
        <Link to="/courses" className="hover:text-foreground">
          Courses
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          to="/courses/$course"
          params={{ course: course.slug }}
          className="hover:text-foreground"
        >
          {course.title}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        Curriculum
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Four levels, from building blocks to full designs. Each item opens when
        the items it builds on are passed, so you can follow your own route.
      </p>

      <ol className="mt-8 flex flex-col gap-8">
        {progress.levels.map((l) => (
          <li
            key={l.level.slug}
            id={l.level.slug}
            className="scroll-mt-20"
            aria-labelledby={`${l.level.slug}-h`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Level {l.level.number}
                </p>
                <h2
                  id={`${l.level.slug}-h`}
                  className="text-lg font-semibold tracking-tight"
                >
                  {l.level.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {l.level.summary}
                </p>
              </div>
              {progress.signedIn && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {l.passed}/{l.total} passed
                </span>
              )}
            </div>
            <ul
              className={cn(
                'mt-3 divide-y rounded-lg border bg-card',
                l.items.every((i) => i.status === 'planned') && 'border-dashed',
              )}
            >
              {l.items.map((state) => (
                <ItemRow
                  key={state.item.slug}
                  courseSlug={course.slug}
                  state={state}
                  titles={titles}
                />
              ))}
              {l.exam && (
                <li className="flex items-center gap-3 px-4 py-3">
                  {l.exam === 'passed' ? (
                    <ItemIcon status="passed" />
                  ) : (
                    <GraduationCap
                      aria-hidden
                      className={cn(
                        'size-4 shrink-0',
                        l.exam === 'open'
                          ? 'text-brand'
                          : 'text-muted-foreground/60',
                      )}
                    />
                  )}
                  <span className="flex-1 font-medium">
                    {l.level.title} exam
                  </span>
                  <span className="text-right text-xs text-muted-foreground">
                    {examLabel[l.exam]}
                  </span>
                </li>
              )}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}

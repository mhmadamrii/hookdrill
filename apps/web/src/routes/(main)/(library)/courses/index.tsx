import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Atom, BrainCircuit, Network } from 'lucide-react'
import { courses, type Course } from '@hookdrill/courses'
import { CourseProgressBar } from '@/components/courses/syllabus'
import { useCourseSummary } from '@/lib/courses'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(main)/(library)/courses/')({
  head: () => ({
    meta: [
      { title: 'Courses · HookDrill' },
      {
        name: 'description',
        content:
          'Structured paths with lessons, quizzes and exams. Start with AI Engineer.',
      },
    ],
  }),
  component: Courses,
})

const icons: Record<string, typeof Atom> = {
  'ai-engineer': BrainCircuit,
  'system-design': Network,
  'react-mastery': Atom,
}

/** One line of course facts for the card. */
function facts(course: Course) {
  if (course.status === 'coming-soon') return 'Syllabus in progress'
  if (course.format === 'levels') {
    const items = course.levels.flatMap((l) => l.items)
    const lessons = items.filter((i) => i.kind === 'lesson').length
    return `${course.levels.length} levels · ${lessons} lessons · ${items.length - lessons} design challenges · ${course.level}`
  }
  const all = course.phases.flatMap((p) => p.modules)
  const open = all.filter((m) => m.module).length
  return `${course.phases.length} phases · ${all.length} modules · ${open} open now · ${course.level}`
}

function CourseCard({ course }: { course: Course }) {
  const progress = useCourseSummary(course)
  const Icon = icons[course.slug] ?? BrainCircuit
  const soon = course.status === 'coming-soon'
  const started = progress.signedIn && progress.done > 0
  return (
    <li>
      <Link
        to="/courses/$course"
        params={{ course: course.slug }}
        className="group flex h-full flex-col rounded-xl border bg-card p-6 outline-none transition-colors hover:border-ring/40 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'grid size-12 place-items-center rounded-xl',
              soon ? 'bg-secondary' : 'bg-banner-plan text-white',
            )}
          >
            <Icon className={cn('size-6', soon && 'text-muted-foreground')} />
          </span>
          {soon && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Coming soon
            </span>
          )}
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight group-hover:text-brand">
          {course.title}
        </h2>
        <p className="mt-1.5 text-muted-foreground">{course.tagline}</p>
        <p className="mt-4 text-sm text-muted-foreground">{facts(course)}</p>
        <div className="mt-auto pt-6">
          {started ? (
            <CourseProgressBar done={progress.done} total={progress.total} />
          ) : (
            !soon && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                View the course <ArrowRight className="size-4" />
              </span>
            )
          )}
        </div>
      </Link>
    </li>
  )
}

function Courses() {
  return (
    <div className="py-2 md:py-4">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Courses
        </h1>
        <p className="mt-2 text-muted-foreground">
          Structured paths with lessons, quizzes and exams. Pass each part to
          unlock the next.
        </p>
      </header>
      <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <CourseCard key={c.slug} course={c} />
        ))}
      </ul>
    </div>
  )
}

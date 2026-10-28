import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Course } from '@hookdrill/courses'
import { courseSteps } from '@/lib/courses'
import { StepLink } from './step-link'

const card =
  'flex flex-col gap-1 rounded-xl border px-4 py-3 outline-none transition-colors hover:border-ring/40 hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50'

/** Previous and next lesson or exam, at the foot of a page. */
export function StepNav({
  course,
  kind,
  slug,
}: {
  course: Course
  kind: 'lesson' | 'exam'
  slug: string
}) {
  const steps = courseSteps(course)
  const i = steps.findIndex((s) => s.kind === kind && s.slug === slug)
  const prev = steps[i - 1]
  const next = steps[i + 1]
  return (
    <nav
      aria-label="Previous and next"
      className="mt-10 grid gap-3 border-t pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <StepLink course={course.slug} step={prev} className={card}>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="size-3" /> Previous
          </span>
          <span className="font-medium">{prev.title}</span>
        </StepLink>
      ) : (
        <span />
      )}
      {next && (
        <StepLink
          course={course.slug}
          step={next}
          className={`${card} sm:items-end sm:text-right`}
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Next <ArrowRight className="size-3" />
          </span>
          <span className="font-medium">{next.title}</span>
        </StepLink>
      )}
    </nav>
  )
}

export function LockedNotice({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-secondary">
        <Lock className="size-5 text-muted-foreground" />
      </span>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <div className="mt-1 max-w-md text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

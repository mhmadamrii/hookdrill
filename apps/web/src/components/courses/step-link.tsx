import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { Step } from '@/lib/courses'

/** Links to a lesson or an exam, whichever the step is. */
export function StepLink({
  course,
  step,
  className,
  children,
}: {
  course: string
  step: Step
  className?: string
  children: ReactNode
}) {
  return step.kind === 'lesson' ? (
    <Link
      to="/courses/$course/$lesson"
      params={{ course, lesson: step.slug }}
      className={className}
    >
      {children}
    </Link>
  ) : (
    <Link
      to="/courses/$course/exam/$submodule"
      params={{ course, submodule: step.slug }}
      className={className}
    >
      {children}
    </Link>
  )
}

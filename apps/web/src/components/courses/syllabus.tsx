import { Link } from '@tanstack/react-router'
import { CheckCircle2, Circle, GraduationCap, Lock } from 'lucide-react'
import type { ItemStatus } from '@hookdrill/courses'
import type { CourseProgress } from '@/lib/courses'
import { cn } from '@/lib/utils'

export function ItemIcon({
  status,
  className,
}: {
  status: ItemStatus
  className?: string
}) {
  if (status === 'passed')
    return (
      <CheckCircle2
        aria-label="Passed"
        className={cn('size-4 shrink-0 text-accepted', className)}
      />
    )
  if (status === 'locked')
    return (
      <Lock
        aria-label="Locked"
        className={cn('size-4 shrink-0 text-muted-foreground/70', className)}
      />
    )
  return (
    <Circle
      aria-label="Not passed yet"
      className={cn('size-4 shrink-0 text-muted-foreground/60', className)}
    />
  )
}

const item =
  'flex min-h-9 items-start gap-2.5 rounded-md px-2.5 py-2 text-sm leading-snug outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:bg-secondary data-[status=active]:font-medium data-[status=active]:text-foreground'

/** The course outline beside a lesson: every lesson and exam, with status. */
export function SyllabusNav({
  courseSlug,
  progress,
  onNavigate,
}: {
  courseSlug: string
  progress: CourseProgress
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Course outline" className="flex flex-col gap-5">
      {progress.states.map((m) => (
        <div key={m.module.slug}>
          <p className="px-2.5 text-xs font-medium text-muted-foreground">
            Module {String(m.module.number).padStart(2, '0')}
          </p>
          <p className="px-2.5 pt-0.5 text-sm font-semibold">
            {m.module.title}
          </p>
          {m.submodules.map((s) => (
            <div key={s.submodule.slug} className="mt-3">
              <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">
                {s.submodule.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {s.lessons.map(({ lesson, status }) => (
                  <li key={lesson.slug}>
                    <Link
                      to="/courses/$course/$lesson"
                      params={{ course: courseSlug, lesson: lesson.slug }}
                      onClick={onNavigate}
                      className={cn(
                        item,
                        status === 'locked'
                          ? 'text-muted-foreground/80'
                          : 'text-muted-foreground',
                      )}
                    >
                      <ItemIcon status={status} className="mt-0.5" />
                      <span>{lesson.title}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/courses/$course/exam/$submodule"
                    params={{
                      course: courseSlug,
                      submodule: s.submodule.slug,
                    }}
                    onClick={onNavigate}
                    className={cn(item, 'text-muted-foreground')}
                  >
                    {s.exam === 'passed' ? (
                      <ItemIcon status="passed" className="mt-0.5" />
                    ) : (
                      <GraduationCap
                        aria-label={
                          s.exam === 'locked' ? 'Locked' : 'Not passed yet'
                        }
                        className={cn(
                          'mt-0.5 size-4 shrink-0',
                          s.exam === 'open'
                            ? 'text-brand'
                            : 'text-muted-foreground/70',
                        )}
                      />
                    )}
                    <span>Submodule exam</span>
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function CourseProgressBar({
  done,
  total,
  className,
}: {
  done: number
  total: number
  className?: string
}) {
  const value = total ? Math.round((done / total) * 100) : 0
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course progress"
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {done}/{total}
      </span>
    </div>
  )
}

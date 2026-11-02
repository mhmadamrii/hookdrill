import { Link } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import type { LevelProgress } from '@/lib/courses'
import { ItemIcon } from '@/components/courses/syllabus'
import { cn } from '@/lib/utils'
import { ItemLink } from './lesson-view'

const item =
  'flex min-h-9 items-start gap-2.5 rounded-md px-2.5 py-2 text-sm leading-snug outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:bg-secondary data-[status=active]:font-medium data-[status=active]:text-foreground'

/** The course outline beside a lesson, exam or challenge: levels and items. */
export function LevelOutlineNav({
  courseSlug,
  progress,
  onNavigate,
}: {
  courseSlug: string
  progress: LevelProgress
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Course outline" className="flex flex-col gap-5">
      {progress.levels.map((l) => (
        <div key={l.level.slug}>
          <p className="px-2.5 text-xs font-medium text-muted-foreground">
            Level {l.level.number}
          </p>
          <p className="px-2.5 pt-0.5 pb-1 text-sm font-semibold">
            {l.level.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {l.items.map(({ item: it, status }) => (
              <li key={it.slug} onClick={onNavigate}>
                {status === 'planned' ? (
                  <span className={cn(item, 'text-muted-foreground/70')}>
                    <ItemIcon status={status} className="mt-0.5" />
                    <span>{it.title}</span>
                  </span>
                ) : (
                  <ItemLink
                    course={courseSlug}
                    item={it}
                    className={cn(item, 'text-muted-foreground')}
                  >
                    <ItemIcon status={status} className="mt-0.5" />
                    <span>{it.title}</span>
                  </ItemLink>
                )}
              </li>
            ))}
            {l.exam && l.exam !== 'planned' && (
              <li>
                <Link
                  to="/courses/$course/exam/$submodule"
                  params={{ course: courseSlug, submodule: l.level.slug }}
                  onClick={onNavigate}
                  className={cn(item, 'text-muted-foreground')}
                >
                  {l.exam === 'passed' ? (
                    <ItemIcon status="passed" className="mt-0.5" />
                  ) : (
                    <GraduationCap
                      aria-hidden
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        l.exam === 'open'
                          ? 'text-brand'
                          : 'text-muted-foreground/70',
                      )}
                    />
                  )}
                  <span>Level exam</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      ))}
    </nav>
  )
}

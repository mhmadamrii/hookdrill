import { BookOpen, PenTool } from 'lucide-react'
import type { ItemState, LevelItem } from '@hookdrill/courses'
import { ItemIcon } from '@/components/courses/syllabus'
import { cn } from '@/lib/utils'
import { ItemLink } from './lesson-view'

const statusLabel = {
  planned: 'In development',
  locked: 'Locked',
  open: 'Ready',
  passed: 'Passed',
} as const

export function KindIcon({
  item,
  className,
}: {
  item: LevelItem
  className?: string
}) {
  const Icon = item.kind === 'lesson' ? BookOpen : PenTool
  return (
    <Icon
      aria-label={item.kind === 'lesson' ? 'Lesson' : 'Design challenge'}
      className={cn('size-4 shrink-0 text-muted-foreground', className)}
    />
  )
}

/**
 * One curriculum item: status, title, summary and what it still needs.
 * Prerequisites link to their own rows on the curriculum page.
 */
export function ItemRow({
  courseSlug,
  state,
  titles,
  curriculumPath = '',
}: {
  courseSlug: string
  state: ItemState
  /** Title by slug, for naming prerequisites. */
  titles: Map<string, string>
  /** Page the prerequisite anchors live on; the current page by default. */
  curriculumPath?: string
}) {
  const { item, status, missing } = state
  const linked = status === 'open' || status === 'passed'
  const title = linked ? (
    <ItemLink
      course={courseSlug}
      item={item}
      className="font-medium hover:text-brand"
    >
      {item.title}
    </ItemLink>
  ) : (
    <span
      className={cn(
        'font-medium',
        status === 'planned' && 'text-muted-foreground',
      )}
    >
      {item.title}
    </span>
  )
  return (
    <li
      id={item.slug}
      className="grid scroll-mt-20 grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-3 target:bg-primary/[0.06]"
    >
      <ItemIcon status={status} className="mt-0.5" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="flex min-w-0 items-center gap-2">
            <KindIcon item={item} />
            {title}
          </p>
          <span className="text-xs text-muted-foreground">
            {statusLabel[status]}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{item.summary}</p>
        {item.prerequisites.length > 0 && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{status === 'locked' ? 'Needs' : 'Builds on'}</span>
            {item.prerequisites.map((slug) => {
              const done = !missing.some((m) => m.slug === slug)
              return (
                <a
                  key={slug}
                  href={`${curriculumPath}#${slug}`}
                  className={cn(
                    'rounded-full px-2 py-0.5 hover:text-foreground',
                    done
                      ? 'bg-accepted/10 text-accepted'
                      : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {titles.get(slug) ?? slug}
                </a>
              )
            })}
          </p>
        )}
      </div>
    </li>
  )
}

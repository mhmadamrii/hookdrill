import { Link, useRouterState } from '@tanstack/react-router'
import {
  BookOpen,
  BrainCircuit,
  FlaskConical,
  GraduationCap,
  Star,
  Trophy,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { aiEngineer } from '@hookdrill/courses'
import { useCourseProgress } from '@/lib/courses'
import { useFavorites } from '@/lib/favorites'
import { playableProblems } from '@/lib/problems'
import { cn } from '@/lib/utils'

const row =
  'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

function Item({
  icon: Icon,
  children,
  badge,
  iconClassName,
  inactive,
  activeOptions = { exact: true, includeHash: true, includeSearch: false },
  ...link
}: {
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  badge?: ReactNode
  iconClassName?: string
  /** Suppresses the active style when a more specific item owns this URL. */
  inactive?: boolean
} & React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...link}
      // The router marks the current page with data-status="active" and aria-current.
      activeOptions={activeOptions}
      className={cn(
        row,
        'text-muted-foreground hover:bg-accent hover:text-foreground',
        !inactive &&
          'data-[status=active]:bg-secondary data-[status=active]:text-foreground',
      )}
    >
      <Icon className={cn('size-[18px]', iconClassName)} />
      <span className="flex-1">{children}</span>
      {badge}
    </Link>
  )
}

export function LibrarySidebar() {
  const favorites = useFavorites()
  const count = playableProblems.filter((p) => favorites.has(p.slug)).length
  const onFavorites = useRouterState({
    select: (s) =>
      (s.location.search as { list?: string } | undefined)?.list === 'favorite',
  })
  return (
    <nav
      aria-label="Library"
      className="sticky top-[4.5rem] flex flex-col gap-1"
    >
      <Item icon={BookOpen} to="/problems" inactive={onFavorites}>
        Library
      </Item>
      <Item
        icon={GraduationCap}
        to="/courses"
        // Stays active on every course page.
        activeOptions={{ exact: false }}
      >
        Courses
      </Item>
      <Item icon={Trophy} to="/contests">
        Contests
      </Item>
      <Item
        icon={FlaskConical}
        to="/builder-lab"
        badge={
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-medium text-brand">
            Soon
          </span>
        }
      >
        Builder Lab
      </Item>

      <div className="my-3 h-px bg-border" />

      <MyCourses />

      <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">
        My lists
      </h2>
      <Item
        icon={Star}
        iconClassName={cn('text-medium', count > 0 && 'fill-current')}
        to="/problems"
        // Item's props are untyped per route; this matches ProblemsSearch.
        search={{ list: 'favorite' } as never}
        // Search matching is partial, so extra filters keep this item active.
        activeOptions={{ includeSearch: true }}
        badge={<span className="text-xs tabular-nums">{count}</span>}
      >
        Favorite
      </Item>
      <p className="px-3 text-xs leading-5 text-muted-foreground">
        {count === 0
          ? 'Star a problem to keep it here. Saved in this browser.'
          : 'Saved in this browser.'}
      </p>
    </nav>
  )
}

/** Courses the user has started, so they can jump back in. */
function MyCourses() {
  const progress = useCourseProgress(aiEngineer)
  if (!progress.signedIn || progress.done === 0) return null
  return (
    <>
      <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">
        My courses
      </h2>
      <Item
        icon={BrainCircuit}
        to="/courses/$course"
        params={{ course: aiEngineer.slug } as never}
        badge={
          <span className="text-xs tabular-nums">
            {progress.done}/{progress.total}
          </span>
        }
      >
        {aiEngineer.title}
      </Item>
      <div className="h-3" />
    </>
  )
}

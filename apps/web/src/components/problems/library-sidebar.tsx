import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  Compass,
  FlaskConical,
  ListChecks,
  Star,
  Trophy,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const row =
  'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

function Item({
  icon: Icon,
  children,
  badge,
  ...link
}: {
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  badge?: ReactNode
} & React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...link}
      // The router marks the current page with data-status="active" and aria-current.
      activeOptions={{ exact: true, includeHash: true, includeSearch: false }}
      className={cn(
        row,
        'text-muted-foreground hover:bg-accent hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground',
      )}
    >
      <Icon className="size-[18px]" />
      <span className="flex-1">{children}</span>
      {badge}
    </Link>
  )
}

export function LibrarySidebar() {
  return (
    <nav
      aria-label="Library"
      className="sticky top-[4.5rem] flex flex-col gap-1"
    >
      <Item icon={BookOpen} to="/problems">
        Library
      </Item>
      <Item icon={Compass} to="/explore">
        Explore
      </Item>
      <Item icon={ListChecks} to="/explore" hash="tracks">
        Study plans
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

      <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">
        My lists
      </h2>
      <div
        className={cn(row, 'cursor-default text-muted-foreground')}
        title="Starring problems is coming soon"
      >
        <Star className="size-[18px] text-medium" />
        <span className="flex-1">Favorite</span>
        <span className="text-xs tabular-nums">0</span>
      </div>
      <p className="px-3 text-xs leading-5 text-muted-foreground">
        Starring problems is coming soon. Your list stays in this browser.
      </p>
    </nav>
  )
}

import { Link } from '@tanstack/react-router'
import { BookOpen, Compass, ListChecks, Star, Trophy } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const row =
  'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

function Item({
  icon: Icon,
  children,
  active,
  ...link
}: {
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  active?: boolean
} & React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...link}
      aria-current={active ? 'page' : undefined}
      className={cn(
        row,
        active
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="size-[18px]" />
      {children}
    </Link>
  )
}

export function LibrarySidebar() {
  return (
    <nav aria-label="Library" className="sticky top-[4.5rem] flex flex-col gap-1">
      <Item icon={BookOpen} to="/problems" active>
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

      <div className="my-3 h-px bg-border" />

      <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">My lists</h2>
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

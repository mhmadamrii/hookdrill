import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/logo'
import { ProblemSearch } from '@/components/problem-search'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'

const nav = [
  { to: '/problems', label: 'Problems' },
  { to: '/explore', label: 'Explore' },
  { to: '/contests', label: 'Contests' },
  { to: '/leaderboard', label: 'Leaderboard' },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 md:px-6">
        <Link to="/" aria-label="HookDrill home">
          <Logo />
        </Link>
        <nav className="flex h-full items-center gap-1 overflow-x-auto text-sm max-sm:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative flex h-full items-center px-3 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:bottom-0 data-[status=active]:after:h-0.5 data-[status=active]:after:rounded-full data-[status=active]:after:bg-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ProblemSearch />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

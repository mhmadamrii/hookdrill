import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/logo'

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:px-6">
        <Logo className="text-foreground" />
        <nav className="flex flex-wrap gap-5">
          <Link to="/problems" className="hover:text-foreground">
            Problems
          </Link>
          <Link to="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <Link to="/contests" className="hover:text-foreground">
            Contests
          </Link>
          <Link to="/leaderboard" className="hover:text-foreground">
            Leaderboard
          </Link>
        </nav>
        <p>Practice by hand. Verified by tests.</p>
      </div>
    </footer>
  )
}

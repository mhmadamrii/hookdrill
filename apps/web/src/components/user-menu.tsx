import { Link } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut, useSession } from '@/lib/auth-client'

export function UserMenu() {
  const { data, isPending } = useSession()

  if (isPending)
    return <span className="size-8 rounded-full bg-secondary" aria-hidden />

  if (!data) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/signin">Sign in</Link>
        </Button>
        <Button asChild size="sm" className="max-sm:hidden">
          <Link to="/problems">Start practicing</Link>
        </Button>
      </div>
    )
  }

  const { user } = data
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Account menu"
      >
        <Avatar className="size-8">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
            {user.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-semibold">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserRound /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut()
            // A full load drops every cached query along with the session;
            // useSession lags a moment, so a client-side navigate would refetch as 401s.
            window.location.assign('/')
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

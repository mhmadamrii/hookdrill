import { Link } from '@tanstack/react-router'
import { LogOut, UserRound } from 'lucide-react'
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

  if (isPending) return <span className="size-8" aria-hidden />

  if (!data) {
    return (
      <Button asChild variant="secondary" size="sm">
        <Link to="/signin">Sign in</Link>
      </Button>
    )
  }

  const { user } = data
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-on-cover"
        aria-label="Account menu"
      >
        <Avatar className="size-8">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback className="bg-on-cover-2 font-bold text-cover-deep">
            {user.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-semibold">{user.name}</span>
          <span className="block text-xs text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/me">
            <UserRound /> Practice record
          </Link>
        </DropdownMenuItem>
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

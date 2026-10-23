import { CalendarDays, Mail, Pencil } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { summarize, type ProgressRow } from '@/components/dashboard/stats'

interface User {
  name?: string | null
  email: string
  image?: string | null
  createdAt: Date | string
}

/** Left column of the own profile: identity, rating state and quick counts. */
export function ProfileCard({ user, rows }: { user: User; rows: ProgressRow[] }) {
  const name = user.name?.trim() || user.email.split('@')[0]
  const joined = new Date(user.createdAt)
  const s = summarize(rows)
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <Avatar className="size-16 rounded-lg lg:size-20">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback className="rounded-lg bg-primary text-2xl font-semibold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">{name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Unrated <span className="text-xs">· rating starts with your first contest</span>
          </p>
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="mt-5 block rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
            <Button variant="secondary" className="w-full" disabled>
              <Pencil />
              Edit profile
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>

      <ul className="mt-5 flex flex-col gap-2.5 text-sm">
        <li className="flex items-center gap-2.5 text-muted-foreground">
          <Mail className="size-4 shrink-0" />
          <span className="truncate">{user.email}</span>
        </li>
        {!Number.isNaN(joined.getTime()) && (
          <li className="flex items-center gap-2.5 text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            Joined {joined.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
          </li>
        )}
      </ul>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-5 text-sm">
        {[
          ['Solved', s.solved],
          ['In progress', s.attempted],
          ['Runs', s.runs],
          ['Hints used', s.hints],
        ].map(([term, value]) => (
          <div key={term}>
            <dt className="text-xs text-muted-foreground">{term}</dt>
            <dd className="text-base font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

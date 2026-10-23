import { useNavigate } from '@tanstack/react-router'
import type { Difficulty } from '@hookdrill/challenges'
import {
  ArrowUpDown,
  Atom,
  Binary,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ListFilter,
  Search,
  Shuffle,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { playableProblems, problems, topics } from '@/lib/problems'
import { cn } from '@/lib/utils'
import { activeFilterCount, type ProblemsSearch, type SortKey, type StatusFilter } from './search'

type Update = (patch: Partial<ProblemsSearch>) => void

const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

export function TopicChips({ active, onSelect }: { active?: string; onSelect: (tag?: string) => void }) {
  const [open, setOpen] = useState(false)
  const shown = open ? topics : topics.slice(0, 9)
  return (
    <div className="flex items-start gap-2">
      <ul
        className={cn(
          'flex flex-1 flex-wrap gap-x-1 gap-y-1',
          !open && 'max-h-8 overflow-hidden',
        )}
      >
        {shown.map((t) => {
          const on = active === t.name
          return (
            <li key={t.name}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(on ? undefined : t.name)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm transition-colors',
                  focusRing,
                  on ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent',
                )}
              >
                {t.name}
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    on ? 'text-primary-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {t.count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 text-muted-foreground"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Show less' : 'Show more'}
        {open ? <ChevronUp /> : <ChevronDown />}
      </Button>
    </div>
  )
}

const categories = [
  { value: undefined, label: 'All', icon: LayoutGrid },
  { value: 'react' as const, label: 'React UI', icon: Atom },
  { value: 'dsa' as const, label: 'DSA', icon: Binary },
]

export function CategoryPills({ track, update }: { track?: 'react' | 'dsa'; update: Update }) {
  return (
    <div role="group" aria-label="Track" className="flex flex-wrap gap-2">
      {categories.map(({ value, label, icon: Icon }) => {
        const on = track === value
        const count = value ? problems.filter((p) => p.track === value).length : problems.length
        return (
          <button
            key={label}
            type="button"
            aria-pressed={on}
            onClick={() => update({ track: value })}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors',
              focusRing,
              on
                ? 'bg-foreground text-background'
                : 'bg-secondary text-secondary-foreground hover:bg-accent',
            )}
          >
            <Icon className="size-4" />
            {label}
            <span className={cn('text-xs tabular-nums', on ? 'opacity-70' : 'text-muted-foreground')}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const sortLabels: Record<SortKey, string> = {
  default: 'Default order',
  difficulty: 'Difficulty',
  acceptance: 'Acceptance',
  title: 'Title',
}

const diffOptions: Array<[Difficulty, string, string]> = [
  ['easy', 'Easy', 'text-easy'],
  ['medium', 'Medium', 'text-medium'],
  ['hard', 'Hard', 'text-hard'],
]
const statusOptions: Array<[StatusFilter, string]> = [
  ['solved', 'Solved'],
  ['attempted', 'Attempted'],
  ['todo', 'To do'],
]

function toggle<T>(list: T[] | undefined, v: T): T[] | undefined {
  const next = list?.includes(v) ? list.filter((x) => x !== v) : [...(list ?? []), v]
  return next.length ? next : undefined
}

export function Toolbar({
  search,
  update,
  solved,
  progressLoading,
}: {
  search: ProblemsSearch
  update: Update
  solved: number
  progressLoading: boolean
}) {
  const navigate = useNavigate()
  const filters = activeFilterCount(search)
  const [q, setQ] = useState(search.q ?? '')
  useEffect(() => setQ(search.q ?? ''), [search.q])

  function pickRandom() {
    const p = playableProblems[Math.floor(Math.random() * playableProblems.length)]
    navigate({ to: '/problems/$slug', params: { slug: p.slug } })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-56 sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            update({ q: e.target.value || undefined })
          }}
          placeholder="Search problems"
          aria-label="Search problems"
          className="h-9 rounded-full bg-secondary pl-9 dark:bg-secondary"
        />
      </div>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Sort: ${sortLabels[search.sort ?? 'default']}`}
                className={cn('rounded-full', search.sort && 'bg-secondary text-brand')}
              >
                <ArrowUpDown />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Sort</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={search.sort ?? 'default'}
            onValueChange={(v) => update({ sort: v === 'default' ? undefined : (v as SortKey) })}
          >
            {(Object.keys(sortLabels) as SortKey[]).map((k) => (
              <DropdownMenuRadioItem key={k} value={k}>
                {sortLabels[k]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={filters ? `Filters (${filters} active)` : 'Filters'}
                className={cn('relative rounded-full', filters > 0 && 'bg-secondary text-brand')}
              >
                <ListFilter />
                {filters > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
                    {filters}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Filter</TooltipContent>
        </Tooltip>
        <PopoverContent align="start" className="w-64 p-0">
          <div className="space-y-4 p-4">
            <fieldset className="space-y-2.5">
              <legend className="mb-2 text-xs font-medium text-muted-foreground">Difficulty</legend>
              {diffOptions.map(([v, label, color]) => (
                <div key={v} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`diff-${v}`}
                    checked={!!search.diff?.includes(v)}
                    onCheckedChange={() => update({ diff: toggle(search.diff, v) })}
                  />
                  <Label htmlFor={`diff-${v}`} className={cn('font-medium', color)}>
                    {label}
                  </Label>
                </div>
              ))}
            </fieldset>
            <fieldset className="space-y-2.5">
              <legend className="mb-2 text-xs font-medium text-muted-foreground">Status</legend>
              {statusOptions.map(([v, label]) => (
                <div key={v} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`status-${v}`}
                    checked={!!search.status?.includes(v)}
                    onCheckedChange={() => update({ status: toggle(search.status, v) })}
                  />
                  <Label htmlFor={`status-${v}`}>{label}</Label>
                </div>
              ))}
            </fieldset>
            <div className="flex items-center gap-2.5 border-t pt-4">
              <Checkbox
                id="only-playable"
                checked={!!search.playable}
                onCheckedChange={(c) => update({ playable: c === true ? true : undefined })}
              />
              <Label htmlFor="only-playable">Only open problems</Label>
            </div>
          </div>
          <div className="flex justify-end border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!filters}
              onClick={() => update({ diff: undefined, status: undefined, playable: undefined })}
            >
              <X /> Reset filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          <span
            className={cn('font-semibold text-foreground tabular-nums', progressLoading && 'opacity-50')}
          >
            {solved}
          </span>
          <span className="tabular-nums">/{problems.length}</span> Solved
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              aria-label="Pick a random problem"
              className="rounded-full"
              onClick={pickRandom}
            >
              <Shuffle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pick random</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

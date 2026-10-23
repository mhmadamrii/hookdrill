import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Lock, Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { DifficultyText } from '@/components/difficulty'
import { problems } from '@/lib/problems'

/** ⌘K / Ctrl+K problem search. */
export function ProblemSearch() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-56 items-center gap-2 rounded-full bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:bg-accent max-md:w-8 max-md:justify-center max-md:px-0"
      >
        <Search className="size-4 shrink-0" />
        <span className="max-md:hidden">Search problems</span>
        <kbd className="ml-auto rounded border bg-background px-1.5 font-mono text-[10px] max-md:hidden">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search problems">
        <CommandInput placeholder="Search by title or tag…" />
        <CommandList>
          <CommandEmpty>No problems found.</CommandEmpty>
          <CommandGroup heading="Problems">
            {problems.map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.number} ${p.title} ${p.tags.join(' ')}`}
                disabled={!p.playable}
                onSelect={() => {
                  setOpen(false)
                  navigate({ to: '/problems/$slug', params: { slug: p.slug } })
                }}
              >
                <span className="w-8 text-muted-foreground tabular-nums">{p.number}.</span>
                <span className="flex-1 truncate">{p.title}</span>
                {!p.playable && <Lock className="text-muted-foreground" />}
                <DifficultyText level={p.difficulty} short className="w-12 text-right text-xs" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

import { useRef, useState } from 'react'
import { marked } from 'marked'
import {
  CheckCircle2,
  FileText,
  History,
  Lightbulb,
  Lock,
  Star,
  Tag,
} from 'lucide-react'
import type { Challenge } from '@hookdrill/challenges'
import { DifficultyPill } from '@/components/difficulty'
import { TestStrip, stripFromCounts } from '@/components/test-strip'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFavorites } from '@/lib/favorites'
import { cn } from '@/lib/utils'
import { PanelTabs } from './panel'

/** Saved progress for this problem, as far as the workspace needs it. */
export interface ProblemRecord {
  runs: number
  lastPassed: number
  lastTotal: number
  publicPassedAt: Date | null
  updatedAt: Date
}

export function ProblemPanel({
  challenge,
  number,
  tags,
  record,
  signedIn,
  hintsRevealed = 0,
  onHintReveal,
}: {
  challenge: Challenge
  number: number
  tags: string[]
  record: ProblemRecord | null
  signedIn: boolean
  hintsRevealed?: number
  onHintReveal?: (count: number) => void
}) {
  const hintsRef = useRef<HTMLDivElement>(null)
  const solved = !!record?.publicPassedAt
  const favorites = useFavorites()
  const starred = favorites.has(challenge.slug)

  return (
    <Tabs defaultValue="description" className="flex h-full flex-col gap-0">
      <PanelTabs>
        <TabsList className="h-9 bg-transparent p-0">
          <TabsTrigger
            value="description"
            className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <FileText className="text-brand" /> Description
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <History className="text-medium" /> Submissions
          </TabsTrigger>
        </TabsList>
      </PanelTabs>

      <TabsContent value="description" className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <article className="px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                {number}. {challenge.title}
              </h1>
              {solved && (
                <span className="mt-1.5 inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                  Solved <CheckCircle2 className="size-4 text-accepted" />
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <DifficultyPill level={challenge.difficulty} />
              <Popover>
                <PopoverTrigger className="inline-flex h-6 items-center gap-1 rounded-full bg-surface-2 px-2.5 text-xs font-medium hover:bg-accent">
                  <Tag className="size-3" /> Topics
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="flex w-auto flex-wrap gap-1.5 p-3"
                >
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-surface-2 px-2.5 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </PopoverContent>
              </Popover>
              <button
                type="button"
                aria-pressed={starred}
                onClick={() => favorites.toggle(challenge.slug)}
                className="inline-flex h-6 items-center gap-1 rounded-full bg-surface-2 px-2.5 text-xs font-medium hover:bg-accent"
              >
                <Star
                  className={cn(
                    'size-3',
                    starred && 'fill-current text-medium',
                  )}
                />
                {starred ? 'Favorited' : 'Favorite'}
              </button>
              {challenge.hints.length > 0 && (
                <button
                  onClick={() =>
                    hintsRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex h-6 items-center gap-1 rounded-full bg-surface-2 px-2.5 text-xs font-medium hover:bg-accent"
                >
                  <Lightbulb className="size-3" /> Hint
                </button>
              )}
            </div>
            <div
              className="prose-problem mt-5"
              // Challenge content is authored in-repo, so it is trusted.
              dangerouslySetInnerHTML={{
                __html: marked.parse(challenge.description, { async: false }),
              }}
            />
            <div ref={hintsRef} className="mt-8 scroll-mt-4">
              <Hints
                hints={challenge.hints}
                initial={hintsRevealed}
                onReveal={onHintReveal}
              />
            </div>
          </article>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="submissions" className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <Submissions record={record} signedIn={signedIn} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}

function Hints({
  hints,
  initial,
  onReveal,
}: {
  hints: string[]
  initial: number
  onReveal?: (count: number) => void
}) {
  const [revealed, setRevealed] = useState(Math.min(initial, hints.length))
  if (hints.length === 0) return null

  return (
    <section aria-label="Hints" className="divide-y border-y">
      {hints.map((hint, i) => {
        const open = i < revealed
        const next = i === revealed
        return (
          <div key={i} className="py-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span
                className={cn(
                  'inline-flex items-center gap-2 font-medium',
                  !open && 'text-muted-foreground',
                )}
              >
                {open ? (
                  <Lightbulb className="size-4 text-medium" />
                ) : (
                  <Lock className="size-4" />
                )}
                Hint {i + 1}
              </span>
              {next && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => {
                    setRevealed(revealed + 1)
                    onReveal?.(revealed + 1)
                  }}
                >
                  Reveal
                </Button>
              )}
            </div>
            {open && (
              <p
                className="prose-problem mt-2 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: marked.parseInline(hint, { async: false }),
                }}
              />
            )}
          </div>
        )
      })}
      <p className="pt-3 text-xs text-muted-foreground">
        Hints are revealed one at a time. Once ranked submissions launch, each
        one used costs 15% of the problem's points.
      </p>
    </section>
  )
}

function Submissions({
  record,
  signedIn,
}: {
  record: ProblemRecord | null
  signedIn: boolean
}) {
  if (!signedIn) {
    return (
      <div className="px-5 py-10 text-sm text-muted-foreground">
        Sign in to keep a history of your runs on this problem.
      </div>
    )
  }
  if (!record || record.runs === 0) {
    return (
      <div className="px-5 py-10 text-sm text-muted-foreground">
        No runs yet. Press Run or Submit to check your code against the tests.
      </div>
    )
  }
  const allPassed =
    record.lastTotal > 0 && record.lastPassed === record.lastTotal
  return (
    <div className="px-5 py-5">
      <div className="rounded-lg border bg-surface-2/50 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={cn(
              'text-lg font-semibold',
              allPassed ? 'text-accepted' : 'text-wrong',
            )}
          >
            {allPassed
              ? 'All tests passed'
              : `${record.lastPassed} / ${record.lastTotal} tests passed`}
          </span>
          <span className="text-xs text-muted-foreground">
            Last run{' '}
            {record.updatedAt.toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        </div>
        <TestStrip
          className="mt-3"
          cells={stripFromCounts(record.lastPassed, record.lastTotal)}
        />
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Runs</dt>
            <dd className="font-medium tabular-nums">{record.runs}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">First full pass</dt>
            <dd className="font-medium">
              {record.publicPassedAt
                ? record.publicPassedAt.toLocaleDateString([], {
                    dateStyle: 'medium',
                  })
                : 'Not yet'}
            </dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        These results come from tests run in your browser. A full submission
        history with server verdicts arrives with ranked grading.
      </p>
    </div>
  )
}

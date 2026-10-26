import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SiteFooter } from '@/components/site-footer'
import { FameTable, type FamePeriod } from '@/components/leaderboard/fame-table'
import { RatingTable } from '@/components/leaderboard/rating-table'
import { SampleNote } from '@/components/leaderboard/sample-note'
import {
  FameRules,
  TierLegend,
  YourPosition,
} from '@/components/leaderboard/side-cards'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Board = 'rating' | 'fame'

interface LeaderboardSearch {
  board?: Board
  period?: FamePeriod
}

export const Route = createFileRoute('/_site/leaderboard')({
  validateSearch: (raw: Record<string, unknown>): LeaderboardSearch => ({
    board: raw.board === 'fame' ? 'fame' : undefined,
    period: raw.period === 'month' ? 'month' : undefined,
  }),
  head: () => ({ meta: [{ title: 'Leaderboard · HookDrill' }] }),
  component: Leaderboard,
})

function Leaderboard() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const board: Board = search.board ?? 'rating'
  const period: FamePeriod = search.period ?? 'all'

  const update = (patch: Partial<LeaderboardSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    })

  return (
    <>
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
            <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
              Rating measures skill: points from solving problems and contests.
              Fame rewards showing up: daily check-ins and today’s problem.
            </p>
          </div>
          {board === 'rating' && (
            <SampleNote>Sample data until server grading opens</SampleNote>
          )}
        </div>

        <Tabs
          value={board}
          onValueChange={(v) =>
            update({ board: v === 'fame' ? 'fame' : undefined })
          }
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="rating" className="px-4">
              Rating
            </TabsTrigger>
            <TabsTrigger value="fame" className="px-4">
              Fame
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {board === 'fame' ? (
            <FameTable
              period={period}
              onPeriodChange={(p) =>
                update({ period: p === 'month' ? 'month' : undefined })
              }
            />
          ) : (
            <RatingTable />
          )}
          <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
            <YourPosition board={board} />
            {board === 'fame' ? <FameRules /> : <TierLegend />}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

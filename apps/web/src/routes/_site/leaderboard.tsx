import { createFileRoute } from '@tanstack/react-router'
import { SiteFooter } from '@/components/site-footer'
import { RatingTable } from '@/components/leaderboard/rating-table'
import { SampleNote } from '@/components/leaderboard/sample-note'
import { TierLegend, YourPosition } from '@/components/leaderboard/side-cards'

export const Route = createFileRoute('/_site/leaderboard')({
  head: () => ({ meta: [{ title: 'Leaderboard · HookDrill' }] }),
  component: Leaderboard,
})

function Leaderboard() {
  return (
    <>
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Contest ratings by handle. Ratings arrive with rated contests; this table shows how it will look.
            </p>
          </div>
          <SampleNote>Sample data, not real players</SampleNote>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <RatingTable />
          <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
            <YourPosition />
            <TierLegend />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

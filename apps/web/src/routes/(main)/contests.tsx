import { createFileRoute } from '@tanstack/react-router'
import { ContestHero, UpcomingCard } from '@/components/contests/contest-hero'
import { PastContests } from '@/components/contests/past-contests'
import { ContestRatingCard } from '@/components/contests/rating-card'
import { SiteFooter } from '@/components/site-footer'
import { pastContests, upcomingContests } from '@/lib/sample-data'

export const Route = createFileRoute('/(main)/contests')({
  head: () => ({ meta: [{ title: 'Contests · HookDrill' }] }),
  component: Contests,
})

function Contests() {
  const [next, ...later] = upcomingContests

  return (
    <>
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Contests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Timed rounds of React problems, graded by hidden tests. The schedule
            below is a preview.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            {next && <ContestHero contest={next} />}
            {later.map((c) => (
              <UpcomingCard key={c.id} contest={c} />
            ))}
            <div className="mt-2">
              <PastContests contests={pastContests} />
            </div>
          </div>
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ContestRatingCard />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

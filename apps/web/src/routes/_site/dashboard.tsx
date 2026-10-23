import { Link, createFileRoute } from '@tanstack/react-router'
import { ListTodo } from 'lucide-react'
import { ActivityPanel } from '@/components/dashboard/activity-panel'
import { ContinueCard } from '@/components/dashboard/continue-card'
import { Panel } from '@/components/dashboard/panel'
import { ProgressList } from '@/components/dashboard/progress-list'
import { SignInPrompt } from '@/components/dashboard/sign-in-prompt'
import {
  TodaysProblem,
  TopThisWeek,
  UpcomingContests,
} from '@/components/dashboard/side-cards'
import { SolvedPanel } from '@/components/dashboard/solved-panel'
import { resolveRows, summarize } from '@/components/dashboard/stats'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyProgress } from '@/lib/progress'

export const Route = createFileRoute('/_site/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard · HookDrill' }] }),
  component: Dashboard,
})

function greeting(now = new Date()) {
  const h = now.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function Dashboard() {
  const { session, signedIn, isLoading, rows, status } = useMyProgress()

  if (isLoading) return <DashboardSkeleton />
  if (!signedIn || !session)
    return (
      <SignInPrompt
        title="Sign in to see your dashboard"
        body="Your dashboard tracks the problems you have started, your last test runs and your streak. Browsing problems works without an account."
      />
    )

  const resolved = resolveRows(rows)
  const summary = summarize(rows)
  const firstName = session.user.name?.split(' ')[0] || 'there'

  return (
    <>
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {resolved.length === 0
                ? 'Nothing started yet. Pick a problem and run the tests.'
                : `${summary.solved} solved, ${summary.attempted} in progress. Solves count public tests until server grading ships.`}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/problems">
              <ListTodo />
              Browse problems
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <ContinueCard rows={resolved} />
              <SolvedPanel rows={rows} />
            </div>
            <ActivityPanel rows={rows} />
            <Panel
              title="Recent activity"
              action={
                resolved.length > 0 && (
                  <Link
                    to="/profile"
                    className="rounded-sm text-xs font-medium text-brand underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    All progress
                  </Link>
                )
              }
            >
              {resolved.length > 0 ? (
                <ProgressList rows={resolved.slice(0, 8)} />
              ) : (
                <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  Your runs show up here, one row per problem, with the last
                  test strip.
                </p>
              )}
            </Panel>
          </div>
          <aside className="flex min-w-0 flex-col gap-5">
            <TodaysProblem status={status} />
            <UpcomingContests />
            <TopThisWeek />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function DashboardSkeleton() {
  return (
    <main
      aria-busy
      className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8"
    >
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <Skeleton className="h-56 rounded-lg" />
            <Skeleton className="h-56 rounded-lg" />
          </div>
          <Skeleton className="h-52 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-60 rounded-lg" />
        </div>
      </div>
    </main>
  )
}

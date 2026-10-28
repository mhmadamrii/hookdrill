import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ActivityPanel } from '@/components/dashboard/activity-panel'
import { Panel } from '@/components/dashboard/panel'
import { ProgressList } from '@/components/dashboard/progress-list'
import { SignInPrompt } from '@/components/dashboard/sign-in-prompt'
import { SolvedPanel } from '@/components/dashboard/solved-panel'
import { isSolved, resolveRows } from '@/components/dashboard/stats'
import { ProfileCard } from '@/components/profile/profile-card'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMyProgress } from '@/lib/progress'

export const Route = createFileRoute('/(main)/profile')({
  head: () => ({ meta: [{ title: 'Your profile · HookDrill' }] }),
  component: Profile,
})

type Filter = 'all' | 'solved' | 'attempted'

function Profile() {
  const { session, signedIn, isLoading, rows } = useMyProgress()
  const [filter, setFilter] = useState<Filter>('all')

  if (isLoading) return <ProfileSkeleton />
  if (!signedIn || !session)
    return (
      <SignInPrompt
        title="Sign in to see your profile"
        body="Your profile shows what you have solved, your activity and every problem you have started."
      />
    )

  const resolved = resolveRows(rows)
  const shown = resolved.filter((r) =>
    filter === 'all' ? true : filter === 'solved' ? isSolved(r) : !isSolved(r),
  )
  const solvedCount = resolved.filter(isSolved).length

  return (
    <>
      <main className="mx-auto grid max-w-[1440px] gap-5 px-4 py-6 md:px-6 md:py-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ProfileCard user={session.user} rows={rows} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <SolvedPanel rows={rows} />
          <ActivityPanel rows={rows} />
          <Panel
            title="Problems"
            action={
              <Tabs
                value={filter}
                onValueChange={(v) => setFilter(v as Filter)}
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">
                    All {resolved.length}
                  </TabsTrigger>
                  <TabsTrigger value="solved" className="text-xs">
                    Solved {solvedCount}
                  </TabsTrigger>
                  <TabsTrigger value="attempted" className="text-xs">
                    In progress {resolved.length - solvedCount}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            }
          >
            {shown.length > 0 ? (
              <ProgressList rows={shown} />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {resolved.length === 0
                    ? 'No problems started yet.'
                    : filter === 'solved'
                      ? 'Nothing solved yet. Pass every public test on a problem to see it here.'
                      : 'Nothing in progress. Every problem you started passes its public tests.'}
                </p>
                {resolved.length === 0 && (
                  <Button asChild size="sm">
                    <Link to="/problems">Browse problems</Link>
                  </Button>
                )}
              </div>
            )}
          </Panel>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function ProfileSkeleton() {
  return (
    <main
      aria-busy
      className="mx-auto grid max-w-[1440px] gap-5 px-4 py-6 md:px-6 md:py-8 lg:grid-cols-[300px_minmax(0,1fr)]"
    >
      <Skeleton className="h-96 rounded-lg" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </main>
  )
}

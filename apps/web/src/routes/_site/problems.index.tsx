import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { Banners } from '@/components/problems/banners'
import {
  CategoryPills,
  Toolbar,
  TopicChips,
} from '@/components/problems/filters'
import { LibrarySidebar } from '@/components/problems/library-sidebar'
import { ProblemTable } from '@/components/problems/problem-table'
import { RightRail } from '@/components/problems/right-rail'
import {
  applyProblemsSearch,
  validateProblemsSearch,
  type ProblemsSearch,
} from '@/components/problems/search'
import { ComingSoon } from '@/components/problems/coming-soon'
import { useAcceptance } from '@/lib/acceptance'
import { playableProblems } from '@/lib/problems'
import { useMyProgress } from '@/lib/progress'

export const Route = createFileRoute('/_site/problems/')({
  validateSearch: validateProblemsSearch,
  head: () => ({ meta: [{ title: 'Problems · HookDrill' }] }),
  component: Problems,
})

function Problems() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const progress = useMyProgress()
  const acceptance = useAcceptance()

  const update = (patch: Partial<ProblemsSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    })

  const rows = useMemo(
    () =>
      applyProblemsSearch(
        playableProblems,
        search,
        progress.status,
        acceptance.rateOf,
      ),
    // progress.rows identity changes when the user's results load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, progress.rows, acceptance.isLoading],
  )
  const solved = progress.signedIn
    ? playableProblems.filter((p) => progress.status(p.slug) === 'solved')
        .length
    : 0

  const clearAll = () =>
    navigate({
      search: { sort: search.sort },
      replace: true,
      resetScroll: false,
    })

  return (
    <>
      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[208px_minmax(0,1fr)] xl:grid-cols-[208px_minmax(0,1fr)_300px]">
        <aside className="max-lg:hidden">
          <LibrarySidebar />
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <h1 className="sr-only">Problems</h1>
          <Banners />

          <div className="flex flex-col gap-4 border-t pt-5">
            <TopicChips
              active={search.tag}
              onSelect={(tag) => update({ tag })}
            />
            <CategoryPills track={search.track} update={update} />
            <Toolbar
              search={search}
              update={update}
              solved={solved}
              progressLoading={progress.isLoading}
            />
          </div>

          <div>
            <ProblemTable
              rows={rows}
              statusOf={progress.status}
              rateOf={acceptance.rateOf}
              statusLoading={progress.isLoading && progress.signedIn}
              onClear={clearAll}
            />
          </div>
          <div>
            <ComingSoon />
          </div>
        </div>

        <aside
          className="lg:col-start-2 xl:col-start-3 xl:row-start-1"
          aria-label="Daily problem and progress"
        >
          <RightRail onSelectTopic={(tag) => update({ tag })} />
        </aside>
      </main>
      <SiteFooter />
    </>
  )
}

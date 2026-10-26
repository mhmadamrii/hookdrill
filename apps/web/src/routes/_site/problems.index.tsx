import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { LibrarySidebar } from '@/components/problems/library-sidebar'
import { ProblemTable } from '@/components/problems/problem-table'
import { RightRail } from '@/components/problems/right-rail'
import { ComingSoon } from '@/components/problems/coming-soon'
import { Button } from '@/components/ui/button'
import { useAcceptance } from '@/lib/acceptance'
import { useFavorites } from '@/lib/favorites'
import { playableProblems } from '@/lib/problems'
import { useMyProgress } from '@/lib/progress'
import { Banners } from '@/components/problems/banners'
import {
  CategoryPills,
  Toolbar,
  TopicChips,
} from '@/components/problems/filters'
import {
  applyProblemsSearch,
  validateProblemsSearch,
  type ProblemsSearch,
} from '@/components/problems/search'

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
  const favorites = useFavorites()

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
        favorites.has,
      ),
    // progress.rows identity changes when the user's results load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, progress.rows, acceptance.isLoading, favorites.has],
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

          {search.list === 'favorite' && (
            <div className="flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Star className="size-[18px] fill-current text-medium" />
                Favorite
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => update({ list: undefined })}
              >
                Show all problems
              </Button>
            </div>
          )}

          <div>
            <ProblemTable
              rows={rows}
              statusOf={progress.status}
              rateOf={acceptance.rateOf}
              statusLoading={progress.isLoading && progress.signedIn}
              isFavorite={favorites.has}
              onToggleFavorite={favorites.toggle}
              onClear={clearAll}
              empty={
                search.list === 'favorite' && favorites.slugs.length === 0 ? (
                  <NoFavorites onBrowse={clearAll} />
                ) : undefined
              }
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

function NoFavorites({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-secondary">
        <Star className="size-5 text-medium" />
      </span>
      <h3 className="mt-4 font-semibold">No favorites yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Star a problem from the list or its description to come back to it
        later. Your list is saved in this browser.
      </p>
      <Button variant="secondary" className="mt-5" onClick={onBrowse}>
        Browse problems
      </Button>
    </div>
  )
}

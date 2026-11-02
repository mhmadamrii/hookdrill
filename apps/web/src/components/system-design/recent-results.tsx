import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { BookOpen, CheckCircle2, ClipboardList, XCircle } from 'lucide-react'
import { findItem, type LevelCourse } from '@hookdrill/courses'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/lib/trpc'

const when = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })
const panel = 'rounded-lg border bg-card'
const panelHead =
  'flex h-12 items-center justify-between gap-3 border-b px-4 text-sm font-semibold'

/** Graded challenges and the weak areas they reveal, with lessons to fix them. */
export function RecentResults({
  course,
  signedIn,
}: {
  course: LevelCourse
  signedIn: boolean
}) {
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.design.overview.queryOptions({ course: course.slug }),
    enabled: signedIn,
  })
  const results = query.data?.results ?? []
  const weak = query.data?.weakAreas ?? []

  return (
    <>
      <section aria-labelledby="results-h" className={panel}>
        <h2 id="results-h" className={panelHead}>
          Recent assessment results
        </h2>
        {signedIn && query.isPending ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-secondary">
              <ClipboardList className="size-5 text-muted-foreground" />
            </span>
            <p className="mt-3 text-sm font-medium">No results yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {signedIn
                ? 'Scores and feedback from your design challenges will appear here, criterion by criterion.'
                : 'Sign in to keep your scores and feedback.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {results.map((r) => (
              <li key={r.challenge}>
                <Link
                  to="/courses/$course/challenge/$slug/result"
                  params={{ course: course.slug, slug: r.challenge }}
                  className="flex items-center gap-3 px-4 py-3 text-sm outline-none transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
                >
                  {r.passed ? (
                    <CheckCircle2
                      aria-label="Passed"
                      className="size-4 shrink-0 text-accepted"
                    />
                  ) : (
                    <XCircle
                      aria-label="Not passed"
                      className="size-4 shrink-0 text-hard"
                    />
                  )}
                  <span className="flex-1 font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {when.format(new Date(r.evaluatedAt))}
                  </span>
                  <span className="w-14 text-right font-semibold tabular-nums">
                    {r.score}/100
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {weak.length > 0 && (
        <section aria-labelledby="weak-h" className={panel}>
          <h2 id="weak-h" className={panelHead}>
            Areas to strengthen
            <span className="text-xs font-normal text-muted-foreground">
              Average across your graded challenges
            </span>
          </h2>
          <ul className="divide-y">
            {weak.map((w) => (
              <li key={w.criterion} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">{w.title}</p>
                  <span className="text-sm tabular-nums text-medium">
                    {w.average}/100
                  </span>
                </div>
                {w.lessons.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="text-xs text-muted-foreground">
                      Revisit
                    </span>
                    {w.lessons.map((slug) => {
                      const item = findItem(course, slug)?.item
                      return item ? (
                        <Link
                          key={slug}
                          to="/courses/$course/$lesson"
                          params={{ course: course.slug, lesson: slug }}
                          className="inline-flex items-center gap-1.5 hover:text-brand"
                        >
                          <BookOpen className="size-3.5 text-muted-foreground" />
                          {item.title}
                        </Link>
                      ) : null
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

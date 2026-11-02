import {
  Link,
  Outlet,
  createFileRoute,
  useParams,
} from '@tanstack/react-router'
import { ListTree } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  courseBySlug,
  type LevelCourse,
  type ModuleCourse,
} from '@hookdrill/courses'
import { CourseProgressBar, SyllabusNav } from '@/components/courses/syllabus'
import { LevelOutlineNav } from '@/components/system-design/outline'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCourseProgress, useLevelProgress } from '@/lib/courses'

/** Lessons, exams and challenges: the course outline sits beside them. */
export const Route = createFileRoute('/(main)/(course)')({
  component: CourseLayout,
})

function CourseLayout() {
  const { course: slug } = useParams({ strict: false })
  const course = slug ? courseBySlug(slug) : undefined
  // Unknown or unpublished courses fall through to the child's not-found.
  if (!course || course.status !== 'available') return <Outlet />
  return course.format === 'modules' ? (
    <ModuleOutline course={course} />
  ) : (
    <LevelOutline course={course} />
  )
}

function ModuleOutline({ course }: { course: ModuleCourse }) {
  const progress = useCourseProgress(course)
  return (
    <Shell
      title={course.title}
      slug={course.slug}
      done={progress.signedIn ? progress.done : null}
      total={progress.total}
      nav={(close) => (
        <SyllabusNav
          courseSlug={course.slug}
          progress={progress}
          onNavigate={close}
        />
      )}
    />
  )
}

function LevelOutline({ course }: { course: LevelCourse }) {
  const progress = useLevelProgress(course)
  return (
    <Shell
      title={course.title}
      slug={course.slug}
      done={progress.signedIn ? progress.done : null}
      total={progress.total}
      nav={(close) => (
        <LevelOutlineNav
          courseSlug={course.slug}
          progress={progress}
          onNavigate={close}
        />
      )}
    />
  )
}

/** Outline in a sticky column on desktop, in a drawer on small screens. */
function Shell({
  title,
  slug,
  done,
  total,
  nav,
}: {
  title: string
  slug: string
  /** Null when signed out: no progress to show. */
  done: number | null
  total: number
  nav: (close?: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-6 md:px-6 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="max-lg:hidden">
          <div className="sticky top-[4.5rem] flex max-h-[calc(100dvh-5.5rem)] flex-col gap-5 overflow-y-auto pb-4">
            <div className="px-2.5">
              <Link
                to="/courses/$course"
                params={{ course: slug }}
                className="font-semibold hover:text-brand"
              >
                {title}
              </Link>
              {done !== null && (
                <CourseProgressBar className="mt-2" done={done} total={total} />
              )}
            </div>
            {nav()}
          </div>
        </aside>
        <div className="min-w-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="mb-4 lg:hidden">
                <ListTree /> Course outline
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription>
                  Lessons, exams and challenges
                </SheetDescription>
              </SheetHeader>
              <div className="px-2 pb-6">{nav(() => setOpen(false))}</div>
            </SheetContent>
          </Sheet>
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

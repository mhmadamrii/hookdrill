import {
  Link,
  Outlet,
  createFileRoute,
  useParams,
} from '@tanstack/react-router'
import { ListTree } from 'lucide-react'
import { useState } from 'react'
import { courseBySlug, type Course } from '@hookdrill/courses'
import { CourseProgressBar, SyllabusNav } from '@/components/courses/syllabus'
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
import { useCourseProgress } from '@/lib/courses'

/** Lessons and exams: the course outline sits beside the content. */
export const Route = createFileRoute('/(main)/(course)')({
  component: CourseLayout,
})

function CourseLayout() {
  const { course: slug } = useParams({ strict: false })
  const course = slug ? courseBySlug(slug) : undefined
  // Unknown or unpublished courses fall through to the child's not-found.
  if (!course || course.status !== 'available') return <Outlet />
  return <WithOutline course={course} />
}

function WithOutline({ course }: { course: Course }) {
  const progress = useCourseProgress(course)
  const [open, setOpen] = useState(false)
  const header = (
    <div className="px-2.5">
      <Link
        to="/courses/$course"
        params={{ course: course.slug }}
        className="font-semibold hover:text-brand"
      >
        {course.title}
      </Link>
      {progress.signedIn && (
        <CourseProgressBar
          className="mt-2"
          done={progress.done}
          total={progress.total}
        />
      )}
    </div>
  )
  return (
    <>
      <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-6 md:px-6 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="max-lg:hidden">
          <div className="sticky top-[4.5rem] flex max-h-[calc(100dvh-5.5rem)] flex-col gap-5 overflow-y-auto pb-4">
            {header}
            <SyllabusNav courseSlug={course.slug} progress={progress} />
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
                <SheetTitle>{course.title}</SheetTitle>
                <SheetDescription>Lessons and exams</SheetDescription>
              </SheetHeader>
              <div className="px-2 pb-6">
                <SyllabusNav
                  courseSlug={course.slug}
                  progress={progress}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

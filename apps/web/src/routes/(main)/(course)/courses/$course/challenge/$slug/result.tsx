import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  courseBySlug,
  findItem,
  loadChallenge,
  type LevelCourse,
} from '@hookdrill/courses'
import { ResultView } from '@/components/system-design/result-view'

export const Route = createFileRoute(
  '/(main)/(course)/courses/$course/challenge/$slug/result',
)({
  loader: async ({ params }) => {
    const course = courseBySlug(params.course)
    if (course?.format !== 'levels' || course.status !== 'available')
      throw notFound()
    const found = findItem(course, params.slug)
    const challenge =
      found?.item.kind === 'challenge'
        ? await loadChallenge(course, params.slug)
        : null
    if (!found || !challenge) throw notFound()
    return { title: found.item.title, course: course.title, challenge }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `Result: ${loaderData.title} · ${loaderData.course} · HookDrill`,
          },
        ]
      : [],
  }),
  component: ResultPage,
})

function ResultPage() {
  const { challenge } = Route.useLoaderData()
  const params = Route.useParams()
  return (
    <ResultView
      course={courseBySlug(params.course) as LevelCourse}
      slug={params.slug}
      challenge={challenge}
    />
  )
}

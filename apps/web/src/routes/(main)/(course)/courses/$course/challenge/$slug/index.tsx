import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  courseBySlug,
  findItem,
  loadChallenge,
  type LevelCourse,
} from '@hookdrill/courses'
import { ChallengeView } from '@/components/system-design/challenge-view'

export const Route = createFileRoute(
  '/(main)/(course)/courses/$course/challenge/$slug/',
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
      ? [{ title: `${loaderData.title} · ${loaderData.course} · HookDrill` }]
      : [],
  }),
  component: ChallengePage,
})

function ChallengePage() {
  const { challenge } = Route.useLoaderData()
  const params = Route.useParams()
  return (
    <ChallengeView
      course={courseBySlug(params.course) as LevelCourse}
      slug={params.slug}
      challenge={challenge}
    />
  )
}

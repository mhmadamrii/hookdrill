import { createFileRoute, redirect } from '@tanstack/react-router'

/** Explore and its study plans became Courses. Old links land there. */
export const Route = createFileRoute('/(main)/explore')({
  beforeLoad: () => {
    throw redirect({ to: '/courses', statusCode: 301 })
  },
})

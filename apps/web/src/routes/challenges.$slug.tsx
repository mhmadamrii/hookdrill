import { createFileRoute, redirect } from '@tanstack/react-router'

// Old URL from the spike; problems now live under /problems.
export const Route = createFileRoute('/challenges/$slug')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/problems/$slug', params, statusCode: 301 })
  },
})

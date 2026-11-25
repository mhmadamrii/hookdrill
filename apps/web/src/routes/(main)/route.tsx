import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/site-header'

/** Every page except the problem workspace shares the site header. */
export const Route = createFileRoute('/(main)')({
  component: () => (
    <>
      <SiteHeader />
      <Outlet />
    </>
  ),
})

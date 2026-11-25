import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/site-header'

/** Every page except the problem workspace shares the site header. */
export const Route = createFileRoute('/(main)')({
  component: () => (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <Outlet />
    </div>
  ),
})

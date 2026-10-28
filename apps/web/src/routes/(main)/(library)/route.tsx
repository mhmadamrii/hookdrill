import { Outlet, createFileRoute } from '@tanstack/react-router'
import { LibrarySidebar } from '@/components/problems/library-sidebar'
import { SiteFooter } from '@/components/site-footer'

/** Pages reached from the library sidebar share it in a left column. */
export const Route = createFileRoute('/(main)/(library)')({
  component: () => (
    <>
      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[208px_minmax(0,1fr)]">
        <aside className="max-lg:hidden">
          <LibrarySidebar />
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </>
  ),
})

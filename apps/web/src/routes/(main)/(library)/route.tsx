import { Outlet, createFileRoute } from '@tanstack/react-router'
import { LibrarySidebar } from '@/components/problems/library-sidebar'
import { SiteFooter } from '@/components/site-footer'

/** Pages reached from the library sidebar share it in a left column. */
export const Route = createFileRoute('/(main)/(library)')({
  component: () => (
    // 3.5rem is the site header; the column keeps the footer at the bottom on short pages.
    <div className="flex min-h-[calc(100svh-3.5rem)] flex-col">
      <main className="mx-auto grid w-full max-w-[1440px] flex-1 content-start gap-6 px-4 pt-6 pb-12 md:px-6 md:pb-16 lg:grid-cols-[208px_minmax(0,1fr)]">
        <aside className="max-lg:hidden">
          <LibrarySidebar />
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
})

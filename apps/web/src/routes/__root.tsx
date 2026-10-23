import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { UserMenu } from '@/components/user-menu'
import { ApiProvider } from '@/lib/trpc'

import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HookDrill' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ApiProvider>
          <header className="flex h-14 items-center gap-6 bg-cover px-5 text-on-cover">
            <Link to="/" className="text-lg font-extrabold tracking-tight">
              HookDrill
            </Link>
            <nav className="flex gap-4 text-sm text-on-cover-2">
              <Link
                to="/"
                className="hover:text-on-cover [&.active]:text-on-cover"
              >
                Book I · React
              </Link>
            </nav>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </header>
          {children}
        </ApiProvider>
        <Scripts />
      </body>
    </html>
  )
}

import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider, themeScript } from '@/lib/theme'
import { ApiProvider } from '@/lib/trpc'

import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HookDrill · Practice UI by hand' },
      {
        name: 'description',
        content:
          'Build real React components without AI, verified by hidden tests. Problems, contests and rankings for developers who want to stay sharp.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // The theme class is set by the inline script before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <ApiProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </ApiProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center px-6">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page doesn't exist</h1>
      <p className="mt-3 text-muted-foreground">
        The problem or page you're looking for may have moved, or it hasn't been written yet.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link to="/problems">Browse problems</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Home</Link>
        </Button>
      </div>
    </main>
  )
}

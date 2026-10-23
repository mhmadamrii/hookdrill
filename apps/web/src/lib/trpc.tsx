import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { AppRouter } from '@hookdrill/api'
import superjson from 'superjson'
import { API_URL } from './env'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
}

let browserQueryClient: QueryClient | undefined

// A new client per server render, one shared client in the browser.
function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  return (browserQueryClient ??= makeQueryClient())
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
          transformer: superjson,
          fetch: (url, options) =>
            fetch(url, { ...options, credentials: 'include' }),
        }),
      ],
    }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

import { useRef } from 'react'
import { createAuthClient } from 'better-auth/react'
import { API_URL } from './env'

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: 'include' },
})

export const { useSession, signIn, signOut } = authClient

/**
 * The session, pending only until the first answer. Better Auth refetches when
 * the tab regains focus, which flips `isPending` back on; pages that unmount
 * their content while pending (the workspace) would lose unsaved code and any
 * test run in flight. This keeps the last settled session during refetches.
 */
export function useSettledSession() {
  const { data, isPending } = useSession()
  const settled = useRef<{ session: typeof data } | null>(null)
  if (!isPending) settled.current = { session: data }
  return {
    session: settled.current?.session ?? null,
    isPending: settled.current === null,
  }
}

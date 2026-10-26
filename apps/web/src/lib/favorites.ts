import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'hookdrill:favorites'
const EMPTY: readonly string[] = []

// Starred problem slugs, kept in this browser only. The cached array keeps
// useSyncExternalStore snapshots stable between reads.
let cache: readonly string[] | null = null
const listeners = new Set<() => void>()

function read(): readonly string[] {
  if (cache) return cache
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    cache = Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === 'string')
      : []
  } catch {
    cache = []
  }
  return cache
}

function write(next: readonly string[]) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Private mode or full storage: the star still works for this visit.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep other tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    cache = null
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useFavorites() {
  const slugs = useSyncExternalStore(subscribe, read, () => EMPTY)
  const has = useCallback((slug: string) => slugs.includes(slug), [slugs])
  const toggle = useCallback((slug: string) => {
    const current = read()
    write(
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug],
    )
  }, [])
  return { slugs, has, toggle }
}

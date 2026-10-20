import type { Challenge, ChallengeMeta, FileMap } from './types'
import { meta as todoList } from './react/todo-list/meta'

export type * from './types'

// Metadata is small and loaded eagerly. Content is loaded on demand, so each
// challenge ends up in its own chunk instead of the main bundle.
const registry: Record<
  string,
  { meta: ChallengeMeta; load: () => Promise<{ default: Challenge }> }
> = {
  [todoList.slug]: { meta: todoList, load: () => import('./react/todo-list') },
}

// Reference solutions exist only in dev builds. The literal condition lets the
// production build drop these imports entirely.
const solutions: Record<string, () => Promise<{ default: FileMap }>> =
  import.meta.env.DEV
    ? { [todoList.slug]: () => import('./react/todo-list/solution') }
    : {}

export function listChallenges(): ChallengeMeta[] {
  return Object.values(registry).map((entry) => entry.meta)
}

export async function getChallenge(
  slug: string,
): Promise<Challenge | undefined> {
  const entry = registry[slug]
  return entry && (await entry.load()).default
}

/** Dev only: always resolves to undefined in production builds. */
export async function getSolutionFiles(
  slug: string,
): Promise<FileMap | undefined> {
  const load = solutions[slug]
  return load && (await load()).default
}

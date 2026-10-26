import type { Challenge, ChallengeMeta, FileMap } from './types'
import { catalog } from './catalog'

export type * from './types'

// Metadata is small and loaded eagerly. Content is loaded on demand, so each
// challenge ends up in its own chunk instead of the main bundle.
const loaders: Record<string, () => Promise<{ default: Challenge }>> = {
  'todo-list': () => import('./react/todo-list'),
  'playlist-builder': () => import('./react/playlist-builder'),
  accordion: () => import('./react/accordion'),
  'star-rating': () => import('./react/star-rating'),
  'counter-with-undo': () => import('./react/counter-with-undo'),
  'password-strength-meter': () => import('./react/password-strength-meter'),
  // challenge:new loaders
}

// Reference solutions exist only in dev builds. The literal condition lets the
// production build drop these imports entirely.
const solutions: Record<string, () => Promise<{ default: FileMap }>> =
  import.meta.env.DEV
    ? {
        'todo-list': () => import('./react/todo-list/solution'),
        'playlist-builder': () => import('./react/playlist-builder/solution'),
        accordion: () => import('./react/accordion/solution'),
        'star-rating': () => import('./react/star-rating/solution'),
        'counter-with-undo': () => import('./react/counter-with-undo/solution'),
        'password-strength-meter': () =>
          import('./react/password-strength-meter/solution'),
        // challenge:new solutions
      }
    : {}

export function listChallenges(): ChallengeMeta[] {
  return catalog
}

export async function getChallenge(
  slug: string,
): Promise<Challenge | undefined> {
  const load = loaders[slug]
  return load && (await load()).default
}

/** Dev only: always resolves to undefined in production builds. */
export async function getSolutionFiles(
  slug: string,
): Promise<FileMap | undefined> {
  const load = solutions[slug]
  return load && (await load()).default
}

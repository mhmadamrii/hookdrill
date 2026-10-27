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
  'shopping-cart': () => import('./react/shopping-cart'),
  'countdown-timer': () => import('./react/countdown-timer'),
  'tabs-with-roving-focus': () => import('./react/tabs-with-roving-focus'),
  'sortable-data-table': () => import('./react/sortable-data-table'),
  'multi-step-form': () => import('./react/multi-step-form'),
  'modal-focus-trap': () => import('./react/modal-focus-trap'),
  'autocomplete-combobox': () => import('./react/autocomplete-combobox'),
  'virtualized-list': () => import('./react/virtualized-list'),
  'debounced-search': () => import('./react/debounced-search'),
  'toast-queue': () => import('./react/toast-queue'),
  'file-explorer-tree': () => import('./react/file-explorer-tree'),
  'infinite-feed': () => import('./react/infinite-feed'),
  'kanban-board': () => import('./react/kanban-board'),
  'date-range-picker': () => import('./react/date-range-picker'),
  'product-sort': () => import('./react/product-sort'),
  'leaderboard-ranking': () => import('./react/leaderboard-ranking'),
  'natural-sort-file-list': () => import('./react/natural-sort-file-list'),
  'multi-column-sort': () => import('./react/multi-column-sort'),
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
        'shopping-cart': () => import('./react/shopping-cart/solution'),
        'countdown-timer': () => import('./react/countdown-timer/solution'),
        'tabs-with-roving-focus': () =>
          import('./react/tabs-with-roving-focus/solution'),
        'sortable-data-table': () =>
          import('./react/sortable-data-table/solution'),
        'multi-step-form': () => import('./react/multi-step-form/solution'),
        'modal-focus-trap': () => import('./react/modal-focus-trap/solution'),
        'autocomplete-combobox': () =>
          import('./react/autocomplete-combobox/solution'),
        'virtualized-list': () => import('./react/virtualized-list/solution'),
        'debounced-search': () => import('./react/debounced-search/solution'),
        'toast-queue': () => import('./react/toast-queue/solution'),
        'file-explorer-tree': () =>
          import('./react/file-explorer-tree/solution'),
        'infinite-feed': () => import('./react/infinite-feed/solution'),
        'kanban-board': () => import('./react/kanban-board/solution'),
        'date-range-picker': () => import('./react/date-range-picker/solution'),
        'product-sort': () => import('./react/product-sort/solution'),
        'leaderboard-ranking': () =>
          import('./react/leaderboard-ranking/solution'),
        'natural-sort-file-list': () =>
          import('./react/natural-sort-file-list/solution'),
        'multi-column-sort': () => import('./react/multi-column-sort/solution'),
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

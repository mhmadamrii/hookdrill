// `pnpm challenge:new` inserts new challenges above the anchor comments below.
import type { ChallengeMeta } from './types'
import { meta as todoList } from './react/todo-list/meta'
import { meta as playlistBuilder } from './react/playlist-builder/meta'
// challenge:new imports

export type * from './types'

/**
 * Challenge metadata only, in book order. Safe to import outside Vite
 * (API, DB sync script), unlike the registry, which loads content with `?raw`.
 */
export const catalog: ChallengeMeta[] = [
  todoList,
  playlistBuilder,
  // challenge:new catalog
]

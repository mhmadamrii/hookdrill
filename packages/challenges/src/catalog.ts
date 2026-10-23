import type { ChallengeMeta } from './types'

export type * from './types'
import { meta as todoList } from './react/todo-list/meta'
import { meta as playlistBuilder } from './react/playlist-builder/meta'

/**
 * Challenge metadata only, in book order. Safe to import outside Vite
 * (API, DB sync script), unlike the registry, which loads content with `?raw`.
 */
export const catalog: ChallengeMeta[] = [todoList, playlistBuilder]

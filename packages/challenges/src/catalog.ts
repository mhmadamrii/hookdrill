// `pnpm challenge:new` inserts new challenges above the anchor comments below.
import type { ChallengeMeta } from './types'
import { meta as todoList } from './react/todo-list/meta'
import { meta as playlistBuilder } from './react/playlist-builder/meta'
import { meta as accordion } from './react/accordion/meta'
import { meta as starRating } from './react/star-rating/meta'
import { meta as counterWithUndo } from './react/counter-with-undo/meta'
import { meta as passwordStrengthMeter } from './react/password-strength-meter/meta'
import { meta as shoppingCart } from './react/shopping-cart/meta'
import { meta as countdownTimer } from './react/countdown-timer/meta'
// challenge:new imports

export type * from './types'

/**
 * Challenge metadata only, in book order. Safe to import outside Vite
 * (API, DB sync script), unlike the registry, which loads content with `?raw`.
 */
export const catalog: ChallengeMeta[] = [
  todoList,
  playlistBuilder,
  accordion,
  starRating,
  counterWithUndo,
  passwordStrengthMeter,
  shoppingCart,
  countdownTimer,
  // challenge:new catalog
]

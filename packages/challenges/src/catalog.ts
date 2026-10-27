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
import { meta as tabsWithRovingFocus } from './react/tabs-with-roving-focus/meta'
import { meta as sortableDataTable } from './react/sortable-data-table/meta'
import { meta as multiStepForm } from './react/multi-step-form/meta'
import { meta as modalFocusTrap } from './react/modal-focus-trap/meta'
import { meta as autocompleteCombobox } from './react/autocomplete-combobox/meta'
import { meta as virtualizedList } from './react/virtualized-list/meta'
import { meta as debouncedSearch } from './react/debounced-search/meta'
import { meta as toastQueue } from './react/toast-queue/meta'
import { meta as fileExplorerTree } from './react/file-explorer-tree/meta'
import { meta as infiniteFeed } from './react/infinite-feed/meta'
import { meta as kanbanBoard } from './react/kanban-board/meta'
import { meta as dateRangePicker } from './react/date-range-picker/meta'
import { meta as productSort } from './react/product-sort/meta'
import { meta as leaderboardRanking } from './react/leaderboard-ranking/meta'
import { meta as naturalSortFileList } from './react/natural-sort-file-list/meta'
import { meta as multiColumnSort } from './react/multi-column-sort/meta'
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
  tabsWithRovingFocus,
  sortableDataTable,
  multiStepForm,
  modalFocusTrap,
  autocompleteCombobox,
  virtualizedList,
  debouncedSearch,
  toastQueue,
  fileExplorerTree,
  infiniteFeed,
  kanbanBoard,
  dateRangePicker,
  productSort,
  leaderboardRanking,
  naturalSortFileList,
  multiColumnSort,
  // challenge:new catalog
]

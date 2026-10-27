// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep the whole board (columns with their cards) in one piece of state, and write a single pure `moveCard(board, cardId, columnIndex, index)` helper. Drag and drop and every arrow key are just different calls to it.',
  'For drag and drop, store the card id in `dataTransfer.setData` on `dragstart` and read it back on the column’s `drop`. The column’s `onDragOver` must call `e.preventDefault()`, or the browser never fires `drop`. For the keyboard, keep the picked-up card id plus a copy of the board from before the pick-up: Escape just puts that copy back.',
  'A card that changes column is a brand-new element, so it loses focus. Keep a map of card id to button element (a callback `ref`), remember which card just moved in a ref, and call `.focus()` on it in a `useLayoutEffect` after the render. Handle Space and Enter in `onKeyDown` with `preventDefault()` so the button’s click doesn’t also fire.',
]

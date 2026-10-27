// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'The only state you need is `scrollTop`. Update it from the viewport’s `onScroll` with `e.currentTarget.scrollTop`; everything else is computed from it on render.',
  'Compute `first` and `last` with the two formulas in the requirements, then `start = Math.max(0, first - OVERSCAN)` and `end = Math.min(ITEMS.length - 1, last + OVERSCAN)`, and render indexes `start` through `end`.',
  'Make the spacer `position: relative` with `height: ITEMS.length * ROW_HEIGHT`, and give each row `position: absolute; top: index * ROW_HEIGHT`. Key rows by index so React reuses them while scrolling.',
]

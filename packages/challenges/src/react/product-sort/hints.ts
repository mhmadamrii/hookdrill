// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Store only the chosen sort option in state, and compute the sorted list from it on every render. The sorted list itself is not state.',
  'Write one compare function per option: subtract prices (they are numbers, so 999 comes before 10000), subtract ratings the other way round for highest first, and compare `Date.parse(addedAt)` for newest. "featured" needs no sorting at all.',
  'Sort a copy: `[...PRODUCTS].sort(compare)`. `.sort()` works in place, so calling it on `PRODUCTS` would lose the featured order for good. It is also stable, so equal prices or ratings keep their featured order. Format with `(cents / 100).toFixed(2)`.',
]

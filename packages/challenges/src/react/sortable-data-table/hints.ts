// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep the original data untouched. Store only the sort (column and direction, or nothing) and the filter text, then compute the visible rows from them on each render.',
  'Write one compare function per column: `localeCompare` with `{ sensitivity: "base" }` for names, subtraction for ages, and `Date.parse` for dates. Multiply by -1 for descending.',
  'Filter first, then sort a copy: `[...filtered].sort(...)`. `sort` is stable, so ties keep their order. Never call `.sort()` on the imported array itself, because it sorts in place.',
]

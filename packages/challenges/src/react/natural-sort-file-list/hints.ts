// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Store only the sort mode (name or size, and a direction) in state, and compute the sorted list from `FILES` on each render. Sort a copy, never the imported array.',
  'You do not need to split names into digit and text chunks yourself: `Intl.Collator` with `{ numeric: true, sensitivity: "base" }` already compares `file2` before `file10` and ignores case and accents. Create it once, outside the component.',
  'Write one compare function: if the kinds differ, the folder wins; otherwise compare by the mode. For Z to A, negate the name comparison instead of reversing the array, so equal names keep their order. For size, `a.sizeBytes - b.sizeBytes` (negated for largest first), falling back to the name with `||`.',
]

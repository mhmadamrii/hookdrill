// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Store the sort as an ordered list of `{ column, direction }`, empty for the original order. The first entry is the primary column; its index + 1 is each badge. Read `event.shiftKey` in the header click handler to decide between replacing the list and adding to it.',
  'Map each column to a comparable value: a rank number for priority (`{ High: 0, Medium: 1, Low: 2 }`), a timestamp for the due date, the string for the others (compare with `localeCompare` and `{ sensitivity: "base" }`). Let `null` stand for empty.',
  'Compare two rows by walking the list: skip a column when both values are equal, return 1 or -1 when exactly one is `null` **before** applying the direction (so empties stay last), else return the comparison, negated for descending. Sort a copy; `sort` is stable, so full ties keep their order.',
]

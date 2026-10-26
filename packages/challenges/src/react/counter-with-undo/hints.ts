// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep two lists next to the count: `past` (counts you can undo back to) and `future` (counts you can redo).',
  'Every + or − pushes the current count onto `past` and empties `future`.',
  'Undo moves the current count to the front of `future` and pops the last value off `past`. Redo is the mirror image. Disable each button when its list is empty.',
]

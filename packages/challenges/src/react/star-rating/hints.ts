// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep two numbers: the saved `rating` and the `hovered` star (or `null` when nothing is hovered).',
  'The stars show `hovered ?? rating`. A star is filled when its number is less than or equal to that.',
  "Clear on click with `setRating(n === rating ? 0 : n)`, and reset `hovered` in the container's `onMouseLeave`.",
]

// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Store only the cart lines in state: a product (or its id) and a quantity. The item count and the total can be calculated from those on every render.',
  'When adding, check whether the product is already in the cart. If it is, map over the lines and bump that one quantity; otherwise append a new line.',
  'For − , lower the quantity and then filter out lines whose quantity reached 0. Format the total with `(cents / 100).toFixed(2)`.',
]

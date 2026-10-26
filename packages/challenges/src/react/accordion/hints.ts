// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'You only need one piece of state: the id of the open section, or `null` when none is open.',
  'A section is open when `openId === item.id`. Clicking it sets `openId` to its id, or back to `null` if it was already open.',
  "Give the answer element an id like `panel-${item.id}` and use the same string in the button's `aria-controls`.",
]

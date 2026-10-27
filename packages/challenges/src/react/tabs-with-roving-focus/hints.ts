// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Store only the selected tab id. `aria-selected`, `tabIndex` and the panel content all derive from it. Build the ids from the tab id, e.g. `tab-specs` and `panel-specs`.',
  'Handle `onKeyDown` once on the tablist. Work with the list of enabled tabs only, so skipping disabled ones comes for free, and use modulo to wrap: `(i + 1) % length`.',
  'Keyboard moves must also move focus. Keep a ref to every tab button (a `Map` from id to element works) and call `.focus()` on the newly selected one.',
]

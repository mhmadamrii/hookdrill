// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Use a `useEffect` on `open`: when it becomes true, focus the input; when it goes back to false (and was open before), focus the opener through a ref.',
  'Trap Tab in an `onKeyDown` on the dialog: collect its focusable elements, and if Tab is pressed on the last one (or Shift+Tab on the first), `preventDefault()` and focus the other end yourself.',
  'Close on the backdrop only when `e.target === e.currentTarget`, so clicks inside the dialog do not count. Render the dialog as a sibling of `page`, and put `inert` on `page` while open.',
]

// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep one array of every toast, oldest first. The visible toasts are its first 3 and the queue is the rest, so dismissing one automatically promotes the next.',
  'Give each toast its own component that owns its timer. Start the timer in a `useEffect` on mount, which is exactly when the toast becomes visible, and clear it in the cleanup.',
  'For pausing, keep the time left and the moment the timer started in `useRef`s. On `mouseenter`, clear the timeout and subtract `Date.now() - startedAt` from the time left; on `mouseleave`, start a new timeout with what is left.',
]

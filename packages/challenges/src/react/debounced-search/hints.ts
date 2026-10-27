// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Debouncing means: on every change, cancel the timer from the previous keystroke and start a new one. Only the timer that survives a full `DEBOUNCE_MS` calls `search`.',
  'Keep the timer id in a `useRef` so you can `clearTimeout` it on the next change, when the input is emptied, and in a `useEffect` cleanup on unmount. Keep a status (`idle`, `loading`, `done`, `error`) next to the results.',
  'To drop stale answers, bump a counter in another `useRef` on every change and capture its value when the search starts. When the promise settles, ignore it unless the captured number is still the latest.',
]

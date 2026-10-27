// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep the posts, a status (`loading`, `idle`, `error`, `end`) and the cursor of the next page in state. One `load(cursor)` function can serve the first page, **Load more** and **Retry**.',
  'State updates are not instant, so guard against a second request with a `useRef` flag that is set before calling `fetchPage` and cleared when it settles. Only move the cursor forward when a page succeeds: then Retry just calls `load(cursor)` again.',
  'Dedupe inside a functional update: `setPosts(prev => { const seen = new Set(prev.map(p => p.id)); ... })`. Set a `mounted` ref to `true` in the mount effect and `false` in its cleanup, and return early from the `.then` callbacks when it is `false`.',
]

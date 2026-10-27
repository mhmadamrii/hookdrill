// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep one "active" date in state: it is the day with `tabIndex={0}`, and its month is the month on screen. Prev/next and the arrow keys only change that date. Store the range as `start` and `end` (either may be `null`).',
  "Let `Date` do the overflow for you: `new Date(y, m, d + 7)` and `new Date(y, m + 1, 1)` roll into the next month or year. `new Date(y, m + 1, 0).getDate()` is the number of days in month `m`, and `new Date(y, m, 1).getDay()` is how many empty slots go before the 1st. Count nights with `Date.UTC(...)` differences so daylight saving can't make a day 23 hours long.",
  'Handle `onKeyDown` once on the grid and only for the arrows: Enter and Space already click a focused `<button>`. After an arrow key the target button may not exist until the new month renders, so set a "focus pending" ref and call `.focus()` on it in a `useEffect` that runs when the active date changes (keep a `Map` of refs keyed by date).',
]

// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep three pieces of state: the chosen duration, the seconds remaining, and whether the timer is running. The `mm:ss` text is derived from the seconds remaining.',
  'Start the interval in a `useEffect` that depends on `running`, and return a cleanup that clears it. Pausing is then just setting `running` to false.',
  'Inside the interval, update with a function: `setRemaining((s) => Math.max(s - 1, 0))`. In a second effect, stop running when the remaining time reaches 0.',
]

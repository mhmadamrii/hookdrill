// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Call `search` from the input’s change handler rather than an effect, and keep a status (`idle`, `loading`, `done`, `error`) next to the results and the highlighted index.',
  'To drop stale answers, give every request an increasing number stored in a `useRef`. When a promise settles, ignore it unless its number is still the latest. Bump the number when the input is cleared or an option is picked, too.',
  'Give each option an id like `fruit-option-2` and point `aria-activedescendant` at the highlighted one. Handle the arrow keys in the input’s `onKeyDown` with `preventDefault()`, and use `onMouseDown={e => e.preventDefault()}` on options so a click doesn’t blur the input.',
]

// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'The only state you need is the password and whether it is visible. Everything else is derived while rendering.',
  'Give each rule a `test` function, e.g. `(p) => /\\d/.test(p)`, and count how many pass with `filter(...).length`.',
  'Symbols are anything that is not a letter or digit: `/[^A-Za-z0-9]/`. The input type is `visible ? "text" : "password"`.',
]

// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Keep every field of every step in one state object in `App`, plus the current step index. Steps that unmount must not own their own state, or Back will lose it.',
  'Write `validate(step, values)` that returns an object of error messages for that step only. On Next, store the result; move on only when it is empty.',
  'Render errors from that stored object, so nothing shows before the first Next. Set `aria-invalid={errors.email ? true : undefined}` on each input, and trim the name before checking and before showing it.',
]

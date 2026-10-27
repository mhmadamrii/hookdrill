Build a date range picker in `App.tsx` (default export `App`). `App` takes an optional `initialMonth` prop (`"YYYY-MM"`, e.g. `"2026-02"`) and shows the current month when it's missing. The tests always pass it.

## Requirements

- **Month view**: `month-label` shows the month and year, e.g. `February 2026`. `prev-month` and `next-month` move one month back or forward, across years too.
- **Grid**: the days sit in an element with `role="grid"`. Each week is an element with `role="row"`, and **weeks start on Sunday**. Each day of the month is a `<button>` with `role="gridcell"` whose accessible name is the full date, e.g. `February 14, 2026` (use `aria-label`).
- **Other months**: days before the 1st and after the last day are left as empty slots, not gridcells, so the grid has exactly one gridcell per day of the month.
- **Picking**: the first click sets the start; the second sets the end. If the end is before the start, swap them. A third click starts a new range from that day.
- **Selected days**: every day from start to end (inclusive) has `aria-selected="true"`; with only a start picked, just that day. Other days must not be `"true"`. A range may span months.
- **Output**: `range-output` shows `Pick a start date`, then `Pick an end date` once a start is picked, then the range as `Feb 3, 2026 – Feb 10, 2026` (short month names, an en dash `–` with a space on each side).
- **Nights**: once the range is complete, `nights` shows the number of nights between the two dates: `7 nights`, `1 night`, or `0 nights` for a same-day range. Render `nights` only when the range is complete.
- **Roving tabindex**: exactly one day has `tabindex="0"` and the others `"-1"`. It starts on the 1st of the month, moves to a day you click, and to the 1st when you change month with the buttons.
- **Keyboard**: while a day has focus, **ArrowLeft/ArrowRight** move one day and **ArrowUp/ArrowDown** one week, moving focus and the tabindex with it. Crossing into another month shows that month and focuses the day there. **Enter** and **Space** pick the focused day, exactly like a click. Moving focus doesn't change the selection.
- **Dates**: do the arithmetic on local dates (`new Date(year, month, day)`). Don't parse ISO strings like `"2026-02-01"` into a `Date`: they are read as UTC and can land on the previous day.

## Required `data-testid` selectors

| Test id        | Element                                                        |
| -------------- | -------------------------------------------------------------- |
| `month-label`  | the displayed month, e.g. `February 2026`                      |
| `prev-month`   | shows the previous month                                       |
| `next-month`   | shows the next month                                           |
| `range-output` | the prompt or the picked range, as text                        |
| `nights`       | the number of nights, rendered only when the range is complete |

The tests also use roles: `getByRole("grid")`, `getAllByRole("row")`, `getByRole("gridcell", { name: "February 14, 2026" })` and `document.activeElement` for focus.

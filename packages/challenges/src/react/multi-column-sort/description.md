Build a task table in `App.tsx` (default export `App`) that sorts by several columns at once. The tasks are given in `tasks.ts`.

## Requirements

- **Original order**: the table starts in the order of `TASKS`, with no column sorted.
- **Click**: a plain click on a header sorts by **only** that column, ascending. If that column was already the **primary** (first) sort column, the click flips its direction instead. Any other sort columns are dropped either way.
- **Shift+click**: holding Shift while clicking a header **adds** that column to the end of the sort, ascending, as the next tie-breaker. If the column is already in the sort, Shift+click flips its direction and keeps its place.
- **Compare by type**:
  - **Priority** uses a custom order: ascending is `High`, then `Medium`, then `Low` (descending is `Low` first);
  - **Due** by date;
  - **Assignee** and **Title** alphabetically, **ignoring upper and lower case**.
- **Empty values last**: tasks with no due date or no assignee (`null`) always come **after** the others in that column, in **both** directions.
- **Ties**: rows equal on every sort column keep their original relative order, in both directions.
- **Rank badges**: each sorted column's header shows its position in the sort (`1` for the primary column, `2` for the first tie-breaker, …) in a `sort-rank` element inside its `<th>`. Unsorted columns have no `sort-rank`.
- **`aria-sort`**: the primary column's `<th>` has `aria-sort="ascending"` or `"descending"`. Every other sortable `<th>`, including tie-breakers, has `"none"`.
- **Clear**: the **Clear sort** button removes every sort column and restores the original order.

## Required `data-testid` selectors

| Test id         | Element                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| `sort-title`    | the Title header button, inside the `<th>` that gets `aria-sort`               |
| `sort-priority` | the Priority header button, inside its `<th>`                                  |
| `sort-due`      | the Due header button, inside its `<th>`                                       |
| `sort-assignee` | the Assignee header button, inside its `<th>`                                  |
| `sort-rank`     | the rank badge (`1`, `2`, …) inside a sorted column's `<th>`; absent otherwise |
| `clear-sort`    | resets to the original order                                                   |
| `row`           | one `<tr>` per task, with `data-id` set to its `id`                            |

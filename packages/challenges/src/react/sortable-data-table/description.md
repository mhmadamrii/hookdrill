Build a sortable, filterable table in `App.tsx` (default export `App`). The people are given in `people.ts`.

## Requirements

- **Original order**: the table starts in the order of `PEOPLE`, with no column sorted.
- **Sort**: clicking the **Name**, **Age** or **Joined** header sorts the rows ascending by that column. Clicking the same header again flips it to descending, and again back to ascending.
- **Switching columns**: clicking a different header sorts by that column, ascending.
- **Compare by type**:
  - names alphabetically, **ignoring upper and lower case**;
  - ages as **numbers** (9 comes before 19 and 100);
  - dates by date.
- **Ties**: rows with equal values keep their original relative order.
- **`aria-sort`**: each sortable `<th>` has `aria-sort="ascending"` or `"descending"` while its column is sorted, and `"none"` otherwise.
- **Filter**: typing in the filter input shows only people whose name contains the text, ignoring case. The current sort still applies.
- **Count**: show `Showing N of 8`, where N is the number of visible rows.
- **Empty state**: when nothing matches, show a message instead of rows.

## Required `data-testid` selectors

| Test id        | Element                                                         |
| -------------- | --------------------------------------------------------------- |
| `sort-name`    | the Name header button, inside the `<th>` that gets `aria-sort` |
| `sort-age`     | the Age header button, inside its `<th>`                        |
| `sort-joined`  | the Joined header button, inside its `<th>`                     |
| `filter-input` | the name filter                                                 |
| `row`          | one `<tr>` per visible person, with `data-id` set to their `id` |
| `result-count` | the `Showing N of 8` text                                       |
| `empty-state`  | the no-results message, rendered only when nothing matches      |

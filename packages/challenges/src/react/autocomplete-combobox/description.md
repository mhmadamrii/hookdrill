Build an autocomplete for fruits in `App.tsx` (default export `App`), following the WAI-ARIA combobox pattern. `api.ts` provides `searchFruits`, which answers after a random delay, so answers can arrive out of order.

`App` takes an optional `search` prop that defaults to `searchFruits`. Always call `search`: the tests pass their own and decide when each answer arrives.

## Requirements

- **Searching**: every change to the input calls `search` with the trimmed text. An empty input calls nothing and closes everything.
- **Loading**: while the latest search is pending, show a loading message.
- **Results**: show the results as options in a listbox. If there are none, show a "no matches" message instead of the listbox. If the search fails, show an error message.
- **Stale answers**: only the answer to the **latest** query may be shown. An older request that answers late is ignored.
- **ARIA**:
  - the input has `role="combobox"`, `aria-autocomplete="list"` and `aria-controls` set to the listbox's `id`;
  - `aria-expanded` is `"true"` only while the listbox is shown;
  - the list has `role="listbox"`, and each result `role="option"` with its own `id`.
- **Keyboard**: focus stays in the input.
  - **ArrowDown** and **ArrowUp** move the highlight, wrapping at both ends. ArrowDown from nothing highlights the first option.
  - The highlighted option has `aria-selected="true"`, and the input's `aria-activedescendant` is its `id`.
  - **Enter** picks the highlighted option. **Escape** closes the list and keeps the text.
- **Picking**: picking an option, with Enter or a click, puts it in the input, closes the list and shows `Selected: <fruit>`.

## How the tests find things

| Query                       | Finds                                                  |
| --------------------------- | ------------------------------------------------------ |
| `getByRole("combobox")`     | the input                                              |
| `getByRole("listbox")`      | the results list                                       |
| `getAllByRole("option")`    | the results, by their text                             |
| `getByTestId("loading")`    | the loading message, only while the latest search runs |
| `getByTestId("no-results")` | the "no matches" message                               |
| `getByTestId("error")`      | the error message                                      |
| `getByTestId("selected")`   | `Selected: <fruit>` after picking                      |

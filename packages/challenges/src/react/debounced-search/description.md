Build a book search in `App.tsx` (default export `App`) that waits for the user to stop typing before it searches. `api.ts` provides `searchBooks`, which answers after a random delay, and `DEBOUNCE_MS` (300).

`App` takes an optional `search` prop that defaults to `searchBooks`. Always call `search`: the tests pass their own and decide when each answer arrives.

## Requirements

- **Debounce**: don't search on every keystroke. Once the input has been unchanged for `DEBOUNCE_MS` milliseconds, call `search` **once** with the trimmed text. Typing `rea` quickly makes exactly one call, `"rea"`, 300 ms after the last key. Every keystroke restarts the wait.
- **Empty input**: when the trimmed text is empty, cancel any pending search, don't call `search`, and clear the results and messages.
- **Loading**: while the latest search is pending, show a loading message.
- **Results**: show each title as an item in the results list. If the answer is an empty array, show a "no results" message. If the search fails, show an error message.
- **Stale answers**: only the answer to the **latest** search may be shown. An older search that answers late is ignored.
- **Clean up**: clear the pending timer when the user types again and when the component unmounts.

## Required `data-testid` selectors

| Test id        | Element                                                |
| -------------- | ------------------------------------------------------ |
| `search-input` | the text input                                         |
| `result`       | each title in the results list                         |
| `loading`      | the loading message, only while the latest search runs |
| `no-results`   | the "no results" message                               |
| `error`        | the error message                                      |

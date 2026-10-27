Build an infinite feed in `App.tsx` (default export `App`) that loads posts page by page. `api.ts` provides `fetchPosts`, which answers after a random delay, sometimes fails, and repeats one post between pages.

`App` takes an optional `fetchPage` prop that defaults to `fetchPosts`. Always call `fetchPage`: the tests pass their own and decide when each request answers or fails.

## Requirements

- **First page**: on mount, call `fetchPage(null)` once.
- **Loading**: while a request is in flight, show a loading message.
- **Posts**: append each page's items, in order, after the posts already shown. Skip any post whose `id` is already on screen.
- **Load more**: a **Load more** button calls `fetchPage` with the `nextCursor` of the last page that loaded.
  - It is `disabled` while a request is in flight.
  - Only one request may be in flight at a time: extra clicks send nothing.
- **End**: when a page answers with `nextCursor: null`, show an end message and hide **Load more**.
- **Errors**: when a request fails, show an error message with a **Retry** button. Retry asks for the same cursor again. Posts already loaded stay on screen.
- **Unmount**: a request that answers after the component unmounts must not update state.

## Required `data-testid` selectors

| Test id        | Element                                                   |
| -------------- | --------------------------------------------------------- |
| `post`         | one per post, in feed order, with `data-id` set to its id |
| `loading`      | the loading message, only while a request is in flight    |
| `load-more`    | loads the next page                                       |
| `end-message`  | shown when there are no more pages                        |
| `error`        | the error message, after a failed request                 |
| `retry-button` | retries the failed request                                |

Use a real `<button>` for **Load more** so `disabled` works.

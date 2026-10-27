Build a toast notification queue in `App.tsx` (default export `App`).

## Requirements

- **Adding**: **Add success** adds a success toast with the message `Saved successfully #N`, and **Add error** adds an error toast with `Something went wrong #N`. `N` counts every toast added, starting at 1, so the third toast added is `#3` whatever its type.
- **Markup**: toasts render, oldest first, inside a region with `aria-live="polite"`. Each toast has `data-type="success"` or `data-type="error"`. Error toasts have `role="alert"`, success toasts `role="status"`.
- **Queue**: at most 3 toasts are visible. Extra toasts wait in a queue and appear, in the order they were added, as visible ones leave. While N > 0 toasts are waiting, show `+N more`; hide it when nothing is waiting.
- **Auto-dismiss**: each toast disappears 3000 ms after it **becomes visible**. Time spent waiting in the queue doesn't count.
- **Dismiss**: each toast has a close button that removes it immediately.
- **Pause on hover**: while the pointer is over a toast, its timer is paused. When the pointer leaves, it resumes with the time that was left, not a fresh 3000 ms.

## Required `data-testid` selectors

| Test id          | Element                                             |
| ---------------- | --------------------------------------------------- |
| `add-success`    | adds a success toast                                |
| `add-error`      | adds an error toast                                 |
| `toast-region`   | the `aria-live="polite"` region holding the toasts  |
| `toast`          | each visible toast, with `data-type` and its `role` |
| `dismiss-button` | the close button inside each toast                  |
| `queue-count`    | `+N more`, rendered only while toasts are waiting   |

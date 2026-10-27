Build an accessible modal dialog in `App.tsx` (default export `App`). The page has an **Edit name** button; the dialog edits the display name.

## Requirements

- **Semantics**: the dialog has `role="dialog"`, `aria-modal="true"` and `aria-labelledby` pointing at its title, "Edit display name".
- **Focus in**: opening the dialog moves focus to the name input.
- **Focus trap**: while open, **Tab** and **Shift+Tab** never leave the dialog. Tab on the last control (Save) moves to the first (×), and Shift+Tab on the first moves to the last.
- **Closing**: **Escape**, **Cancel**, **×** and a click on the backdrop all close the dialog. A click inside the dialog does not.
- **Focus back**: whenever the dialog closes, focus returns to the **Edit name** button.
- **Background**: while open, the page content behind it is hidden from assistive tech and focus: give the `page` element `inert` (or `aria-hidden="true"`). The dialog must not be inside `page`.
- **Save**: saves the trimmed name to the page, then closes. The controls inside the dialog are, in order: ×, the name input, Cancel, Save.

## Required `data-testid` selectors

| Test id         | Element                                           |
| --------------- | ------------------------------------------------- |
| `page`          | wraps the page content, outside the dialog        |
| `open-button`   | the Edit name button                              |
| `saved-name`    | the current display name                          |
| `backdrop`      | the overlay behind the dialog; clicking it closes |
| `close-button`  | the × button, first control in the dialog         |
| `name-input`    | the name input                                    |
| `cancel-button` | closes without saving                             |
| `save-button`   | saves and closes, last control in the dialog      |

The tests also find the dialog with `getByRole("dialog")` and check `document.activeElement`.

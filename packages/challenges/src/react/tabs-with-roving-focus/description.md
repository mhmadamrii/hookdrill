Build accessible tabs in `App.tsx` (default export `App`), following the WAI-ARIA tabs pattern. The tabs are given in `tabs.ts`; one of them is disabled.

## Requirements

- **Roles**: the tab buttons sit in an element with `role="tablist"`. Each tab has `role="tab"`, and the visible content has `role="tabpanel"`.
- **Linking**: each tab has an `id` and `aria-controls` pointing at its panel's `id`. The panel has `aria-labelledby` pointing back at its tab's `id`.
- **Selection**: exactly one tab has `aria-selected="true"`, the others `"false"`. The first tab starts selected. Clicking a tab selects it, and the panel shows that tab's content.
- **Roving tabindex**: the selected tab has `tabindex="0"` and every other tab `tabindex="-1"`, so Tab moves into and out of the tab list in one step.
- **Keyboard**: while a tab has focus,
  - **ArrowRight** and **ArrowLeft** move to the next or previous tab, wrapping around at the ends;
  - **Home** and **End** move to the first or last tab.
  - Moving with the keyboard both **focuses and selects** the tab.
- **Disabled tabs**: the disabled tab has the `disabled` attribute and is skipped by every key.

## How the tests find things

This challenge is about semantics, so the tests use roles instead of `data-testid`s:

| Query                    | Finds                                 |
| ------------------------ | ------------------------------------- |
| `getByRole("tablist")`   | the tab list                          |
| `getAllByRole("tab")`    | the tabs, by their label (e.g. Specs) |
| `getByRole("tabpanel")`  | the visible panel                     |
| `document.activeElement` | the focused tab                       |

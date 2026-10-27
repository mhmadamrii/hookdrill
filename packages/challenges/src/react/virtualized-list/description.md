Render a list of 10,000 orders in `App.tsx` (default export `App`) without putting 10,000 rows in the DOM. `items.ts` gives you the items and three constants: `ROW_HEIGHT` (32), `VIEWPORT_HEIGHT` (320) and `OVERSCAN` (3).

## Requirements

- **Viewport**: a scrolling element `VIEWPORT_HEIGHT` pixels tall (`overflow-y: auto`).
- **Spacer**: inside it, an element as tall as the whole list, `ITEMS.length × ROW_HEIGHT` pixels, set as an inline `height` style, so the scrollbar behaves as if every row were there.
- **Windowing**: render only the rows that touch the viewport, plus `OVERSCAN` rows above and below. For a scroll position `scrollTop`:
  - the first visible row is `floor(scrollTop / ROW_HEIGHT)`;
  - the last visible row is `floor((scrollTop + VIEWPORT_HEIGHT - 1) / ROW_HEIGHT)`;
  - widen that range by `OVERSCAN` on each side, never past the start or end of the list.
- **Position**: place each row at `index × ROW_HEIGHT` from the top of the spacer, so it lines up with the scrollbar.
- **Scrolling**: when the viewport scrolls, read its `scrollTop` and update the rendered rows.
- **Content**: each row shows its item from `ITEMS`.

Read sizes from the constants, not from the DOM: the tests run without layout, so measured heights are 0.

## Required `data-testid` selectors

| Test id    | Element                                                  |
| ---------- | -------------------------------------------------------- |
| `viewport` | the scrolling element, with an `onScroll` handler        |
| `spacer`   | the full-height element inside it                        |
| `row`      | one per rendered row, with `data-index` set to its index |

Build a Kanban board in `App.tsx` (default export `App`) whose cards move between columns by drag and drop and by keyboard. The starting board is in `board.ts`.

## Requirements

- **Board**: render each column from `BOARD` in order, with its title in a heading, a count of its cards, and its cards in order. Each card is a focusable `<button>` showing its title.
- **Drag and drop**: cards are `draggable`. Dropping a card anywhere on a column (including on another card in it) moves it to the **end** of that column. Counts update.
  - The column's `dragover` handler calls `preventDefault()`, so the browser allows the drop.
  - The tests pass a small fake `dataTransfer` with `setData` and `getData`; you may use it, or remember the dragged card yourself.
- **Keyboard**: while a card has focus,
  - **Space** or **Enter** picks it up. A picked-up card has `aria-pressed="true"`; every other card has `aria-pressed="false"`.
  - **ArrowLeft** / **ArrowRight** move it to the previous / next column at the **same position**, or at the end if that column is shorter. Nothing happens at the first / last column.
  - **ArrowUp** / **ArrowDown** move it one place within its column, stopping at the ends.
  - **Space** or **Enter** drops it where it is. **Escape** cancels: the card goes back to the column and position it was picked up from.
  - Arrow keys do nothing until a card is picked up.
  - The moving card **keeps focus** after every move, even when it changes column.
- **Announcements**: a visually hidden live region with `aria-live="assertive"` announces each step:
  - `Picked up Write tests.`
  - `Write tests moved to Done, position 2 of 3.` (1-based position, then the column's card count)
  - `Write tests dropped.`
  - `Move cancelled.`

## Required `data-testid` selectors

| Test id        | Element                                                      |
| -------------- | ------------------------------------------------------------ |
| `column`       | one per column, in board order, with `data-id` set to its id |
| `column-count` | the number of cards in the column, as text, inside `column`  |
| `card`         | one per card, in column order, with `data-id` set to its id  |
| `announcer`    | the live region                                              |

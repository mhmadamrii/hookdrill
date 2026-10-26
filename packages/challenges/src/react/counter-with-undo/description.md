Build a counter with undo and redo in `App.tsx` (default export `App`).

## Requirements

- **Count**: starts at 0. **+** adds 1 and **−** subtracts 1. The count may go below 0.
- **Undo**: steps back to the count before the last change. You can keep undoing until you're back at the start.
- **Redo**: re-applies a change you just undid. You can keep redoing until you're back at the latest change.
- **New changes clear redo**: after undoing, pressing **+** or **−** throws away anything left to redo.
- **Disabled states**: Undo is `disabled` when there is nothing to undo, and Redo is `disabled` when there is nothing to redo. Both start disabled.

## Required `data-testid` selectors

| Test id            | Element                    |
| ------------------ | -------------------------- |
| `count`            | the current count, as text |
| `increment-button` | adds 1                     |
| `decrement-button` | subtracts 1                |
| `undo-button`      | undoes the last change     |
| `redo-button`      | redoes an undone change    |

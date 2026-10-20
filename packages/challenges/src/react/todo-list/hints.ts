export const hints = [
  'Keep the todos in a single `useState` array. Give each todo a stable `id` (for example `Date.now()` or a counter) so you can find it later.',
  'Wrap the input and Add button in a `<form>` and handle `onSubmit`. That gives you Enter-to-submit for free. Remember `event.preventDefault()` and `text.trim()`.',
  'Update immutably: `todos.map(t => t.id === id ? { ...t, done: !t.done } : t)` to toggle, `todos.filter(t => t.id !== id)` to delete.',
  'For editing, store the id of the todo being edited (`editingId`) and a draft string. Render `edit-input` + `save-button` for that todo instead of `todo-text` + `edit-button`.',
]

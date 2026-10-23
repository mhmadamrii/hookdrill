import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/playground')({
  component: RouteComponent,
})

function RouteComponent() {
  const [text, setText] = useState('')

  // TODO: keep a list of todos and implement add, edit, delete, and toggle.
  // See the requirements for the data-testid each element needs.
  return (
    <div>
      <h1>Todos</h1>
      <input
        data-testid="todo-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs doing?"
      />
      <button data-testid="add-button">Add</button>
      <ul>{/* render one data-testid="todo-item" per todo */}</ul>
    </div>
  )
}

/**
 * todo-input	text input for a new todo
add-button	adds the todo
todo-item	one per todo (e.g. the <li>), with data-done="true|false"
todo-text	the todo's text, inside todo-item
toggle-button	marks the todo done / not done, inside todo-item
edit-button	enters edit mode, inside todo-item
edit-input	text input shown while editing
save-button	saves the edited text
delete-button	removes the todo, inside todo-item
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/playground')({
  component: RouteComponent,
})

type Todos = {
  id: number
  name: string
  isDone: boolean
}

function RouteComponent() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState<Todos[]>([])

  // TODO: keep a list of todos and implement add, edit, delete, and toggle.
  // See the requirements for the data-testid each element needs.

  const handleCreateTodo = () => {
    setTodos((prev) => [...prev, { id: Date.now(), name: text, isDone: false }])
    setText('')
  }

  const handleDeleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((i) => i.id !== id))
  }

  const handleToggleTodo = (id: number) => {
    const current = todos.filter((i) => i.id === id)
    console.log('current', current)
    setTodos((prev) =>
      prev.map((t) =>
        t.id == id
          ? {
              ...t,
              isDone: !t.isDone,
            }
          : t,
      ),
    )
  }

  return (
    <div>
      <h1>Todos</h1>
      <input
        data-testid="todo-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs doing?"
      />
      <button onClick={handleCreateTodo} data-testid="add-button">
        Add
      </button>
      <ul>
        {todos.map((t) => (
          <li
            key={t.id}
            style={{
              display: 'flex',
              gap: 30,
              color: t.isDone ? 'red' : '',
            }}
          >
            {t.name}
            <button onClick={() => handleToggleTodo(t.id)}>Done</button>
            <button onClick={() => handleDeleteTodo(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
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

/**
 * Keep the todos in a single useState array. Give each todo a stable id (for example Date.now() or a counter) so you can find it later.
 * Wrap the input and Add button in a <form> and handle onSubmit. That gives you Enter-to-submit for free. Remember event.preventDefault() and text.trim().
 * Update immutably: todos.map(t => t.id === id ? { ...t, done: !t.done } : t) to toggle, todos.filter(t => t.id !== id) to delete.
 * For editing, store the id of the todo being edited (editingId) and a draft string. Render edit-input + save-button for that todo instead of todo-text + edit-button.
 */

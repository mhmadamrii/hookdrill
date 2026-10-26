import { useState, type FormEvent } from "react";

type Todo = { id: number; text: string; done: boolean };

let nextId = 1;

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  function addTodo(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTodos([...todos, { id: nextId++, text: value, done: false }]);
    setText("");
  }

  function toggle(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setDraft(todo.text);
  }

  function save(e: FormEvent) {
    e.preventDefault();
    const value = draft.trim();
    if (value) {
      setTodos(
        todos.map((t) => (t.id === editingId ? { ...t, text: value } : t)),
      );
    }
    setEditingId(null);
  }

  return (
    <div>
      <h1>Todos</h1>
      <form onSubmit={addTodo}>
        <input
          data-testid="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
        />
        <button data-testid="add-button" type="submit">
          Add
        </button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            data-testid="todo-item"
            data-done={String(todo.done)}
          >
            <input
              type="checkbox"
              data-testid="toggle-button"
              checked={todo.done}
              onChange={() => toggle(todo.id)}
            />
            {editingId === todo.id ? (
              <form onSubmit={save} style={{ display: "inline" }}>
                <input
                  data-testid="edit-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
                <button data-testid="save-button" type="submit">
                  Save
                </button>
              </form>
            ) : (
              <>
                <span
                  data-testid="todo-text"
                  style={{
                    textDecoration: todo.done ? "line-through" : "none",
                  }}
                >
                  {todo.text}
                </span>
                <button
                  data-testid="edit-button"
                  onClick={() => startEdit(todo)}
                >
                  Edit
                </button>
              </>
            )}
            <button data-testid="delete-button" onClick={() => remove(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");

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
  );
}

export default function App() {
  // TODO: keep the count and its history so changes can be undone and redone.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <p data-testid="count">0</p>
      <button data-testid="decrement-button">−</button>
      <button data-testid="increment-button">+</button>
      <button data-testid="undo-button">Undo</button>
      <button data-testid="redo-button">Redo</button>
    </div>
  );
}

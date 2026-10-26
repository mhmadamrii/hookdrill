export default function App() {
  // TODO: keep the count in state and wire up the buttons.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <p data-testid="count">0</p>
      <button data-testid="decrement-button">−</button>
      <button data-testid="increment-button">+</button>
      <button data-testid="reset-button">Reset</button>
    </div>
  );
}

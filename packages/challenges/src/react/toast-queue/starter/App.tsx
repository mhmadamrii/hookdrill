export default function App() {
  // TODO: add toasts from the buttons, show at most 3 at a time and queue the
  // rest, dismiss each one 3 seconds after it appears (pausing while hovered),
  // and let the user close one early.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <button data-testid="add-success">Add success</button>
      <button data-testid="add-error">Add error</button>
      <div data-testid="toast-region" aria-live="polite"></div>
    </div>
  );
}

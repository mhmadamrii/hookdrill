export default function App() {
  // TODO: count down from the chosen number of seconds, once per second.
  // Start, Pause and Reset control it; show "Time's up!" when it reaches zero.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <label>
        Seconds
        <input
          data-testid="seconds-input"
          type="number"
          min={1}
          defaultValue={60}
        />
      </label>
      <p data-testid="time">01:00</p>
      <button data-testid="start-button">Start</button>
      <button data-testid="pause-button">Pause</button>
      <button data-testid="reset-button">Reset</button>
    </div>
  );
}

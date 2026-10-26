import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const format = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

export default function App() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Stop once the countdown reaches zero.
  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  function changeDuration(value: string) {
    const seconds = Math.max(0, Math.floor(Number(value) || 0));
    setDuration(seconds);
    setRemaining(seconds);
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
  }

  return (
    <div>
      <label>
        Seconds
        <input
          data-testid="seconds-input"
          type="number"
          min={1}
          value={duration || ""}
          disabled={running}
          onChange={(e) => changeDuration(e.target.value)}
        />
      </label>
      <p data-testid="time">{format(remaining)}</p>
      {remaining === 0 && duration > 0 && (
        <p data-testid="done-message">Time's up!</p>
      )}
      <button
        data-testid="start-button"
        disabled={running || remaining === 0}
        onClick={() => setRunning(true)}
      >
        Start
      </button>
      <button
        data-testid="pause-button"
        disabled={!running}
        onClick={() => setRunning(false)}
      >
        Pause
      </button>
      <button data-testid="reset-button" onClick={reset}>
        Reset
      </button>
    </div>
  );
}

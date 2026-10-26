import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [past, setPast] = useState<number[]>([]);
  const [future, setFuture] = useState<number[]>([]);

  function change(next: number) {
    setPast([...past, count]);
    setFuture([]);
    setCount(next);
  }

  function undo() {
    const previous = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([count, ...future]);
    setCount(previous);
  }

  function redo() {
    const [next, ...rest] = future;
    setPast([...past, count]);
    setFuture(rest);
    setCount(next);
  }

  return (
    <div>
      <p data-testid="count">{count}</p>
      <button data-testid="decrement-button" onClick={() => change(count - 1)}>
        −
      </button>
      <button data-testid="increment-button" onClick={() => change(count + 1)}>
        +
      </button>
      <button
        data-testid="undo-button"
        onClick={undo}
        disabled={past.length === 0}
      >
        Undo
      </button>
      <button
        data-testid="redo-button"
        onClick={redo}
        disabled={future.length === 0}
      >
        Redo
      </button>
    </div>
  );
}

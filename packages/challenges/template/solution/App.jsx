import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p data-testid="count">{count}</p>
      <button
        data-testid="decrement-button"
        onClick={() => setCount(Math.max(0, count - 1))}
      >
        −
      </button>
      <button
        data-testid="increment-button"
        onClick={() => setCount(count + 1)}
      >
        +
      </button>
      <button data-testid="reset-button" onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  )
}

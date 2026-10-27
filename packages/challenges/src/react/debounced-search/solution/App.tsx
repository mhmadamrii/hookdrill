import { useEffect, useRef, useState } from "react";
import { DEBOUNCE_MS, searchBooks, type Search } from "./api";

type Status = "idle" | "loading" | "done" | "error";

export default function App({ search = searchBooks }: { search?: Search }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Every keystroke gets a number; only the latest one may update state.
  const latest = useRef(0);

  function cancelTimer() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }

  useEffect(
    () => () => {
      cancelTimer();
      latest.current = -1;
    },
    [],
  );

  function onChange(value: string) {
    setQuery(value);
    cancelTimer();
    const id = ++latest.current;
    const q = value.trim();
    if (!q) {
      setStatus("idle");
      setResults([]);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      setStatus("loading");
      search(q).then(
        (found) => {
          if (id !== latest.current) return;
          setResults(found);
          setStatus("done");
        },
        () => {
          if (id !== latest.current) return;
          setResults([]);
          setStatus("error");
        },
      );
    }, DEBOUNCE_MS);
  }

  return (
    <div>
      <label htmlFor="book-search">Search books</label>
      <input
        id="book-search"
        data-testid="search-input"
        autoComplete="off"
        value={query}
        onChange={(e) => onChange(e.target.value)}
      />
      {status === "loading" && <p data-testid="loading">Searching…</p>}
      {status === "error" && (
        <p data-testid="error" role="alert">
          Something went wrong. Try again.
        </p>
      )}
      {status === "done" && results.length === 0 && (
        <p data-testid="no-results">No books found.</p>
      )}
      <ul data-testid="results">
        {results.map((title) => (
          <li key={title} data-testid="result">
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}

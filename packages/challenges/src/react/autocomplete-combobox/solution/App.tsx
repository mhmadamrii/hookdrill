import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { searchFruits, type Search } from "./api";

type Status = "idle" | "loading" | "done" | "error";

export default function App({ search = searchFruits }: { search?: Search }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState<string | null>(null);
  // Every request gets a number; only the latest one may update state.
  const latest = useRef(0);

  useEffect(() => () => void (latest.current = -1), []);

  function onChange(value: string) {
    setQuery(value);
    setActive(-1);
    const q = value.trim();
    const id = ++latest.current;
    if (!q) {
      setOpen(false);
      setStatus("idle");
      setResults([]);
      return;
    }
    setOpen(true);
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
  }

  function choose(option: string) {
    latest.current++; // drop anything still in flight
    setQuery(option);
    setSelected(option);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: KeyboardEvent) {
    const showing = open && status === "done" && results.length > 0;
    if (e.key === "ArrowDown" && showing) {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && showing) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && showing && active >= 0) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const optionId = (i: number) => `fruit-option-${i}`;
  const listVisible = open && status === "done" && results.length > 0;

  return (
    <div>
      <label htmlFor="fruit">Fruit</label>
      <input
        id="fruit"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listVisible}
        aria-controls="fruit-listbox"
        aria-activedescendant={
          listVisible && active >= 0 ? optionId(active) : undefined
        }
        autoComplete="off"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {open && status === "loading" && <p data-testid="loading">Searching…</p>}
      {open && status === "error" && (
        <p data-testid="error" role="alert">
          Something went wrong. Try again.
        </p>
      )}
      {open && status === "done" && results.length === 0 && (
        <p data-testid="no-results">No matches.</p>
      )}
      {listVisible && (
        <ul id="fruit-listbox" role="listbox" aria-label="Fruits">
          {results.map((r, i) => (
            <li
              key={r}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              // Keep focus in the input while clicking an option.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(r)}
            >
              {r}
            </li>
          ))}
        </ul>
      )}
      {selected && <p data-testid="selected">Selected: {selected}</p>}
    </div>
  );
}

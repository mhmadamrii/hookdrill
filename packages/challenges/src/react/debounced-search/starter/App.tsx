import { useState } from "react";
import { searchBooks, type Search } from "./api";

// The tests pass their own `search`, so keep this prop and call it.
export default function App({ search = searchBooks }: { search?: Search }) {
  const [query, setQuery] = useState("");
  // TODO: once typing pauses for DEBOUNCE_MS, call `search` with the trimmed
  // query. Show loading, results, "no results" and error states, and ignore
  // stale responses. Clear the pending timer when typing again and on unmount.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <label htmlFor="book-search">Search books</label>
      <input
        id="book-search"
        data-testid="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul data-testid="results"></ul>
    </div>
  );
}

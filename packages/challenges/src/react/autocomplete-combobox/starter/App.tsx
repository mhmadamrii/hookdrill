import { useState } from "react";
import { searchFruits, type Search } from "./api";

// The tests pass their own `search`, so keep this prop and call it.
export default function App({ search = searchFruits }: { search?: Search }) {
  const [query, setQuery] = useState("");
  // TODO: search as the user types, show the results in an ARIA listbox,
  // support ArrowDown/ArrowUp/Enter/Escape, and ignore stale responses.
  // See the requirements for the roles and data-testid each element needs.

  return (
    <div>
      <label htmlFor="fruit">Fruit</label>
      <input
        id="fruit"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}

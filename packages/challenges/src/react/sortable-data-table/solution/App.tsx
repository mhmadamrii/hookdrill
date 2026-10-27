import { useMemo, useState } from "react";
import { PEOPLE, type Person } from "./people";

type Column = "name" | "age" | "joined";
type Sort = { column: Column; direction: "ascending" | "descending" } | null;

const compare: Record<Column, (a: Person, b: Person) => number> = {
  name: (a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  age: (a, b) => a.age - b.age,
  // ISO dates sort correctly as strings, but comparing times says what we mean.
  joined: (a, b) => Date.parse(a.joined) - Date.parse(b.joined),
};

const COLUMNS: Array<{ key: Column; label: string }> = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "joined", label: "Joined" },
];

export default function App() {
  const [sort, setSort] = useState<Sort>(null);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = PEOPLE.filter((p) => p.name.toLowerCase().includes(q));
    if (!sort) return filtered;
    const sign = sort.direction === "ascending" ? 1 : -1;
    // Array.prototype.sort is stable, so ties keep their original order.
    return [...filtered].sort((a, b) => sign * compare[sort.column](a, b));
  }, [sort, query]);

  function toggle(column: Column) {
    setSort((s) =>
      s?.column === column && s.direction === "ascending"
        ? { column, direction: "descending" }
        : { column, direction: "ascending" },
    );
  }

  const ariaSort = (column: Column) =>
    sort?.column === column ? sort.direction : "none";

  const header = (key: Column) => {
    const { label } = COLUMNS.find((c) => c.key === key)!;
    return (
      <th aria-sort={ariaSort(key)}>
        <button data-testid={`sort-${key}`} onClick={() => toggle(key)}>
          {label}
          {sort?.column === key &&
            (sort.direction === "ascending" ? " ▲" : " ▼")}
        </button>
      </th>
    );
  };

  return (
    <div>
      <input
        data-testid="filter-input"
        placeholder="Filter by name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p data-testid="result-count">
        Showing {rows.length} of {PEOPLE.length}
      </p>
      <table>
        <thead>
          <tr>
            {header("name")}
            {header("age")}
            <th>City</th>
            {header("joined")}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} data-testid="row" data-id={p.id}>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.city}</td>
              <td>{p.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p data-testid="empty-state">No one matches “{query}”.</p>
      )}
    </div>
  );
}

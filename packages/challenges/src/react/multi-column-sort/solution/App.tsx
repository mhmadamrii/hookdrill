import { useMemo, useState, type MouseEvent } from "react";
import { TASKS, type Priority, type Task } from "./tasks";

type Column = "title" | "priority" | "due" | "assignee";
type Direction = "ascending" | "descending";
type SortKey = { column: Column; direction: Direction };

const PRIORITY_RANK: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

// Each column maps a task to a comparable value; null means "empty".
const COLUMNS: Record<
  Column,
  { label: string; value: (t: Task) => string | number | null }
> = {
  title: { label: "Title", value: (t) => t.title },
  priority: { label: "Priority", value: (t) => PRIORITY_RANK[t.priority] },
  due: { label: "Due", value: (t) => (t.due ? Date.parse(t.due) : null) },
  assignee: { label: "Assignee", value: (t) => t.assignee },
};

function compareBy(keys: SortKey[], a: Task, b: Task): number {
  for (const { column, direction } of keys) {
    const x = COLUMNS[column].value(a);
    const y = COLUMNS[column].value(b);
    if (x === y) continue;
    // Empty values go last whatever the direction, so return before flipping.
    if (x === null) return 1;
    if (y === null) return -1;
    const result =
      typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y), undefined, {
            sensitivity: "base",
          });
    if (result !== 0) return direction === "ascending" ? result : -result;
  }
  return 0;
}

const flip = (d: Direction): Direction =>
  d === "ascending" ? "descending" : "ascending";

export default function App() {
  const [keys, setKeys] = useState<SortKey[]>([]);

  // sort is stable: rows equal on every key keep their original order.
  const rows = useMemo(
    () =>
      keys.length ? [...TASKS].sort((a, b) => compareBy(keys, a, b)) : TASKS,
    [keys],
  );

  function onHeaderClick(column: Column, e: MouseEvent) {
    setKeys((current) => {
      const existing = current.find((k) => k.column === column);
      if (e.shiftKey) {
        if (existing)
          return current.map((k) =>
            k.column === column ? { column, direction: flip(k.direction) } : k,
          );
        return [...current, { column, direction: "ascending" }];
      }
      const wasPrimary = current[0]?.column === column;
      return [
        {
          column,
          direction: wasPrimary ? flip(current[0].direction) : "ascending",
        },
      ];
    });
  }

  const header = (column: Column) => {
    const rank = keys.findIndex((k) => k.column === column);
    const key = keys[rank];
    return (
      <th aria-sort={rank === 0 ? key.direction : "none"}>
        <button
          data-testid={`sort-${column}`}
          onClick={(e) => onHeaderClick(column, e)}
        >
          {COLUMNS[column].label}
          {key && (key.direction === "ascending" ? " ▲" : " ▼")}
        </button>
        {key && <sup data-testid="sort-rank">{rank + 1}</sup>}
      </th>
    );
  };

  return (
    <div>
      <p>Click a header to sort. Shift+click to add a tie-breaker.</p>
      <button data-testid="clear-sort" onClick={() => setKeys([])}>
        Clear sort
      </button>
      <table>
        <thead>
          <tr>
            {header("title")}
            {header("priority")}
            {header("due")}
            {header("assignee")}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} data-testid="row" data-id={t.id}>
              <td>{t.title}</td>
              <td>{t.priority}</td>
              <td>{t.due ?? "—"}</td>
              <td>{t.assignee ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

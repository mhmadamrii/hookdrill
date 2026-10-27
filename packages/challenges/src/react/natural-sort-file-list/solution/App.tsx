import { useMemo, useState } from "react";
import { FILES, type Entry } from "./files";

type Mode = "name-asc" | "name-desc" | "size-asc" | "size-desc";

const STATUS: Record<Mode, string> = {
  "name-asc": "Name, A to Z",
  "name-desc": "Name, Z to A",
  "size-asc": "Size, smallest first",
  "size-desc": "Size, largest first",
};

// numeric: digit runs compare by value ("2" < "10", "007" == "7").
// sensitivity "base": ignore case and accents ("R" == "r", "é" == "e").
const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});
const byName = (a: Entry, b: Entry) => collator.compare(a.name, b.name);

function compareEntries(mode: Mode, a: Entry, b: Entry): number {
  // Folders always come first, whatever the direction.
  if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
  if (mode === "name-desc") return -byName(a, b);
  if (mode === "size-asc" || mode === "size-desc") {
    // Folders have no size: list them by name.
    if (a.kind === "folder") return byName(a, b);
    const sign = mode === "size-asc" ? 1 : -1;
    return sign * (a.sizeBytes - b.sizeBytes) || byName(a, b);
  }
  return byName(a, b);
}

export default function App() {
  const [mode, setMode] = useState<Mode>("name-asc");

  // sort is stable, so names that compare equal keep their original order.
  const entries = useMemo(
    () => [...FILES].sort((a, b) => compareEntries(mode, a, b)),
    [mode],
  );

  return (
    <div>
      <button
        data-testid="sort-name"
        onClick={() => setMode(mode === "name-asc" ? "name-desc" : "name-asc")}
      >
        Name
      </button>
      <button
        data-testid="sort-size"
        onClick={() => setMode(mode === "size-asc" ? "size-desc" : "size-asc")}
      >
        Size
      </button>
      <p data-testid="sort-status">{STATUS[mode]}</p>
      <ul>
        {entries.map((f) => (
          <li key={f.name} data-testid="entry" data-name={f.name}>
            {f.kind === "folder" ? "📁" : "📄"} {f.name}
            {f.kind === "file" && ` (${f.sizeBytes} B)`}
          </li>
        ))}
      </ul>
    </div>
  );
}

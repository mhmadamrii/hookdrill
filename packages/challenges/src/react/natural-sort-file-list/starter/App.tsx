import { FILES } from "./files";

export default function App() {
  // TODO: list folders first, sort names naturally (file2 before file10),
  // toggle the name order, sort files by size, and show the current mode.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <button data-testid="sort-name">Name</button>
      <button data-testid="sort-size">Size</button>
      <p data-testid="sort-status">Name, A to Z</p>
      <ul>
        {FILES.map((f) => (
          <li key={f.name} data-testid="entry" data-name={f.name}>
            {f.kind === "folder" ? "📁" : "📄"} {f.name}
            {f.kind === "file" && ` (${f.sizeBytes} B)`}
          </li>
        ))}
      </ul>
    </div>
  );
}

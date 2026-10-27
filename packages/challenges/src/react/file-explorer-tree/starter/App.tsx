import { ROOT } from "./files";

export default function App() {
  // TODO: render ROOT as a recursive tree: role="tree", one role="treeitem"
  // per node with aria-level and (for folders) aria-expanded, sorted children,
  // expand/collapse on click, and file selection with its full path.
  // See the requirements for what the tests check.

  return (
    <div>
      <button data-testid="expand-all">Expand all</button>
      <button data-testid="collapse-all">Collapse all</button>
      <ul>
        <li>{ROOT.name}</li>
      </ul>
      <p data-testid="selected-path">No file selected</p>
    </div>
  );
}

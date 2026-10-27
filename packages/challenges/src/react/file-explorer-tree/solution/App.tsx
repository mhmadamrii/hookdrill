import { useState } from "react";
import { ROOT, type Node } from "./files";

const isFolder = (node: Node) => node.children !== undefined;

// Folders first, then files; each group alphabetical, ignoring case.
function sortChildren(children: Node[]) {
  return [...children].sort((a, b) => {
    if (isFolder(a) !== isFolder(b)) return isFolder(a) ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

function folderPaths(node: Node, path: string): string[] {
  if (!node.children) return [];
  return [
    path,
    ...node.children.flatMap((c) => folderPaths(c, `${path}/${c.name}`)),
  ];
}

type TreeProps = {
  node: Node;
  path: string;
  level: number;
  expanded: Set<string>;
  selected: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
};

// Renders one node and, if it is an open folder, recurses into its children.
function TreeNode(props: TreeProps) {
  const { node, path, level, expanded, selected, onToggle, onSelect } = props;
  const folder = isFolder(node);
  const open = folder && expanded.has(path);

  return (
    <li
      role="treeitem"
      aria-label={node.name}
      aria-level={level}
      aria-expanded={folder ? open : undefined}
      aria-selected={folder ? undefined : selected === path}
    >
      <button
        type="button"
        style={{ paddingLeft: (level - 1) * 16 }}
        onClick={() => (folder ? onToggle(path) : onSelect(path))}
      >
        <span aria-hidden="true">{folder ? (open ? "▾ " : "▸ ") : "  "}</span>
        <span>{node.name}</span>
      </button>
      {open && (
        <ul role="group">
          {node.children!.length === 0 && <li role="none">(empty)</li>}
          {sortChildren(node.children!).map((child) => (
            <TreeNode
              key={child.name}
              {...props}
              node={child}
              path={`${path}/${child.name}`}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function App() {
  // Expanded state is keyed by path, so collapsing a parent does not forget
  // which of its descendants were open.
  const [expanded, setExpanded] = useState(() => new Set([ROOT.name]));
  const [selected, setSelected] = useState<string | null>(null);

  function toggle(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div>
      <button
        data-testid="expand-all"
        onClick={() => setExpanded(new Set(folderPaths(ROOT, ROOT.name)))}
      >
        Expand all
      </button>
      <button
        data-testid="collapse-all"
        onClick={() => setExpanded(new Set([ROOT.name]))}
      >
        Collapse all
      </button>
      <ul role="tree" aria-label="Files">
        <TreeNode
          node={ROOT}
          path={ROOT.name}
          level={1}
          expanded={expanded}
          selected={selected}
          onToggle={toggle}
          onSelect={setSelected}
        />
      </ul>
      <p data-testid="selected-path">{selected ?? "No file selected"}</p>
    </div>
  );
}

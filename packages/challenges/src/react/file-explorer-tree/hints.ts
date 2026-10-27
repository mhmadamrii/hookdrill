// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'A tree is the same shape at every depth, so write one `TreeNode` component that renders a node and then renders a `TreeNode` for each of its children. Pass the `level` (and the path so far) down as props.',
  'Keep the expanded folders and the selected file in `App`, keyed by **path** (`project/src/components`), not inside each `TreeNode`. A `Set<string>` of open paths survives collapsing a parent, because collapsing only removes that one path.',
  'Sort a copy of the children: `[...children].sort(...)`, comparing `isFolder` first and then `a.name.localeCompare(b.name, undefined, { sensitivity: "base" })`. For Expand all, collect every folder path with a small recursive function.',
]

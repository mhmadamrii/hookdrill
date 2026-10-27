Build a file explorer in `App.tsx` (default export `App`). The folder tree is given in `files.ts`: a node with `children` is a folder (even if `children` is empty), anything else is a file.

## Requirements

- **Roles**: the tree sits in an element with `role="tree"`. Every node is an element with `role="treeitem"` whose accessible name is exactly the node's name (e.g. `Button.tsx`). A folder's treeitem contains its children, so name it with `aria-label`.
- **Levels**: each treeitem has `aria-level`: the root `project` is `1`, its children `2`, and so on.
- **Expanded state**: folders have `aria-expanded="true"` or `"false"`; files have no `aria-expanded`. Only the root starts expanded. Children of a collapsed folder are not rendered.
- **Order**: inside a folder, show folders first, then files, each group sorted alphabetically, **ignoring upper and lower case**. The data is deliberately unsorted.
- **Toggle**: clicking a folder expands or collapses it. Collapsing a folder **remembers** which of its descendants were open, so reopening it shows them the way they were.
- **Select**: clicking a file selects it: it gets `aria-selected="true"`, and only one file is selected at a time. `selected-path` shows its full path from the root, e.g. `project/src/components/Button.tsx`.
- **Expand all / Collapse all**: expand every folder, or collapse every folder except the root.
- **Empty folders**: an expanded empty folder shows the note `(empty)` (not a treeitem).

## How the tests find things

| Query                             | Finds                                                                |
| --------------------------------- | -------------------------------------------------------------------- |
| `getByRole("tree")`               | the tree                                                             |
| `getByRole("treeitem", { name })` | a node, by its name; tests click the element showing the node's name |
| `getByTestId("expand-all")`       | the Expand all button                                                |
| `getByTestId("collapse-all")`     | the Collapse all button                                              |
| `getByTestId("selected-path")`    | the selected file's full path, as text                               |

// A node is a folder when it has `children` (possibly empty), otherwise a file.
// The children are deliberately unsorted: sorting is part of the challenge.
export type Node = { name: string; children?: Node[] };

export const ROOT: Node = {
  name: "project",
  children: [
    { name: "tsconfig.json" },
    {
      name: "src",
      children: [
        { name: "main.tsx" },
        {
          name: "utils",
          children: [{ name: "format.ts" }, { name: "dates.ts" }],
        },
        { name: "index.css" },
        {
          name: "components",
          children: [{ name: "Modal.tsx" }, { name: "Button.tsx" }],
        },
        { name: "App.tsx" },
      ],
    },
    { name: "README.md" },
    { name: "scripts", children: [] },
    {
      name: "public",
      children: [{ name: "index.html" }, { name: "favicon.ico" }],
    },
    { name: "package.json" },
  ],
};

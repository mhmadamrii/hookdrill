import React from "react";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

type View = ReturnType<typeof within>;

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// `delay: null` skips user-event's setTimeout between actions: browsers throttle
// timers in background tabs, which would otherwise slow runs to a crawl.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const user = userEvent.setup({ document, delay: null });
  const { container } = render(<App />);
  const view = within(container);
  const item = (name: string) => view.getByRole("treeitem", { name });
  // Click the node's own name (the deepest element whose text is exactly the
  // name), so the click lands wherever the user put the handler.
  const clickNode = async (name: string) => {
    const el = item(name);
    const labels = within(el).queryAllByText(name);
    await user.click(labels.length ? labels[labels.length - 1] : el);
  };
  return { user, view, item, clickNode, container };
}

const ALL_NAMES = [
  "project",
  "public",
  "index.html",
  "favicon.ico",
  "scripts",
  "src",
  "components",
  "Button.tsx",
  "Modal.tsx",
  "utils",
  "dates.ts",
  "format.ts",
  "App.tsx",
  "index.css",
  "main.tsx",
  "package.json",
  "README.md",
  "tsconfig.json",
];
// Accessible names of the rendered tree items, in document order.
const names = (view: View) => {
  const byElement = new Map<HTMLElement, string>();
  for (const name of ALL_NAMES) {
    const el = view.queryByRole("treeitem", { name });
    if (el) byElement.set(el, name);
  }
  return view.getAllByRole("treeitem").map((el) => byElement.get(el) ?? "?");
};
const selectedItems = (view: View) =>
  view
    .getAllByRole("treeitem")
    .filter((t) => t.getAttribute("aria-selected") === "true");
const text = (view: View, id: string) =>
  (view.getByTestId(id).textContent ?? "").trim();

afterEach(cleanup);

// Every test must fail against starter/App.tsx and pass against solution/App.tsx.
describe("File Explorer Tree", () => {
  it("renders a tree with only the root expanded, folders first", () => {
    const { view, item } = setup();
    expect(view.getByRole("tree")).toBeTruthy();

    const root = item("project");
    expect(root.getAttribute("aria-level")).toBe("1");
    expect(root.getAttribute("aria-expanded")).toBe("true");

    expect(names(view)).toEqual([
      "project",
      "public",
      "scripts",
      "src",
      "package.json",
      "README.md",
      "tsconfig.json",
    ]);
    expect(item("src").getAttribute("aria-level")).toBe("2");
    expect(item("src").getAttribute("aria-expanded")).toBe("false");
    expect(item("package.json").getAttribute("aria-level")).toBe("2");
    expect(item("package.json").hasAttribute("aria-expanded")).toBe(false);
  });

  it("expands a folder on click and sorts its children", async () => {
    const { view, item, clickNode } = setup();
    await clickNode("src");

    expect(item("src").getAttribute("aria-expanded")).toBe("true");
    expect(names(view)).toEqual([
      "project",
      "public",
      "scripts",
      "src",
      "components",
      "utils",
      "App.tsx",
      "index.css",
      "main.tsx",
      "package.json",
      "README.md",
      "tsconfig.json",
    ]);
    expect(item("components").getAttribute("aria-level")).toBe("3");
    expect(item("App.tsx").getAttribute("aria-level")).toBe("3");
  });

  it("collapses a folder and remembers its open descendants", async () => {
    const { view, item, clickNode } = setup();
    await clickNode("src");
    await clickNode("components");
    expect(item("Button.tsx").getAttribute("aria-level")).toBe("4");

    await clickNode("src");
    expect(item("src").getAttribute("aria-expanded")).toBe("false");
    expect(view.queryByRole("treeitem", { name: "Button.tsx" })).toBeNull();
    expect(view.queryByRole("treeitem", { name: "components" })).toBeNull();

    await clickNode("src");
    expect(item("components").getAttribute("aria-expanded")).toBe("true");
    expect(item("Button.tsx")).toBeTruthy();
    expect(item("Modal.tsx")).toBeTruthy();
  });

  it("selects one file at a time and shows its full path", async () => {
    const { view, item, clickNode } = setup();
    await clickNode("src");
    await clickNode("components");
    await clickNode("Button.tsx");

    expect(selectedItems(view)).toEqual([item("Button.tsx")]);
    expect(text(view, "selected-path")).toBe(
      "project/src/components/Button.tsx",
    );

    await clickNode("README.md");
    expect(selectedItems(view)).toEqual([item("README.md")]);
    expect(text(view, "selected-path")).toBe("project/README.md");
  });

  it("expands and collapses everything", async () => {
    const { user, view, item } = setup();
    await user.click(view.getByTestId("expand-all"));

    expect(view.getAllByRole("treeitem")).toHaveLength(18);
    for (const folder of ["public", "scripts", "src", "components", "utils"]) {
      expect(item(folder).getAttribute("aria-expanded")).toBe("true");
    }
    expect(item("dates.ts").getAttribute("aria-level")).toBe("4");
    expect(item("favicon.ico").getAttribute("aria-level")).toBe("3");

    await user.click(view.getByTestId("collapse-all"));
    expect(item("project").getAttribute("aria-expanded")).toBe("true");
    expect(names(view)).toHaveLength(7);
    expect(item("src").getAttribute("aria-expanded")).toBe("false");
  });

  it("shows (empty) inside an expanded empty folder", async () => {
    const { view, item, clickNode, container } = setup();
    expect(item("scripts").getAttribute("aria-expanded")).toBe("false");
    expect(container.textContent).not.toContain("(empty)");

    await clickNode("scripts");
    expect(item("scripts").getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain("(empty)");
    expect(view.getAllByRole("treeitem")).toHaveLength(7);
  });
});

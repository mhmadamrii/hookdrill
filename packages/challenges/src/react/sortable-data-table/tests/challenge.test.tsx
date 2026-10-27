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
  const sortBy = (column: string) =>
    user.click(view.getByTestId(`sort-${column}`));
  return { user, view, sortBy };
}

const ids = (view: View) =>
  view.queryAllByTestId("row").map((r) => Number(r.getAttribute("data-id")));
const ariaSort = (view: View, column: string) =>
  view.getByTestId(`sort-${column}`).closest("th")?.getAttribute("aria-sort");
const text = (view: View, id: string) =>
  (view.getByTestId(id).textContent ?? "").trim();

afterEach(cleanup);

describe("Sortable Data Table", () => {
  it("starts in the original order with no column sorted", () => {
    const { view } = setup();
    expect(ids(view)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const column of ["name", "age", "joined"])
      expect(ariaSort(view, column)).toBe("none");
  });

  it("sorts numbers numerically, then reverses on a second click", async () => {
    const { view, sortBy } = setup();
    await sortBy("age");
    // 9 before 19 before 100: compared as numbers, not text.
    // The two 27-year-olds (4, 6) keep their original order.
    expect(ids(view)).toEqual([2, 8, 4, 6, 1, 5, 7, 3]);
    expect(ariaSort(view, "age")).toBe("ascending");

    await sortBy("age");
    expect(ids(view)).toEqual([3, 7, 5, 1, 4, 6, 8, 2]);
    expect(ariaSort(view, "age")).toBe("descending");
  });

  it("sorts names ignoring case", async () => {
    const { view, sortBy } = setup();
    await sortBy("name");
    // Aisha, bruno, Diego, Hana, Lukas, Maya, Omar, zoe
    expect(ids(view)).toEqual([3, 2, 6, 7, 4, 1, 8, 5]);
  });

  it("sorts by date joined", async () => {
    const { view, sortBy } = setup();
    await sortBy("joined");
    expect(ids(view)).toEqual([7, 3, 5, 1, 6, 4, 2, 8]);
  });

  it("starts a new column ascending and clears the old one", async () => {
    const { view, sortBy } = setup();
    await sortBy("age");
    await sortBy("age");
    await sortBy("name");

    expect(ariaSort(view, "name")).toBe("ascending");
    expect(ariaSort(view, "age")).toBe("none");
    expect(ids(view)[0]).toBe(3);
  });

  it("filters by name and keeps the sort", async () => {
    const { user, view, sortBy } = setup();
    await sortBy("age");
    await user.type(view.getByTestId("filter-input"), "MA");

    // Omar (19), Maya (34) and zoe Martin (41), youngest first
    expect(ids(view)).toEqual([8, 1, 5]);
    expect(text(view, "result-count")).toBe("Showing 3 of 8");
    expect(view.queryByTestId("empty-state")).toBeNull();

    await user.clear(view.getByTestId("filter-input"));
    await user.type(view.getByTestId("filter-input"), "nobody");
    expect(ids(view)).toEqual([]);
    expect(text(view, "result-count")).toBe("Showing 0 of 8");
    expect(view.queryByTestId("empty-state")).not.toBeNull();
  });
});

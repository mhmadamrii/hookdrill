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
  // Hold Shift for the click: user-event passes shiftKey: true to the click event.
  const addSort = async (column: string) => {
    await user.keyboard("{Shift>}");
    await user.click(view.getByTestId(`sort-${column}`));
    await user.keyboard("{/Shift}");
  };
  return { user, view, sortBy, addSort };
}

const COLUMNS = ["title", "priority", "due", "assignee"];

const ids = (view: View) =>
  view.queryAllByTestId("row").map((r) => Number(r.getAttribute("data-id")));
const th = (view: View, column: string) => {
  const cell = view.getByTestId(`sort-${column}`).closest("th");
  if (!cell) throw new Error(`sort-${column} is not inside a <th>`);
  return cell;
};
const ariaSort = (view: View, column: string) =>
  th(view, column).getAttribute("aria-sort");
// The rank badge text of each column, or null when it has none.
const ranks = (view: View) =>
  Object.fromEntries(
    COLUMNS.map((c) => {
      const badge = within(th(view, c)).queryByTestId("sort-rank");
      return [c, badge ? (badge.textContent ?? "").trim() : null];
    }),
  );

afterEach(cleanup);

// Every test must fail against starter/App.tsx and pass against solution/App.tsx.
describe("Multi-column Sort", () => {
  it("sorts by one column ignoring case, then reverses on a second click", async () => {
    const { view, sortBy } = setup();
    await sortBy("title");
    // add dark mode, Backup database, Clean up CSS, Design review, fix login bug,
    // Onboard intern, Refactor auth, Triage issues, Update deps, Write release notes.
    // Case-sensitive comparison would put every capitalised title first.
    expect(ids(view)).toEqual([5, 6, 7, 4, 2, 8, 9, 10, 3, 1]);
    expect(ariaSort(view, "title")).toBe("ascending");
    expect(ranks(view)).toEqual({
      title: "1",
      priority: null,
      due: null,
      assignee: null,
    });

    await sortBy("title");
    expect(ids(view)).toEqual([1, 3, 10, 9, 8, 2, 4, 7, 6, 5]);
    expect(ariaSort(view, "title")).toBe("descending");
  });

  it("orders priority High, Medium, Low", async () => {
    const { view, sortBy } = setup();
    await sortBy("priority");
    // Alphabetical would give High, Low, Medium. Ties keep the original order.
    expect(ids(view)).toEqual([2, 4, 6, 9, 1, 5, 8, 3, 7, 10]);

    await sortBy("priority");
    // Low first; ties still in original order (reversing the array would flip them).
    expect(ids(view)).toEqual([3, 7, 10, 1, 5, 8, 2, 4, 6, 9]);
    expect(ariaSort(view, "priority")).toBe("descending");
  });

  it("puts empty due dates and assignees last in both directions", async () => {
    const { view, sortBy } = setup();
    await sortBy("due");
    // 02-20, 02-28, 03-01, 03-05 (2, 6), 03-10 (1, 10), then no date (3, 4, 8).
    expect(ids(view)).toEqual([9, 5, 7, 2, 6, 1, 10, 3, 4, 8]);
    await sortBy("due");
    // Negating the whole comparison would move the empty dates to the top.
    expect(ids(view)).toEqual([1, 10, 2, 6, 7, 5, 9, 3, 4, 8]);

    await sortBy("assignee");
    // Aisha, aisha, Aisha, bruno, maya, maya, Omar, Omar, then unassigned (4, 7).
    expect(ids(view)).toEqual([5, 6, 10, 3, 1, 9, 2, 8, 4, 7]);
    await sortBy("assignee");
    expect(ids(view)).toEqual([2, 8, 1, 9, 3, 5, 6, 10, 4, 7]);
  });

  it("shift+click adds tie-breakers in order", async () => {
    const { view, sortBy, addSort } = setup();
    await sortBy("priority");
    await addSort("due");
    // Within each priority, by due date with empty dates last:
    // High 9, 2, 6, 4 | Medium 5, 1, 8 | Low 7, 10, 3.
    expect(ids(view)).toEqual([9, 2, 6, 4, 5, 1, 8, 7, 10, 3]);

    await addSort("assignee");
    // 2 (Omar) and 6 (aisha) share High and 03-05: assignee now puts 6 first.
    expect(ids(view)).toEqual([9, 6, 2, 4, 5, 1, 8, 7, 10, 3]);
    expect(ranks(view)).toEqual({
      title: null,
      priority: "1",
      due: "2",
      assignee: "3",
    });
    // Only the primary column is announced.
    expect(ariaSort(view, "priority")).toBe("ascending");
    expect(ariaSort(view, "due")).toBe("none");
    expect(ariaSort(view, "assignee")).toBe("none");
    expect(ariaSort(view, "title")).toBe("none");
  });

  it("shift+click on a sorted column flips only its direction", async () => {
    const { view, sortBy, addSort } = setup();
    await sortBy("priority");
    await addSort("due");
    await addSort("due");
    // Priority still ascending; due descending inside each priority, empties still last.
    // High 2, 6 (tie, original order), 9, 4 | Medium 1, 5, 8 | Low 10, 7, 3.
    expect(ids(view)).toEqual([2, 6, 9, 4, 1, 5, 8, 10, 7, 3]);
    expect(ranks(view)).toEqual({
      title: null,
      priority: "1",
      due: "2",
      assignee: null,
    });
    expect(ariaSort(view, "priority")).toBe("ascending");
    expect(ariaSort(view, "due")).toBe("none");
  });

  it("a plain click replaces a multi-column sort", async () => {
    const { view, sortBy, addSort } = setup();
    await sortBy("priority");
    await addSort("due");
    await sortBy("due");
    // Due was not the primary column, so it starts ascending, alone.
    expect(ids(view)).toEqual([9, 5, 7, 2, 6, 1, 10, 3, 4, 8]);
    expect(ranks(view)).toEqual({
      title: null,
      priority: null,
      due: "1",
      assignee: null,
    });
    expect(ariaSort(view, "due")).toBe("ascending");
    expect(ariaSort(view, "priority")).toBe("none");
  });

  it("clear sort restores the original order", async () => {
    const { user, view, sortBy, addSort } = setup();
    await sortBy("assignee");
    await addSort("title");
    // maya: Refactor auth (9) before Write release notes (1).
    expect(ids(view)).toEqual([5, 6, 10, 3, 9, 1, 2, 8, 7, 4]);

    // A plain click on the primary column flips it (and drops the title
    // tie-breaker); a second click returns to ascending: 1 before 9 again.
    await sortBy("assignee");
    await sortBy("assignee");
    expect(ids(view)).toEqual([5, 6, 10, 3, 1, 9, 2, 8, 4, 7]);

    await user.click(view.getByTestId("clear-sort"));
    expect(ids(view)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(ranks(view)).toEqual({
      title: null,
      priority: null,
      due: null,
      assignee: null,
    });
    for (const column of COLUMNS) expect(ariaSort(view, column)).toBe("none");
  });
});

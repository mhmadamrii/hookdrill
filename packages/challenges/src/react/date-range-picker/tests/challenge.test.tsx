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
// Every test passes `initialMonth`, so results don't depend on today's date.
function setup(initialMonth: string) {
  const user = userEvent.setup({ document, delay: null });
  const { container } = render(<App initialMonth={initialMonth} />);
  const view = within(container);
  const day = (name: string) => view.getByRole("gridcell", { name });
  const clickDay = (name: string) => user.click(day(name));
  return { user, view, day, clickDay };
}

const text = (view: View, id: string) =>
  (view.getByTestId(id).textContent ?? "").trim();
const nights = (view: View) => {
  const el = view.queryByTestId("nights");
  return el ? (el.textContent ?? "").trim() : null;
};
const selectedDays = (view: View) =>
  view
    .getAllByRole("gridcell")
    .filter((c) => c.getAttribute("aria-selected") === "true");
const tabStops = (view: View) =>
  view
    .getAllByRole("gridcell")
    .filter((c) => c.getAttribute("tabindex") === "0");
const weekRows = (view: View) =>
  view
    .getAllByRole("row")
    .filter((r) => within(r).queryAllByRole("gridcell").length > 0);

afterEach(cleanup);

// Every test must fail against starter/App.tsx and pass against solution/App.tsx.
describe("Date Range Picker", () => {
  it("renders the month as a Sunday-first grid of days", () => {
    const { view, day } = setup("2026-02");
    expect(text(view, "month-label")).toBe("February 2026");
    expect(view.getByRole("grid")).toBeTruthy();
    expect(view.getAllByRole("gridcell")).toHaveLength(28);
    expect(day("February 1, 2026")).toBeTruthy();
    expect(day("February 28, 2026")).toBeTruthy();
    // February 2026 starts on a Sunday: exactly four weeks.
    expect(weekRows(view)).toHaveLength(4);
    cleanup();

    const april = setup("2026-04");
    expect(text(april.view, "month-label")).toBe("April 2026");
    expect(april.view.getAllByRole("gridcell")).toHaveLength(30);
    // April 1, 2026 is a Wednesday, so the first week holds April 1 to 4.
    const firstWeek = within(weekRows(april.view)[0]).getAllByRole("gridcell");
    expect(firstWeek).toEqual([
      april.day("April 1, 2026"),
      april.day("April 2, 2026"),
      april.day("April 3, 2026"),
      april.day("April 4, 2026"),
    ]);
  });

  it("moves between months with the prev and next buttons", async () => {
    const { user, view, day } = setup("2026-01");
    expect(text(view, "month-label")).toBe("January 2026");

    await user.click(view.getByTestId("next-month"));
    await user.click(view.getByTestId("next-month"));
    expect(text(view, "month-label")).toBe("March 2026");
    expect(view.getAllByRole("gridcell")).toHaveLength(31);
    expect(day("March 31, 2026")).toBeTruthy();

    await user.click(view.getByTestId("prev-month"));
    await user.click(view.getByTestId("prev-month"));
    await user.click(view.getByTestId("prev-month"));
    expect(text(view, "month-label")).toBe("December 2025");
    expect(day("December 25, 2025")).toBeTruthy();
  });

  it("selects a range with two clicks", async () => {
    const { view, day, clickDay } = setup("2026-02");
    expect(text(view, "range-output")).toBe("Pick a start date");
    expect(nights(view)).toBeNull();
    expect(selectedDays(view)).toEqual([]);

    await clickDay("February 3, 2026");
    expect(selectedDays(view)).toEqual([day("February 3, 2026")]);
    expect(text(view, "range-output")).toBe("Pick an end date");
    expect(nights(view)).toBeNull();

    await clickDay("February 10, 2026");
    expect(selectedDays(view)).toEqual([
      day("February 3, 2026"),
      day("February 4, 2026"),
      day("February 5, 2026"),
      day("February 6, 2026"),
      day("February 7, 2026"),
      day("February 8, 2026"),
      day("February 9, 2026"),
      day("February 10, 2026"),
    ]);
    expect(day("February 11, 2026").getAttribute("aria-selected")).not.toBe(
      "true",
    );
    expect(text(view, "range-output")).toBe("Feb 3, 2026 – Feb 10, 2026");
    expect(nights(view)).toBe("7 nights");
  });

  it("swaps a reversed range and starts over on the third click", async () => {
    const { view, day, clickDay } = setup("2026-02");
    await clickDay("February 20, 2026");
    await clickDay("February 14, 2026");
    expect(text(view, "range-output")).toBe("Feb 14, 2026 – Feb 20, 2026");
    expect(nights(view)).toBe("6 nights");
    expect(selectedDays(view)).toHaveLength(7);

    await clickDay("February 2, 2026");
    expect(selectedDays(view)).toEqual([day("February 2, 2026")]);
    expect(text(view, "range-output")).toBe("Pick an end date");
    expect(nights(view)).toBeNull();

    await clickDay("February 2, 2026");
    expect(text(view, "range-output")).toBe("Feb 2, 2026 – Feb 2, 2026");
    expect(nights(view)).toBe("0 nights");
  });

  it("keeps a range that spans two months", async () => {
    const { user, view, day, clickDay } = setup("2026-02");
    await clickDay("February 27, 2026");
    await user.click(view.getByTestId("next-month"));
    await clickDay("March 10, 2026");

    expect(text(view, "range-output")).toBe("Feb 27, 2026 – Mar 10, 2026");
    expect(nights(view)).toBe("11 nights");
    expect(selectedDays(view)).toHaveLength(10);
    expect(day("March 11, 2026").getAttribute("aria-selected")).not.toBe(
      "true",
    );

    await user.click(view.getByTestId("prev-month"));
    expect(selectedDays(view)).toEqual([
      day("February 27, 2026"),
      day("February 28, 2026"),
    ]);
  });

  it("roves the tabindex and crosses months with the arrow keys", async () => {
    const { user, view, day, clickDay } = setup("2026-02");
    expect(tabStops(view)).toEqual([day("February 1, 2026")]);

    await clickDay("February 27, 2026");
    expect(tabStops(view)).toEqual([day("February 27, 2026")]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(day("February 28, 2026"));
    expect(tabStops(view)).toEqual([day("February 28, 2026")]);

    await user.keyboard("{ArrowRight}");
    expect(text(view, "month-label")).toBe("March 2026");
    expect(document.activeElement).toBe(day("March 1, 2026"));
    expect(tabStops(view)).toEqual([day("March 1, 2026")]);

    await user.keyboard("{ArrowLeft}");
    expect(text(view, "month-label")).toBe("February 2026");
    expect(document.activeElement).toBe(day("February 28, 2026"));

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(day("February 21, 2026"));
    // Moving focus doesn't change the selection.
    expect(selectedDays(view)).toEqual([day("February 27, 2026")]);
  });

  it("moves by week with Up/Down and selects with Enter and Space", async () => {
    const { user, view, day } = setup("2026-02");
    day("February 1, 2026").focus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(day("February 15, 2026"));

    await user.keyboard("{Enter}");
    expect(selectedDays(view)).toEqual([day("February 15, 2026")]);
    expect(text(view, "range-output")).toBe("Pick an end date");

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(day("February 16, 2026"));
    await user.keyboard(" ");
    expect(text(view, "range-output")).toBe("Feb 15, 2026 – Feb 16, 2026");
    expect(nights(view)).toBe("1 night");

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    expect(text(view, "month-label")).toBe("March 2026");
    expect(document.activeElement).toBe(day("March 2, 2026"));
  });
});

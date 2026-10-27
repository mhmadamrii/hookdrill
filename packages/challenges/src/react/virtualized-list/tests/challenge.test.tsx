import React from "react";
import { fireEvent, render, within, cleanup } from "@testing-library/react";
import App from "../App";

type View = ReturnType<typeof within>;

// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const { container } = render(<App />);
  const view = within(container);
  const viewport = view.getByTestId("viewport");
  // The test runner has no layout, so the browser can't scroll for real:
  // pin scrollTop to the value under test, then fire the scroll event.
  const scrollTo = (top: number) => {
    Object.defineProperty(viewport, "scrollTop", {
      configurable: true,
      value: top,
    });
    fireEvent.scroll(viewport);
  };
  return { view, scrollTo };
}

const indexes = (view: View) =>
  view.queryAllByTestId("row").map((r) => Number(r.getAttribute("data-index")));
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

afterEach(cleanup);

describe("Virtualized List", () => {
  it("renders only the first screen of rows plus overscan", () => {
    const { view } = setup();
    // Rows 0–9 fill the 320px viewport; 3 more below as overscan.
    expect(indexes(view)).toEqual(range(0, 12));
  });

  it("makes the spacer as tall as the whole list", () => {
    const { view } = setup();
    expect(view.getByTestId("spacer").style.height).toBe("320000px");
  });

  it("renders the rows around the scroll position", () => {
    const { view, scrollTo } = setup();
    scrollTo(3200); // row 100 at the top
    expect(indexes(view)).toEqual(range(97, 112));
  });

  it("includes partly visible rows at both edges", () => {
    const { view, scrollTo } = setup();
    scrollTo(3210); // row 100 is cut off at the top, row 110 at the bottom
    expect(indexes(view)).toEqual(range(97, 113));
  });

  it("shows the right item in each row", () => {
    const { view, scrollTo } = setup();
    scrollTo(4999 * 32);
    const row = view
      .getAllByTestId("row")
      .find((r) => r.getAttribute("data-index") === "4999");
    expect((row?.textContent ?? "").trim()).toBe("Order #05000");
  });

  it("stops at the ends of the list", () => {
    const { view, scrollTo } = setup();
    scrollTo(320000 - 320);
    expect(indexes(view)).toEqual(range(9987, 9999));

    scrollTo(0);
    expect(indexes(view)).toEqual(range(0, 12));
  });
});

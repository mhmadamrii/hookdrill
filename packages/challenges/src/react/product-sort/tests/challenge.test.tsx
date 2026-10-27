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
  const sortBy = (value: string) =>
    user.selectOptions(view.getByTestId("sort-select"), value);
  return { user, view, sortBy };
}

const ids = (view: View) =>
  view
    .queryAllByTestId("product")
    .map((p) => Number(p.getAttribute("data-id")));
const prices = (view: View) =>
  view
    .queryAllByTestId("product")
    .map((p) => (within(p).getByTestId("price").textContent ?? "").trim());

afterEach(cleanup);

// Data traps (see products.ts):
// - 999, 1250, 10000 cents: compared as strings, "10000" < "1250" < "999".
// - Canvas Tote (1) and Ceramic Mug (5) both cost 2499: ties keep featured order,
//   even in price-desc (reversing the ascending list would swap them).
// - Ratings 4.8 (2, 4), 4.5 (1, 6) and 3.9 (5, 8) are tied pairs.
describe("Product Sort", () => {
  it("sorts by price, low to high, as numbers, and formats prices", async () => {
    const { view, sortBy } = setup();
    await sortBy("price-asc");
    expect(ids(view)).toEqual([8, 2, 4, 6, 1, 5, 7, 3]);
    expect(prices(view)).toEqual([
      "$4.50",
      "$9.99",
      "$12.50",
      "$19.99",
      "$24.99",
      "$24.99",
      "$89.99",
      "$100.00",
    ]);
  });

  it("sorts by price, high to low, keeping ties in featured order", async () => {
    const { view, sortBy } = setup();
    await sortBy("price-desc");
    // The two $24.99 items stay 1 then 5.
    expect(ids(view)).toEqual([3, 7, 1, 5, 6, 4, 2, 8]);
  });

  it("sorts by rating, highest first, keeping ties in featured order", async () => {
    const { view, sortBy } = setup();
    await sortBy("rating");
    // 4.8 (2, 4), 4.6, 4.5 (1, 6), 4.2, 3.9 (5, 8)
    expect(ids(view)).toEqual([2, 4, 7, 1, 6, 3, 5, 8]);
  });

  it("sorts by newest first", async () => {
    const { view, sortBy } = setup();
    await sortBy("newest");
    // 2024-09-01, 06-18, 03-10, 02-29, 01-15, 2023-11-02, 2023-07-07, 2022-12-24
    expect(ids(view)).toEqual([5, 3, 1, 7, 4, 2, 8, 6]);
  });

  it("starts on featured and restores the original order when chosen again", async () => {
    const { view, sortBy } = setup();
    const select = view.getByTestId("sort-select") as HTMLSelectElement;
    expect(select.value).toBe("featured");
    expect(ids(view)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

    await sortBy("price-asc");
    expect(ids(view)).toEqual([8, 2, 4, 6, 1, 5, 7, 3]);

    // Sorting PRODUCTS in place would leave it in price order here.
    await sortBy("featured");
    expect(select.value).toBe("featured");
    expect(ids(view)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(prices(view)[0]).toBe("$24.99");
  });
});

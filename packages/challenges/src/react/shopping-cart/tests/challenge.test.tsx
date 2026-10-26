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

  const byId = (testId: string, id: string) => {
    const el = view
      .queryAllByTestId(testId)
      .find((e) => e.getAttribute("data-id") === id);
    if (!el) throw new Error(`No ${testId} with data-id="${id}"`);
    return el;
  };
  const add = (id: string) =>
    user.click(within(byId("product", id)).getByTestId("add-button"));
  const pressOnItem = (id: string, button: string) =>
    user.click(within(byId("cart-item", id)).getByTestId(button));

  return { view, add, pressOnItem, byId };
}

const items = (view: View) =>
  view.queryAllByTestId("cart-item").map((el) => el.getAttribute("data-id"));
const quantity = (el: HTMLElement) =>
  (within(el).getByTestId("item-quantity").textContent ?? "").trim();
const text = (view: View, id: string) =>
  (view.getByTestId(id).textContent ?? "").trim();

afterEach(cleanup);

describe("Shopping Cart", () => {
  it("adds products to the end of the cart", async () => {
    const { view, add, byId } = setup();
    await add("bread");
    await add("apple");

    expect(items(view)).toEqual(["bread", "apple"]);
    expect(quantity(byId("cart-item", "bread"))).toBe("1");
    expect(view.queryByTestId("empty-cart")).toBeNull();
  });

  it("raises the quantity when a product is added again", async () => {
    const { view, add, byId } = setup();
    await add("apple");
    await add("apple");

    expect(items(view)).toEqual(["apple"]);
    expect(quantity(byId("cart-item", "apple"))).toBe("2");
    expect(text(view, "cart-count")).toBe("2");
  });

  it("changes quantities with + and −", async () => {
    const { add, pressOnItem, byId } = setup();
    await add("milk");
    await pressOnItem("milk", "increase-button");
    await pressOnItem("milk", "increase-button");
    expect(quantity(byId("cart-item", "milk"))).toBe("3");

    await pressOnItem("milk", "decrease-button");
    expect(quantity(byId("cart-item", "milk"))).toBe("2");
  });

  it("removes an item when − is pressed at quantity 1", async () => {
    const { view, add, pressOnItem } = setup();
    await add("apple");
    await pressOnItem("apple", "decrease-button");

    expect(items(view)).toEqual([]);
    expect(text(view, "cart-count")).toBe("0");
    expect(view.queryByTestId("empty-cart")).not.toBeNull();
  });

  it("removes one item and keeps the others intact", async () => {
    const { view, add, pressOnItem, byId } = setup();
    await add("apple");
    await add("bread");
    await add("coffee");
    await pressOnItem("bread", "increase-button");
    await pressOnItem("apple", "increase-button");

    await pressOnItem("bread", "remove-button");

    expect(items(view)).toEqual(["apple", "coffee"]);
    expect(quantity(byId("cart-item", "apple"))).toBe("2");
    expect(quantity(byId("cart-item", "coffee"))).toBe("1");
  });

  it("totals the item count and price", async () => {
    const { view, add, pressOnItem } = setup();
    await add("apple");
    await add("bread");
    await pressOnItem("apple", "increase-button");
    await pressOnItem("apple", "increase-button");

    // 3 × $0.50 + 1 × $2.25
    expect(text(view, "cart-count")).toBe("4");
    expect(text(view, "cart-total")).toBe("$3.75");

    await add("coffee");
    expect(text(view, "cart-total")).toBe("$15.74");
  });
});

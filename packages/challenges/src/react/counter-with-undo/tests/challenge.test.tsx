import React from "react";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

type View = ReturnType<typeof within>;

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// `delay: null` skips user-event's setTimeout between actions: browsers throttle
// timers in background tabs, which otherwise pushes tests past Jest's 5s timeout.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const user = userEvent.setup({ document, delay: null });
  const { container } = render(<App />);
  const view = within(container);
  const press = (id: string) => user.click(view.getByTestId(id));
  return { view, press };
}

const count = (view: View) =>
  (view.getByTestId("count").textContent ?? "").trim();
const disabled = (view: View, id: string) =>
  (view.getByTestId(id) as HTMLButtonElement).disabled;

afterEach(cleanup);

describe("Counter with Undo", () => {
  it("counts up and down", async () => {
    const { view, press } = setup();
    await press("increment-button");
    await press("increment-button");
    await press("decrement-button");
    expect(count(view)).toBe("1");
  });

  it("starts with undo and redo disabled", async () => {
    const { view, press } = setup();
    expect(disabled(view, "undo-button")).toBe(true);
    expect(disabled(view, "redo-button")).toBe(true);

    await press("increment-button");

    expect(disabled(view, "undo-button")).toBe(false);
    expect(disabled(view, "redo-button")).toBe(true);
  });

  it("undoes back to the start", async () => {
    const { view, press } = setup();
    await press("increment-button");
    await press("increment-button");

    await press("undo-button");
    expect(count(view)).toBe("1");
    await press("undo-button");
    expect(count(view)).toBe("0");
    expect(disabled(view, "undo-button")).toBe(true);
  });

  it("redoes undone changes", async () => {
    const { view, press } = setup();
    await press("increment-button");
    await press("increment-button");
    await press("undo-button");
    await press("undo-button");

    await press("redo-button");
    expect(count(view)).toBe("1");
    await press("redo-button");
    expect(count(view)).toBe("2");
    expect(disabled(view, "redo-button")).toBe(true);
  });

  it("throws away redo after a new change", async () => {
    const { view, press } = setup();
    await press("increment-button");
    await press("increment-button");
    await press("undo-button");
    await press("decrement-button");

    expect(count(view)).toBe("0");
    expect(disabled(view, "redo-button")).toBe(true);
    await press("undo-button");
    expect(count(view)).toBe("1");
  });
});

import React from "react";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

type View = ReturnType<typeof within>;

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const user = userEvent.setup({ document });
  const { container } = render(<App />);
  return { user, view: within(container) };
}

const count = (view: View) =>
  (view.getByTestId("count").textContent ?? "").trim();

afterEach(cleanup);

// Every test must fail against starter/App.tsx and pass against solution/App.tsx.
describe("__TITLE__", () => {
  it("starts at 0 and increments", async () => {
    const { user, view } = setup();
    expect(count(view)).toBe("0");
    await user.click(view.getByTestId("increment-button"));
    await user.click(view.getByTestId("increment-button"));
    expect(count(view)).toBe("2");
  });

  it("decrements but never below 0", async () => {
    const { user, view } = setup();
    await user.click(view.getByTestId("increment-button"));
    expect(count(view)).toBe("1");
    await user.click(view.getByTestId("decrement-button"));
    await user.click(view.getByTestId("decrement-button"));
    expect(count(view)).toBe("0");
  });

  it("resets to 0", async () => {
    const { user, view } = setup();
    await user.click(view.getByTestId("increment-button"));
    await user.click(view.getByTestId("increment-button"));
    expect(count(view)).toBe("2");
    await user.click(view.getByTestId("reset-button"));
    expect(count(view)).toBe("0");
  });
});

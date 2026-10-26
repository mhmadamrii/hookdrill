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
  const type = (text: string) =>
    user.type(view.getByTestId("password-input"), text);
  return { user, view, type };
}

const met = (view: View, rule: string) =>
  view
    .getAllByTestId("rule")
    .find((el) => el.getAttribute("data-rule") === rule)
    ?.getAttribute("data-met");
const strength = (view: View) =>
  (view.getByTestId("strength").textContent ?? "").trim();

afterEach(cleanup);

describe("Password Strength Meter", () => {
  it("checks the length rule", async () => {
    const { view, type } = setup();
    await type("abcdefg");
    expect(met(view, "length")).toBe("false");
    await type("h");
    expect(met(view, "length")).toBe("true");
  });

  it("checks the number, uppercase and symbol rules", async () => {
    const { view, type } = setup();
    await type("a1");
    expect(met(view, "number")).toBe("true");
    expect(met(view, "uppercase")).toBe("false");
    expect(met(view, "symbol")).toBe("false");

    await type("B");
    expect(met(view, "uppercase")).toBe("true");
    await type("!");
    expect(met(view, "symbol")).toBe("true");
  });

  it("rates the strength by how many rules are met", async () => {
    const { view, type } = setup();
    expect(strength(view)).toBe("Weak");
    await type("abcdefgh");
    expect(strength(view)).toBe("Weak");
    await type("1");
    expect(strength(view)).toBe("Medium");
    await type("A");
    expect(strength(view)).toBe("Medium");
    await type("!");
    expect(strength(view)).toBe("Strong");
  });

  it("shows and hides the password", async () => {
    const { user, view } = setup();
    const input = view.getByTestId("password-input") as HTMLInputElement;
    const toggle = view.getByTestId("visibility-toggle");
    expect(input.type).toBe("password");

    await user.click(toggle);
    expect(input.type).toBe("text");
    expect((toggle.textContent ?? "").trim()).toBe("Hide");

    await user.click(toggle);
    expect(input.type).toBe("password");
    expect((toggle.textContent ?? "").trim()).toBe("Show");
  });
});

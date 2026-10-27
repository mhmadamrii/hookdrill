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
  const press = (id: string) => user.click(view.getByTestId(id));
  const fill = async (id: string, value: string) => {
    const input = view.getByTestId(id);
    await user.clear(input);
    await user.type(input, value);
  };
  const completeAccount = async () => {
    await fill("email-input", "ada@example.com");
    await fill("password-input", "correct horse");
    await press("next-button");
  };
  return { user, view, container, press, fill, completeAccount };
}

const text = (view: View, id: string) =>
  (view.getByTestId(id).textContent ?? "").trim();
const value = (view: View, id: string) =>
  (view.getByTestId(id) as HTMLInputElement).value;

afterEach(cleanup);

describe("Multi-step Form", () => {
  it("validates the account step before moving on", async () => {
    const { view, press, fill } = setup();
    expect(view.queryByTestId("email-error")).toBeNull();

    await press("next-button");
    expect(text(view, "step-indicator")).toBe("Step 1 of 3");
    expect(view.queryByTestId("email-error")).not.toBeNull();
    expect(view.queryByTestId("password-error")).not.toBeNull();
    expect(view.getByTestId("email-input").getAttribute("aria-invalid")).toBe(
      "true",
    );

    await fill("email-input", "ada@example");
    await fill("password-input", "short");
    await press("next-button");
    expect(text(view, "step-indicator")).toBe("Step 1 of 3");
    expect(view.queryByTestId("email-error")).not.toBeNull();
    expect(view.queryByTestId("password-error")).not.toBeNull();
  });

  it("moves to the profile step once the account step is valid", async () => {
    const { view, completeAccount } = setup();
    await completeAccount();

    expect(text(view, "step-indicator")).toBe("Step 2 of 3");
    expect(view.queryByTestId("name-input")).not.toBeNull();
    expect(view.queryByTestId("email-error")).toBeNull();
  });

  it("requires a name that isn't just spaces", async () => {
    const { view, press, fill, completeAccount } = setup();
    await completeAccount();
    await fill("name-input", "   ");
    await press("next-button");

    expect(text(view, "step-indicator")).toBe("Step 2 of 3");
    expect(view.queryByTestId("name-error")).not.toBeNull();
    expect(view.getByTestId("name-input").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("keeps what was typed when going back and forward", async () => {
    const { view, press, fill, completeAccount } = setup();
    await completeAccount();
    await fill("name-input", "Ada Lovelace");

    await press("back-button");
    expect(text(view, "step-indicator")).toBe("Step 1 of 3");
    expect(value(view, "email-input")).toBe("ada@example.com");
    expect(view.queryByTestId("back-button")).toBeNull();

    await press("next-button");
    expect(value(view, "name-input")).toBe("Ada Lovelace");
  });

  it("reviews the answers without showing the password", async () => {
    const { user, view, container, press, fill, completeAccount } = setup();
    await completeAccount();
    await fill("name-input", "  Ada Lovelace ");
    await user.selectOptions(view.getByTestId("plan-select"), "pro");
    await press("next-button");

    expect(text(view, "step-indicator")).toBe("Step 3 of 3");
    expect(text(view, "review-email")).toBe("ada@example.com");
    expect(text(view, "review-name")).toBe("Ada Lovelace");
    expect(text(view, "review-plan")).toBe("Pro");
    expect(container.textContent).not.toContain("correct horse");
  });

  it("submits from the review step", async () => {
    const { view, press, fill, completeAccount } = setup();
    await completeAccount();
    await fill("name-input", "Ada");
    await press("next-button");
    await press("submit-button");

    expect(text(view, "success-message")).toContain("Ada");
    expect(view.queryByTestId("step-indicator")).toBeNull();
    expect(view.queryByTestId("submit-button")).toBeNull();
  });
});

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
  const open = () => user.click(view.getByTestId("open-button"));
  return { user, view, open };
}

const focused = () => document.activeElement;
const dialogOpen = (view: View) => view.queryByRole("dialog") !== null;

afterEach(cleanup);

describe("Modal Focus Trap", () => {
  it("opens a labelled modal dialog and focuses the field", async () => {
    const { view, open } = setup();
    expect(dialogOpen(view)).toBe(false);
    await open();

    const dialog = view.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const title = document.getElementById(
      dialog.getAttribute("aria-labelledby") ?? "",
    );
    expect(title?.textContent).toBe("Edit display name");
    expect(focused()).toBe(view.getByTestId("name-input"));
  });

  it("keeps Tab and Shift+Tab inside the dialog", async () => {
    const { user, view, open } = setup();
    await open();
    const close = view.getByTestId("close-button");
    const save = view.getByTestId("save-button");

    await user.tab(); // input → Cancel
    await user.tab(); // Cancel → Save
    expect(focused()).toBe(save);
    await user.tab(); // wraps to the first control
    expect(focused()).toBe(close);

    await user.tab({ shift: true }); // wraps back to the last control
    expect(focused()).toBe(save);
  });

  it("closes on Escape and returns focus to the opener", async () => {
    const { user, view, open } = setup();
    await open();
    expect(dialogOpen(view)).toBe(true);
    await user.keyboard("{Escape}");

    expect(dialogOpen(view)).toBe(false);
    expect(focused()).toBe(view.getByTestId("open-button"));
  });

  it("closes from Cancel, × and the backdrop, but not from inside", async () => {
    const { user, view, open } = setup();
    for (const id of ["cancel-button", "close-button"]) {
      await open();
      expect(dialogOpen(view)).toBe(true);
      await user.click(view.getByTestId(id));
      expect(dialogOpen(view)).toBe(false);
      expect(focused()).toBe(view.getByTestId("open-button"));
    }

    await open();
    await user.click(view.getByRole("dialog"));
    expect(dialogOpen(view)).toBe(true);
    await user.click(view.getByTestId("backdrop"));
    expect(dialogOpen(view)).toBe(false);
  });

  it("hides the page behind the open dialog", async () => {
    const { view, open } = setup();
    const page = view.getByTestId("page");
    const hidden = () =>
      page.hasAttribute("inert") || page.getAttribute("aria-hidden") === "true";
    expect(hidden()).toBe(false);

    await open();
    expect(hidden()).toBe(true);
    expect(page.contains(view.getByRole("dialog"))).toBe(false);
  });

  it("saves the trimmed name and closes", async () => {
    const { user, view, open } = setup();
    await open();
    await user.type(view.getByTestId("name-input"), "  Grace  ");
    await user.click(view.getByTestId("save-button"));

    expect(dialogOpen(view)).toBe(false);
    expect(view.getByTestId("saved-name").textContent).toBe("Grace");
    expect(focused()).toBe(view.getByTestId("open-button"));
  });
});

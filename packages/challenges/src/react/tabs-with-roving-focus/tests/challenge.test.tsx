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
  const tab = (name: string) => view.getByRole("tab", { name });
  return { user, view, tab };
}

const selectedLabel = (view: View) =>
  view
    .getAllByRole("tab")
    .filter((t) => t.getAttribute("aria-selected") === "true")
    .map((t) => (t.textContent ?? "").trim());
const panelText = (view: View) =>
  (view.getByRole("tabpanel").textContent ?? "").trim();
const focusedLabel = () => (document.activeElement?.textContent ?? "").trim();

afterEach(cleanup);

describe("Tabs with Roving Focus", () => {
  it("links each tab to its panel with ARIA", () => {
    const { view, tab } = setup();
    expect(view.getAllByRole("tab")).toHaveLength(4);
    expect(view.getByRole("tablist")).toBeTruthy();

    const panel = view.getByRole("tabpanel");
    const overview = tab("Overview");
    expect(overview.getAttribute("aria-selected")).toBe("true");
    expect(tab("Specs").getAttribute("aria-selected")).toBe("false");
    expect(overview.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(overview.id);
    expect(panel.id).not.toBe("");
    expect(overview.id).not.toBe("");
  });

  it("selects a tab on click and shows its panel", async () => {
    const { user, view, tab } = setup();
    await user.click(tab("Shipping"));

    expect(selectedLabel(view)).toEqual(["Shipping"]);
    expect(panelText(view)).toBe("Ships in 2 to 3 business days.");
    expect(view.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(
      tab("Shipping").id,
    );
  });

  it("keeps only the selected tab in the tab order", async () => {
    const { user, view, tab } = setup();
    const tabIndexes = () =>
      view.getAllByRole("tab").map((t) => t.getAttribute("tabindex"));
    expect(tabIndexes()).toEqual(["0", "-1", "-1", "-1"]);

    await user.click(tab("Specs"));
    expect(tabIndexes()).toEqual(["-1", "0", "-1", "-1"]);
  });

  it("moves right with ArrowRight, skipping disabled tabs and wrapping", async () => {
    const { user, view, tab } = setup();
    await user.click(tab("Overview"));

    await user.keyboard("{ArrowRight}");
    expect(selectedLabel(view)).toEqual(["Specs"]);
    expect(focusedLabel()).toBe("Specs");

    await user.keyboard("{ArrowRight}");
    expect(selectedLabel(view)).toEqual(["Shipping"]);
    expect(focusedLabel()).toBe("Shipping");

    await user.keyboard("{ArrowRight}");
    expect(selectedLabel(view)).toEqual(["Overview"]);
    expect(focusedLabel()).toBe("Overview");
  });

  it("moves left with ArrowLeft, skipping disabled tabs and wrapping", async () => {
    const { user, view, tab } = setup();
    await user.click(tab("Overview"));

    await user.keyboard("{ArrowLeft}");
    expect(selectedLabel(view)).toEqual(["Shipping"]);
    await user.keyboard("{ArrowLeft}");
    expect(selectedLabel(view)).toEqual(["Specs"]);
    expect(focusedLabel()).toBe("Specs");
    expect(panelText(view)).toBe("75% layout, gasket mount, USB-C.");
  });

  it("jumps to the first and last tab with Home and End", async () => {
    const { user, view, tab } = setup();
    await user.click(tab("Specs"));

    await user.keyboard("{End}");
    expect(selectedLabel(view)).toEqual(["Shipping"]);
    expect(focusedLabel()).toBe("Shipping");

    await user.keyboard("{Home}");
    expect(selectedLabel(view)).toEqual(["Overview"]);
    expect(focusedLabel()).toBe("Overview");
  });
});

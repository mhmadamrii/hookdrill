import React from "react";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import App from "../App";
import { FAQ } from "../faq";

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
  return { user, view: within(container) };
}

const item = (view: View, i: number) =>
  within(view.getAllByTestId("accordion-item")[i]);
const trigger = (view: View, i: number) =>
  item(view, i).getByTestId("accordion-trigger");
const panel = (view: View, i: number) =>
  item(view, i).queryByTestId("accordion-panel");
const open = (user: UserEvent, view: View, i: number) =>
  user.click(trigger(view, i));

afterEach(cleanup);

describe("Accordion", () => {
  it("opens a section and shows its answer", async () => {
    const { user, view } = setup();
    expect(view.getAllByTestId("accordion-item")).toHaveLength(FAQ.length);
    expect(panel(view, 0)).toBeNull();

    await open(user, view, 0);

    expect(trigger(view, 0).getAttribute("aria-expanded")).toBe("true");
    expect(panel(view, 0)?.textContent).toContain(FAQ[0].answer);
  });

  it("closes the open section when its question is clicked again", async () => {
    const { user, view } = setup();
    await open(user, view, 1);
    expect(panel(view, 1)).not.toBeNull();

    await open(user, view, 1);

    expect(panel(view, 1)).toBeNull();
    expect(trigger(view, 1).getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps only one section open at a time", async () => {
    const { user, view } = setup();
    await open(user, view, 0);
    await open(user, view, 2);

    expect(panel(view, 0)).toBeNull();
    expect(trigger(view, 0).getAttribute("aria-expanded")).toBe("false");
    expect(panel(view, 2)?.textContent).toContain(FAQ[2].answer);
    expect(view.getAllByTestId("accordion-panel")).toHaveLength(1);
  });

  it("points each open question at its answer with aria-controls", async () => {
    const { user, view } = setup();
    await open(user, view, 1);

    const controls = trigger(view, 1).getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(panel(view, 1)?.id).toBe(controls);
  });
});

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
  // Clicking leaves the pointer over the star, which shows the hover preview.
  // Move it away before asserting on the saved rating.
  const leave = () => user.unhover(view.getByTestId("stars"));
  return { user, view, leave };
}

const star = (view: View, n: number) => view.getAllByTestId("star")[n - 1];
const filled = (view: View) =>
  view
    .getAllByTestId("star")
    .filter((s) => s.getAttribute("data-filled") === "true").length;
const label = (view: View) =>
  (view.getByTestId("rating-label").textContent ?? "").trim();

afterEach(cleanup);

describe("Star Rating", () => {
  it("rates by clicking a star", async () => {
    const { user, view, leave } = setup();
    expect(view.getAllByTestId("star")).toHaveLength(5);

    await user.click(star(view, 3));
    await leave();

    expect(label(view)).toBe("Rated 3 of 5");
    expect(filled(view)).toBe(3);
    expect(star(view, 4).getAttribute("data-filled")).toBe("false");
  });

  it("changes the rating when another star is clicked", async () => {
    const { user, view, leave } = setup();
    await user.click(star(view, 4));
    await user.click(star(view, 2));
    await leave();

    expect(label(view)).toBe("Rated 2 of 5");
    expect(filled(view)).toBe(2);
  });

  it("clears when the current star is clicked again", async () => {
    const { user, view, leave } = setup();
    await user.click(star(view, 2));
    expect(label(view)).toBe("Rated 2 of 5");

    await user.click(star(view, 2));
    await leave();

    expect(label(view)).toBe("Not rated");
    expect(filled(view)).toBe(0);
  });

  it("previews on hover without changing the rating", async () => {
    const { user, view, leave } = setup();
    await user.click(star(view, 1));

    await user.hover(star(view, 4));
    expect(filled(view)).toBe(4);
    expect(label(view)).toBe("Rated 1 of 5");

    await leave();
    expect(filled(view)).toBe(1);
  });
});

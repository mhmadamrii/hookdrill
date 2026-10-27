import React from "react";
import {
  act,
  render,
  within,
  cleanup,
  fireEvent,
} from "@testing-library/react";
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
  return { user, view: within(container) };
}

const column = (view: View, id: string) => {
  const found = view
    .getAllByTestId("column")
    .find((c) => c.getAttribute("data-id") === id);
  if (!found) throw new Error(`No column with data-id="${id}"`);
  return found;
};
const card = (view: View, id: string) => {
  const found = view
    .getAllByTestId("card")
    .find((c) => c.getAttribute("data-id") === id);
  if (!found) throw new Error(`No card with data-id="${id}"`);
  return found;
};
const cardIds = (view: View, columnId: string) =>
  within(column(view, columnId))
    .queryAllByTestId("card")
    .map((c) => c.getAttribute("data-id"));
const counts = (view: View) =>
  ["todo", "doing", "done"].map((id) =>
    (
      within(column(view, id)).getByTestId("column-count").textContent ?? ""
    ).trim(),
  );
const announced = (view: View) =>
  (view.getByTestId("announcer").textContent ?? "").trim();
const focusedId = () => document.activeElement?.getAttribute("data-id");
const focus = (el: HTMLElement) => act(() => el.focus());

// A tiny stand-in for the browser's DataTransfer, shared by one drag.
function fakeDataTransfer() {
  const store: Record<string, string> = {};
  return {
    setData: (type: string, value: string) => {
      store[type] = value;
    },
    getData: (type: string) => store[type] ?? "",
  };
}

function drag(source: HTMLElement, target: HTMLElement, columnEl: HTMLElement) {
  const dataTransfer = fakeDataTransfer();
  fireEvent.dragStart(source, { dataTransfer });
  // dragover must be cancelled (preventDefault) for the browser to allow a drop.
  const allowed = !fireEvent.dragOver(columnEl, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(source, { dataTransfer });
  return allowed;
}

afterEach(cleanup);

describe("Kanban Board", () => {
  it("renders the columns with their cards and counts", () => {
    const { view } = setup();
    expect(
      view.getAllByTestId("column").map((c) => c.getAttribute("data-id")),
    ).toEqual(["todo", "doing", "done"]);
    expect(
      within(column(view, "doing")).getByRole("heading").textContent,
    ).toContain("In progress");
    expect(cardIds(view, "todo")).toEqual(["c1", "c2", "c3"]);
    expect(cardIds(view, "doing")).toEqual(["c4", "c5"]);
    expect(cardIds(view, "done")).toEqual(["c6"]);
    expect(counts(view)).toEqual(["3", "2", "1"]);

    const first = card(view, "c1");
    expect(first.getAttribute("draggable")).toBe("true");
    expect(first.getAttribute("aria-pressed")).toBe("false");
    focus(first);
    expect(document.activeElement).toBe(first);
  });

  it("moves a dragged card to the end of the column it is dropped on", () => {
    const { view } = setup();
    const done = column(view, "done");
    expect(drag(card(view, "c1"), done, done)).toBe(true);
    expect(cardIds(view, "todo")).toEqual(["c2", "c3"]);
    expect(cardIds(view, "done")).toEqual(["c6", "c1"]);
    expect(counts(view)).toEqual(["2", "2", "2"]);

    // Dropping on a card inside the column also counts as the column.
    drag(card(view, "c4"), card(view, "c6"), column(view, "done"));
    expect(cardIds(view, "doing")).toEqual(["c5"]);
    expect(cardIds(view, "done")).toEqual(["c6", "c1", "c4"]);
    expect(counts(view)).toEqual(["2", "1", "3"]);
  });

  it("picks up with Space, moves across columns keeping the position, drops with Enter", async () => {
    const { user, view } = setup();
    await focus(card(view, "c2"));
    await user.keyboard("{ArrowRight}");
    expect(cardIds(view, "todo")).toEqual(["c1", "c2", "c3"]);

    await user.keyboard(" ");
    expect(card(view, "c2").getAttribute("aria-pressed")).toBe("true");
    await user.keyboard("{ArrowRight}");
    expect(cardIds(view, "todo")).toEqual(["c1", "c3"]);
    expect(cardIds(view, "doing")).toEqual(["c4", "c2", "c5"]);

    // Done has one card, so position 2 is clamped to the end.
    await user.keyboard("{ArrowRight}");
    expect(cardIds(view, "doing")).toEqual(["c4", "c5"]);
    expect(cardIds(view, "done")).toEqual(["c6", "c2"]);
    await user.keyboard("{ArrowRight}"); // already in the last column
    expect(cardIds(view, "done")).toEqual(["c6", "c2"]);

    await user.keyboard("{ArrowLeft}");
    expect(cardIds(view, "doing")).toEqual(["c4", "c2", "c5"]);

    await user.keyboard("{Enter}");
    expect(card(view, "c2").getAttribute("aria-pressed")).toBe("false");
    await user.keyboard("{ArrowRight}"); // dropped: arrows do nothing now
    expect(cardIds(view, "doing")).toEqual(["c4", "c2", "c5"]);
    expect(counts(view)).toEqual(["2", "3", "1"]);
  });

  it("reorders within a column with ArrowUp and ArrowDown", async () => {
    const { user, view } = setup();
    await focus(card(view, "c1"));
    await user.keyboard("{Enter}");
    expect(card(view, "c1").getAttribute("aria-pressed")).toBe("true");

    await user.keyboard("{ArrowDown}");
    expect(cardIds(view, "todo")).toEqual(["c2", "c1", "c3"]);
    await user.keyboard("{ArrowDown}{ArrowDown}"); // stops at the end
    expect(cardIds(view, "todo")).toEqual(["c2", "c3", "c1"]);
    await user.keyboard("{ArrowUp}");
    expect(cardIds(view, "todo")).toEqual(["c2", "c1", "c3"]);

    await user.keyboard(" ");
    expect(card(view, "c1").getAttribute("aria-pressed")).toBe("false");
    expect(cardIds(view, "todo")).toEqual(["c2", "c1", "c3"]);
  });

  it("puts the card back where it was on Escape", async () => {
    const { user, view } = setup();
    await focus(card(view, "c2"));
    await user.keyboard(" ");
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowUp}");
    expect(cardIds(view, "done")).toEqual(["c2", "c6"]);

    await user.keyboard("{Escape}");
    expect(cardIds(view, "todo")).toEqual(["c1", "c2", "c3"]);
    expect(cardIds(view, "doing")).toEqual(["c4", "c5"]);
    expect(cardIds(view, "done")).toEqual(["c6"]);
    expect(card(view, "c2").getAttribute("aria-pressed")).toBe("false");
    expect(focusedId()).toBe("c2");
  });

  it("keeps focus on the card while it moves", async () => {
    const { user, view } = setup();
    await focus(card(view, "c5"));
    await user.keyboard(" ");
    for (const key of [
      "{ArrowLeft}",
      "{ArrowDown}",
      "{ArrowRight}",
      "{ArrowRight}",
      "{ArrowUp}",
    ]) {
      await user.keyboard(key);
      expect(focusedId()).toBe("c5");
      expect(document.activeElement).toBe(card(view, "c5"));
    }
    expect(cardIds(view, "done")).toEqual(["c5", "c6"]);
    await user.keyboard(" ");
    expect(focusedId()).toBe("c5");
  });

  it("announces each step in an assertive live region", async () => {
    const { user, view } = setup();
    expect(view.getByTestId("announcer").getAttribute("aria-live")).toBe(
      "assertive",
    );
    await focus(card(view, "c1"));
    await user.keyboard(" ");
    expect(announced(view)).toBe("Picked up Write tests.");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(announced(view)).toBe("Write tests moved to Done, position 1 of 2.");
    await user.keyboard("{ArrowDown}");
    expect(announced(view)).toBe("Write tests moved to Done, position 2 of 2.");
    await user.keyboard(" ");
    expect(announced(view)).toBe("Write tests dropped.");

    await user.keyboard(" ");
    await user.keyboard("{Escape}");
    expect(announced(view)).toBe("Move cancelled.");
  });
});

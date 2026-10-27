import React from "react";
import { act, render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

type View = ReturnType<typeof within>;

// A fake search whose answers the test releases by hand, in any order.
function controlledSearch() {
  const calls: Array<{
    query: string;
    resolve: (results: string[]) => Promise<void>;
    reject: () => Promise<void>;
  }> = [];
  const search = (query: string) =>
    new Promise<string[]>((res, rej) => {
      calls.push({
        query,
        resolve: (results) => act(async () => res(results)),
        reject: () => act(async () => rej(new Error("Network error"))),
      });
    });
  return { search, calls };
}

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// `delay: null` skips user-event's setTimeout between actions: browsers throttle
// timers in background tabs, which would otherwise slow runs to a crawl.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const { search, calls } = controlledSearch();
  const user = userEvent.setup({ document, delay: null });
  const { container } = render(<App search={search} />);
  const view = within(container);
  const input = view.getByRole("combobox") as HTMLInputElement;
  const last = () => calls[calls.length - 1];
  return { user, view, input, calls, last };
}

const options = (view: View) =>
  view.queryAllByRole("option").map((o) => (o.textContent ?? "").trim());

afterEach(cleanup);

describe("Autocomplete Combobox", () => {
  it("is a collapsed combobox wired to a listbox", () => {
    const { view, input } = setup();
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-controls")).toBeTruthy();
    expect(view.queryByRole("listbox")).toBeNull();
  });

  it("searches as you type, shows loading, then the results", async () => {
    const { user, view, input, calls, last } = setup();
    await user.type(input, "ap");
    expect(calls.map((c) => c.query)).toEqual(["a", "ap"]);
    expect(view.queryByTestId("loading")).not.toBeNull();

    await last().resolve(["Apple", "Apricot"]);
    expect(view.queryByTestId("loading")).toBeNull();
    expect(options(view)).toEqual(["Apple", "Apricot"]);
    const listbox = view.getByRole("listbox");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
  });

  it("ignores answers to older queries", async () => {
    const { user, view, input, calls } = setup();
    await user.type(input, "ch");
    const [c, ch] = calls;
    expect([c.query, ch.query]).toEqual(["c", "ch"]);

    // The newer request answers first; the older one arrives late.
    await ch.resolve(["Cherry"]);
    await c.resolve(["Cherry", "Coconut", "Cranberry"]);
    expect(options(view)).toEqual(["Cherry"]);
    expect(view.queryByTestId("loading")).toBeNull();
  });

  it("moves through options with the arrow keys and picks with Enter", async () => {
    const { user, view, input, last } = setup();
    await user.type(input, "p");
    await last().resolve(["Papaya", "Peach", "Pear"]);

    await user.keyboard("{ArrowDown}{ArrowDown}");
    const peach = view.getByRole("option", { name: "Peach" });
    expect(peach.getAttribute("aria-selected")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBe(peach.id);
    expect(peach.id).not.toBe("");

    await user.keyboard("{ArrowUp}{ArrowUp}"); // wraps to the last option
    expect(input.getAttribute("aria-activedescendant")).toBe(
      view.getByRole("option", { name: "Pear" }).id,
    );

    await user.keyboard("{Enter}");
    expect(input.value).toBe("Pear");
    expect(view.queryByRole("listbox")).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect((view.getByTestId("selected").textContent ?? "").trim()).toBe(
      "Selected: Pear",
    );
  });

  it("picks with a click and closes with Escape", async () => {
    const { user, view, input, last } = setup();
    await user.type(input, "l");
    await last().resolve(["Lemon", "Lime", "Lychee"]);
    await user.keyboard("{Escape}");
    expect(view.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("l");

    await user.type(input, "i");
    await last().resolve(["Lime"]);
    await user.click(view.getByRole("option", { name: "Lime" }));
    expect(input.value).toBe("Lime");
    expect(view.queryByRole("listbox")).toBeNull();
  });

  it("handles no results, errors and an empty input", async () => {
    const { user, view, input, calls, last } = setup();
    await user.type(input, "x");
    await last().resolve([]);
    expect(view.queryByTestId("no-results")).not.toBeNull();
    expect(view.queryByRole("listbox")).toBeNull();

    await user.type(input, "y");
    await last().reject();
    expect(view.queryByTestId("error")).not.toBeNull();

    const before = calls.length;
    await user.clear(input);
    expect(calls.length).toBe(before);
    expect(view.queryByTestId("error")).toBeNull();
    expect(view.queryByTestId("no-results")).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});

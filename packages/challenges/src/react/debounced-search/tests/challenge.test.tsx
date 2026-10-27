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
// `delay: null` keeps user-event itself from waiting on timers.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const { search, calls } = controlledSearch();
  const user = userEvent.setup({ document, delay: null });
  const { container, unmount } = render(<App search={search} />);
  const view = within(container);
  const input = view.getByTestId("search-input") as HTMLInputElement;
  const queries = () => calls.map((c) => c.query);
  const last = () => calls[calls.length - 1];
  return { user, view, input, calls, queries, last, unmount };
}

/**
 * A hand-rolled fake clock, so the debounce runs in milliseconds and doesn't
 * depend on the tab being in front. Sandpack's in-browser Jest has no
 * fake-timer controls. Timers with a delay (setTimeout above 0, setInterval)
 * and Date.now only move when `tick` advances the clock. Zero-delay timeouts
 * stay real because Testing Library waits on them internally.
 *
 * The sandbox may evaluate this file more than once per run, so the clock
 * lives on one shared global instead of in module variables.
 */
type Timer = { at: number; every: number | null; run: () => void };
interface Clock {
  original: Record<
    "setTimeout" | "setInterval" | "clearTimeout" | "clearInterval",
    any
  > & {
    now: () => number;
  };
  now: number;
  nextId: number;
  timers: Map<number, Timer>;
}
const g = globalThis as any;
const clock: Clock = (g.__hookdrillClock ??= {
  original: {
    setTimeout: g.setTimeout,
    setInterval: g.setInterval,
    clearTimeout: g.clearTimeout,
    clearInterval: g.clearInterval,
    now: Date.now,
  },
  now: 0,
  nextId: 1_000_000_000, // far from real timer ids
  timers: new Map(),
});

function installClock() {
  const { original, timers } = clock;
  // Browser timer functions need `this` to be the window.
  const realSetTimeout = original.setTimeout.bind(g);
  const realClearTimeout = original.clearTimeout.bind(g);
  const realClearInterval = original.clearInterval.bind(g);
  const startedAt = original.now.call(Date);
  clock.now = 0;
  timers.clear();

  const schedule = (
    fn: Function,
    ms: number,
    every: number | null,
    args: unknown[],
  ) => {
    const id = clock.nextId++;
    timers.set(id, { at: clock.now + ms, every, run: () => fn(...args) });
    return id;
  };
  g.setTimeout = (fn: Function, ms = 0, ...args: unknown[]) =>
    ms > 0 ? schedule(fn, ms, null, args) : realSetTimeout(fn, ms, ...args);
  g.setInterval = (fn: Function, ms = 0, ...args: unknown[]) =>
    schedule(fn, Math.max(ms, 1), Math.max(ms, 1), args);
  g.clearTimeout = (id: any) => {
    if (!timers.delete(id)) realClearTimeout(id);
  };
  g.clearInterval = (id: any) => {
    if (!timers.delete(id)) realClearInterval(id);
  };
  Date.now = () => startedAt + clock.now;
}

function uninstallClock() {
  const { now, ...timerFns } = clock.original;
  Object.assign(g, timerFns);
  Date.now = now;
  clock.timers.clear();
}

/** Moves the fake clock forward by `ms` milliseconds, firing due timers in order. */
function tick(ms: number) {
  const target = clock.now + ms;
  for (;;) {
    let dueId: number | null = null;
    let due: Timer | null = null;
    for (const [id, t] of clock.timers)
      if (t.at <= target && (!due || t.at < due.at)) [dueId, due] = [id, t];
    if (dueId === null || !due) break;
    clock.now = due.at;
    if (due.every === null) clock.timers.delete(dueId);
    else due.at += due.every;
    const fire = due.run;
    act(() => fire());
  }
  clock.now = target;
}

const titles = (view: View) =>
  view.queryAllByTestId("result").map((r) => (r.textContent ?? "").trim());
const shown = (view: View, id: string) => view.queryByTestId(id) !== null;

beforeEach(installClock);

afterEach(() => {
  cleanup();
  uninstallClock();
});

// Every test must fail against starter/App.tsx and pass against solution/App.tsx.
describe("Debounced Search", () => {
  it("waits for a 300 ms pause, then searches once with the trimmed query", async () => {
    const { user, input, queries } = setup();
    await user.type(input, "rea ");
    expect(queries()).toEqual([]);

    tick(299);
    expect(queries()).toEqual([]);
    tick(1);
    expect(queries()).toEqual(["rea"]);

    tick(1000);
    expect(queries()).toEqual(["rea"]);
  });

  it("restarts the wait on every keystroke", async () => {
    const { user, input, queries } = setup();
    await user.type(input, "ha");
    tick(300);
    expect(queries()).toEqual(["ha"]);

    await user.type(input, "r");
    tick(200);
    await user.type(input, "r");
    tick(200);
    expect(queries()).toEqual(["ha"]);
    tick(100);
    expect(queries()).toEqual(["ha", "harr"]);
  });

  it("shows loading, then the results", async () => {
    const { user, view, input, last } = setup();
    await user.type(input, "the");
    tick(300);
    expect(shown(view, "loading")).toBe(true);

    await last().resolve(["The Hobbit", "The Road"]);
    expect(shown(view, "loading")).toBe(false);
    expect(titles(view)).toEqual(["The Hobbit", "The Road"]);
  });

  it("ignores an older search that answers late", async () => {
    const { user, view, input, calls } = setup();
    await user.type(input, "war");
    tick(300);
    await user.type(input, " and");
    tick(300);
    const [war, warAnd] = calls;
    expect([war?.query, warAnd?.query]).toEqual(["war", "war and"]);

    // The newer search answers first; the older one arrives late.
    await warAnd.resolve(["War and Peace"]);
    await war.resolve(["War and Peace", "Brave New World"]);
    expect(titles(view)).toEqual(["War and Peace"]);
    expect(shown(view, "loading")).toBe(false);
  });

  it("clearing the input cancels the pending search and clears the results", async () => {
    const { user, view, input, queries, last } = setup();
    await user.type(input, "dune");
    tick(300);
    await last().resolve(["Dune"]);
    expect(titles(view)).toEqual(["Dune"]);

    await user.type(input, "s");
    await user.clear(input);
    tick(1000);
    expect(queries()).toEqual(["dune"]);
    expect(titles(view)).toEqual([]);
    expect(shown(view, "loading")).toBe(false);

    await user.type(input, "   ");
    tick(1000);
    expect(queries()).toEqual(["dune"]);
  });

  it("shows a message for no results and for errors", async () => {
    const { user, view, input, last } = setup();
    await user.type(input, "xyz");
    tick(300);
    await last().resolve([]);
    expect(shown(view, "no-results")).toBe(true);
    expect(titles(view)).toEqual([]);

    await user.clear(input);
    await user.type(input, "emma");
    tick(300);
    await last().reject();
    expect(shown(view, "error")).toBe(true);
    expect(shown(view, "no-results")).toBe(false);
    expect(shown(view, "loading")).toBe(false);
  });

  it("cancels the pending search on unmount", async () => {
    const { user, input, queries, unmount } = setup();
    await user.type(input, "emma");
    tick(300);
    expect(queries()).toEqual(["emma"]);

    await user.type(input, "s");
    unmount();
    tick(1000);
    expect(queries()).toEqual(["emma"]);
  });
});

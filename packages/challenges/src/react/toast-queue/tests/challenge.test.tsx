import React from "react";
import { act, render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

type View = ReturnType<typeof within>;

// Sandpack's in-browser Jest renders into the iframe's real DOM but exposes
// jsdom globals, so user-event must be pointed at the real `document`.
// `delay: null` keeps user-event itself from waiting on timers.
// Queries are scoped to the rendered container because the sandbox entry
// may also mount the app into the same document.
function setup() {
  const user = userEvent.setup({ document, delay: null });
  const { container } = render(<App />);
  const view = within(container);
  const add = (type: "success" | "error") =>
    user.click(view.getByTestId(`add-${type}`));
  return { user, view, add };
}

/**
 * A hand-rolled fake clock, so 3-second toasts take milliseconds and don't
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

const toasts = (view: View) => view.queryAllByTestId("toast");
const messages = (view: View) =>
  toasts(view).map((t) => (t.textContent ?? "").replace("×", "").trim());
const queueCount = (view: View) => {
  const el = view.queryByTestId("queue-count");
  return el ? (el.textContent ?? "").trim() : null;
};

beforeEach(installClock);

afterEach(() => {
  cleanup();
  uninstallClock();
});

// Every test must fail against starter/App.tsx and pass against solution/App.tsx.
describe("Toast Queue", () => {
  it("adds toasts with the right type and role inside a live region", async () => {
    const { view, add } = setup();
    await add("success");
    await add("error");

    const region = view.getByTestId("toast-region");
    expect(region.getAttribute("aria-live")).toBe("polite");
    const [ok, bad] = toasts(view);
    expect(toasts(view)).toHaveLength(2);
    expect(region.contains(ok) && region.contains(bad)).toBe(true);

    expect(ok.textContent).toContain("Saved successfully #1");
    expect(ok.getAttribute("data-type")).toBe("success");
    expect(ok.getAttribute("role")).toBe("status");
    expect(bad.textContent).toContain("Something went wrong #2");
    expect(bad.getAttribute("data-type")).toBe("error");
    expect(bad.getAttribute("role")).toBe("alert");
  });

  it("dismisses each toast 3000 ms after it appears", async () => {
    const { view, add } = setup();
    await add("success");
    tick(1000);
    await add("error");

    tick(1999);
    expect(toasts(view)).toHaveLength(2);
    tick(1);
    expect(messages(view)).toEqual(["Something went wrong #2"]);
    tick(999);
    expect(toasts(view)).toHaveLength(1);
    tick(1);
    expect(toasts(view)).toHaveLength(0);
  });

  it("shows at most 3 and queues the rest in order", async () => {
    const { view, add } = setup();
    await add("success");
    await add("error");
    await add("success");
    expect(queueCount(view)).toBeNull();
    await add("error");
    await add("success");

    expect(messages(view)).toEqual([
      "Saved successfully #1",
      "Something went wrong #2",
      "Saved successfully #3",
    ]);
    expect(queueCount(view)).toBe("+2 more");

    tick(3000);
    expect(messages(view)).toEqual([
      "Something went wrong #4",
      "Saved successfully #5",
    ]);
    expect(queueCount(view)).toBeNull();
  });

  it("gives a queued toast its own full 3000 ms once it appears", async () => {
    const { view, add } = setup();
    for (let i = 0; i < 4; i++) await add("success");
    expect(toasts(view)).toHaveLength(3);

    tick(3000);
    expect(messages(view)).toEqual(["Saved successfully #4"]);
    tick(2999);
    expect(messages(view)).toEqual(["Saved successfully #4"]);
    tick(1);
    expect(toasts(view)).toHaveLength(0);
  });

  it("removes a toast right away with its dismiss button", async () => {
    const { user, view, add } = setup();
    await add("success");
    await add("error");
    await add("success");
    await add("error");

    const second = toasts(view)[1];
    await user.click(within(second).getByTestId("dismiss-button"));
    expect(messages(view)).toEqual([
      "Saved successfully #1",
      "Saved successfully #3",
      "Something went wrong #4",
    ]);
    expect(queueCount(view)).toBeNull();
  });

  it("pauses while hovered and resumes with the time that was left", async () => {
    const { user, view, add } = setup();
    await add("success");
    tick(1000);

    await user.hover(toasts(view)[0]);
    tick(5000);
    expect(toasts(view)).toHaveLength(1);

    await user.unhover(toasts(view)[0]);
    tick(1999);
    expect(toasts(view)).toHaveLength(1);
    tick(1);
    expect(toasts(view)).toHaveLength(0);
  });
});

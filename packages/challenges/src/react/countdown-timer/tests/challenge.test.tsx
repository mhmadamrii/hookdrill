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
  const press = (id: string) => user.click(view.getByTestId(id));
  const setSeconds = async (seconds: number) => {
    const input = view.getByTestId("seconds-input");
    await user.clear(input);
    await user.type(input, String(seconds));
  };
  return { view, press, setSeconds };
}

/**
 * A hand-rolled fake clock, so a 5-second countdown takes milliseconds and
 * doesn't depend on the tab being in front. Sandpack's in-browser Jest has no
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

/** Moves the fake clock forward, firing due timers in order. */
function tick(seconds: number) {
  const target = clock.now + seconds * 1000;
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

const time = (view: View) =>
  (view.getByTestId("time").textContent ?? "").trim();
const disabled = (view: View, id: string) =>
  (view.getByTestId(id) as HTMLButtonElement).disabled;

beforeEach(installClock);

afterEach(() => {
  cleanup();
  uninstallClock();
});

describe("Countdown Timer", () => {
  it("shows the chosen duration as mm:ss", async () => {
    const { view, setSeconds } = setup();
    await setSeconds(90);
    expect(time(view)).toBe("01:30");
    await setSeconds(5);
    expect(time(view)).toBe("00:05");
  });

  it("counts down once per second after Start", async () => {
    const { view, press, setSeconds } = setup();
    await setSeconds(5);
    await press("start-button");

    tick(1);
    expect(time(view)).toBe("00:04");
    tick(2);
    expect(time(view)).toBe("00:02");
  });

  it("pauses and resumes", async () => {
    const { view, press, setSeconds } = setup();
    await setSeconds(10);
    await press("start-button");
    tick(2);
    await press("pause-button");

    tick(5);
    expect(time(view)).toBe("00:08");

    await press("start-button");
    tick(1);
    expect(time(view)).toBe("00:07");
  });

  it("stops at zero and says time's up", async () => {
    const { view, press, setSeconds } = setup();
    await setSeconds(3);
    await press("start-button");
    tick(2);
    expect(view.queryByTestId("done-message")).toBeNull();

    tick(3);
    expect(time(view)).toBe("00:00");
    expect(view.queryByTestId("done-message")).not.toBeNull();
  });

  it("resets to the chosen duration and stops", async () => {
    const { view, press, setSeconds } = setup();
    await setSeconds(20);
    await press("start-button");
    tick(4);

    await press("reset-button");
    expect(time(view)).toBe("00:20");
    tick(3);
    expect(time(view)).toBe("00:20");
  });

  it("only enables the buttons that make sense", async () => {
    const { view, press, setSeconds } = setup();
    await setSeconds(5);
    expect(disabled(view, "start-button")).toBe(false);
    expect(disabled(view, "pause-button")).toBe(true);

    await press("start-button");
    expect(disabled(view, "start-button")).toBe(true);
    expect(disabled(view, "pause-button")).toBe(false);

    await press("pause-button");
    expect(disabled(view, "start-button")).toBe(false);
    expect(disabled(view, "pause-button")).toBe(true);
  });
});

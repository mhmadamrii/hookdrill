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
  const flip = () => user.click(view.getByTestId("order-button"));
  return { user, view, flip };
}

const rows = (view: View) => view.queryAllByTestId("player");
const ids = (view: View) =>
  rows(view).map((r) => Number(r.getAttribute("data-id")));
const ranks = (view: View) =>
  rows(view).map((r) =>
    (within(r).getByTestId("rank").textContent ?? "").trim(),
  );
const medals = (view: View) =>
  rows(view).map((r) => r.getAttribute("data-medal"));

afterEach(cleanup);

// Data traps (see players.ts):
// - bruno, Lukas and maya share 870 (three-way tie at rank 3): a case-sensitive
//   name sort puts "Lukas" before "bruno"; dense ranking would give Zoe 4, not 6.
// - diego and Hana share 610: case-sensitive puts "Hana" before "diego".
// - Bronze goes to rows 3, 4 and 5: medals by row would give only row 3 bronze.
describe("Leaderboard Ranking", () => {
  it("lists players by score, highest first", () => {
    const { view } = setup();
    // 1020, 940, 870 x3, 760, 610 x2
    expect(ids(view)).toEqual([4, 2, 3, 6, 1, 5, 7, 8]);
  });

  it("breaks score ties by name, ignoring case", () => {
    const { view } = setup();
    // 870: bruno, Lukas, maya. 610: diego, Hana.
    expect(ids(view).slice(2, 5)).toEqual([3, 6, 1]);
    expect(ids(view).slice(6)).toEqual([7, 8]);
  });

  it("uses competition ranking: ties share a rank and the next rank skips", () => {
    const { view } = setup();
    expect(ranks(view)).toEqual(["1", "2", "3", "3", "3", "6", "7", "7"]);
  });

  it("gives medals to ranks 1 to 3, not to rows 1 to 3", () => {
    const { view } = setup();
    expect(medals(view)).toEqual([
      "gold",
      "silver",
      "bronze",
      "bronze",
      "bronze",
      null,
      null,
      null,
    ]);
  });

  it("flips to lowest first and back, keeping each player's rank", async () => {
    const { view, flip } = setup();
    await flip();
    // 610 (diego, Hana), 760, 870 (bruno, Lukas, maya), 940, 1020
    expect(ids(view)).toEqual([7, 8, 5, 3, 6, 1, 2, 4]);
    // Rank follows the score, not the position.
    expect(ranks(view)).toEqual(["7", "7", "6", "3", "3", "3", "2", "1"]);
    expect(medals(view)).toEqual([
      null,
      null,
      null,
      "bronze",
      "bronze",
      "bronze",
      "silver",
      "gold",
    ]);

    await flip();
    expect(ids(view)).toEqual([4, 2, 3, 6, 1, 5, 7, 8]);
    expect(ranks(view)[5]).toBe("6");
  });
});

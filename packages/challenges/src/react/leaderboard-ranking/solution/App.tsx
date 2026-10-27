import { useMemo, useState } from "react";
import { PLAYERS } from "./players";

const MEDALS = ["gold", "silver", "bronze"] as const;

const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

// Rank everyone once, highest score first. Competition ranking: a player's
// rank is 1 + the number of players with a strictly higher score, so ties
// share a rank and the next rank skips (1, 2, 2, 4).
const RANKED = [...PLAYERS]
  .sort((a, b) => b.score - a.score || byName(a, b))
  .map((p) => ({
    ...p,
    rank: 1 + PLAYERS.filter((q) => q.score > p.score).length,
  }));

export default function App() {
  const [lowestFirst, setLowestFirst] = useState(false);

  // Flipping the order only moves rows: ranks belong to scores, not positions.
  // Ties stay A→Z by name in both orders.
  const rows = useMemo(
    () =>
      lowestFirst
        ? [...RANKED].sort((a, b) => a.score - b.score || byName(a, b))
        : RANKED,
    [lowestFirst],
  );

  return (
    <div>
      <button
        data-testid="order-button"
        onClick={() => setLowestFirst((v) => !v)}
      >
        {lowestFirst ? "Highest first" : "Lowest first"}
      </button>
      <ol>
        {rows.map((p) => (
          <li
            key={p.id}
            data-testid="player"
            data-id={p.id}
            data-medal={p.rank <= 3 ? MEDALS[p.rank - 1] : undefined}
          >
            <span data-testid="rank">{p.rank}</span> {p.name} {p.score}
          </li>
        ))}
      </ol>
    </div>
  );
}

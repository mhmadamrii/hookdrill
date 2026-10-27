import { PLAYERS } from "./players";

export default function App() {
  // TODO: sort the players by score (ties by name), give each a competition
  // rank and a medal for the top 3 ranks, and let the button flip the order.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <button data-testid="order-button">Lowest first</button>
      <ol>
        {PLAYERS.map((p) => (
          <li key={p.id} data-testid="player" data-id={p.id}>
            <span data-testid="rank">?</span> {p.name} {p.score}
          </li>
        ))}
      </ol>
    </div>
  );
}

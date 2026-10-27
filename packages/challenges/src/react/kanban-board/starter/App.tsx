import { BOARD } from "./board";

export default function App() {
  // TODO: keep the board in state, make cards draggable between columns,
  // and let keyboard users pick up, move and drop cards. Announce each step
  // in the live region.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <div style={{ display: "flex", gap: 16 }}>
        {BOARD.map((column) => (
          <section key={column.id} data-testid="column" data-id={column.id}>
            <h2>
              {column.title}{" "}
              <span data-testid="column-count">{column.cards.length}</span>
            </h2>
            <ul>
              {column.cards.map((card) => (
                <li key={card.id}>
                  <button data-testid="card" data-id={card.id}>
                    {card.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div data-testid="announcer" aria-live="assertive" />
    </div>
  );
}

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { BOARD, type Card, type Column } from "./board";

type Grabbed = { id: string; before: Column[] };

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

// Where a card is: its column index and its index inside that column.
function locate(board: Column[], id: string) {
  for (let col = 0; col < board.length; col++) {
    const index = board[col].cards.findIndex((c) => c.id === id);
    if (index !== -1) return { col, index, card: board[col].cards[index] };
  }
  return null;
}

// Returns a new board with the card removed and inserted at (col, index).
function moveCard(board: Column[], id: string, col: number, index: number) {
  const from = locate(board, id);
  if (!from) return board;
  const next = board.map((c) => ({ ...c, cards: [...c.cards] }));
  next[from.col].cards.splice(from.index, 1);
  const target = next[col].cards;
  target.splice(Math.min(index, target.length), 0, from.card);
  return next;
}

export default function App() {
  const [board, setBoard] = useState<Column[]>(BOARD);
  const [grabbed, setGrabbed] = useState<Grabbed | null>(null);
  const [message, setMessage] = useState("");
  const dragged = useRef<string | null>(null);
  const cardEls = useRef(new Map<string, HTMLButtonElement>());
  const focusId = useRef<string | null>(null);

  // A card that changes column is a new element, so focus it again
  // after every keyboard move.
  useLayoutEffect(() => {
    if (focusId.current) {
      cardEls.current.get(focusId.current)?.focus();
      focusId.current = null;
    }
  });

  function moveTo(card: Card, col: number, index: number) {
    const next = moveCard(board, card.id, col, index);
    const at = locate(next, card.id)!;
    setBoard(next);
    focusId.current = card.id;
    setMessage(
      `${card.title} moved to ${next[col].title}, position ${at.index + 1} of ${next[col].cards.length}.`,
    );
  }

  function onKeyDown(e: KeyboardEvent, card: Card) {
    const pos = locate(board, card.id)!;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (grabbed?.id === card.id) {
        setGrabbed(null);
        setMessage(`${card.title} dropped.`);
      } else {
        setGrabbed({ id: card.id, before: board });
        setMessage(`Picked up ${card.title}.`);
      }
      return;
    }
    // Arrow keys and Escape only act on the picked-up card.
    if (grabbed?.id !== card.id) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setBoard(grabbed.before);
      setGrabbed(null);
      focusId.current = card.id;
      setMessage("Move cancelled.");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const col = pos.col + (e.key === "ArrowLeft" ? -1 : 1);
      if (col >= 0 && col < board.length) moveTo(card, col, pos.index);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const index = pos.index + (e.key === "ArrowUp" ? -1 : 1);
      const size = board[pos.col].cards.length;
      if (index >= 0 && index < size) moveTo(card, pos.col, index);
    }
  }

  function onDragStart(e: DragEvent, card: Card) {
    dragged.current = card.id;
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: DragEvent, col: number) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragged.current;
    dragged.current = null;
    if (!id || !locate(board, id)) return;
    setBoard(moveCard(board, id, col, Infinity));
  }

  return (
    <div>
      <p>
        Drag a card to another column, or focus it and press Space to pick it
        up, the arrow keys to move it, Space to drop it and Escape to cancel.
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        {board.map((column, col) => (
          <section
            key={column.id}
            data-testid="column"
            data-id={column.id}
            aria-labelledby={`column-${column.id}`}
            // Without preventDefault on dragover, the browser never fires drop.
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col)}
            style={{ minWidth: 180, minHeight: 200, padding: 8 }}
          >
            <h2 id={`column-${column.id}`}>
              {column.title}{" "}
              <span data-testid="column-count">{column.cards.length}</span>
            </h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {column.cards.map((card) => (
                <li key={card.id}>
                  <button
                    ref={(el) => {
                      if (el) cardEls.current.set(card.id, el);
                      else cardEls.current.delete(card.id);
                    }}
                    data-testid="card"
                    data-id={card.id}
                    draggable
                    aria-pressed={grabbed?.id === card.id}
                    aria-describedby="kanban-help"
                    onDragStart={(e) => onDragStart(e, card)}
                    onKeyDown={(e) => onKeyDown(e, card)}
                  >
                    {card.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p id="kanban-help" style={visuallyHidden}>
        Press Space to pick up or drop, arrow keys to move, Escape to cancel.
      </p>
      <div data-testid="announcer" aria-live="assertive" style={visuallyHidden}>
        {message}
      </div>
    </div>
  );
}

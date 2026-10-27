import { useState } from "react";
import { ITEMS, ROW_HEIGHT, VIEWPORT_HEIGHT, OVERSCAN } from "./items";

export default function App() {
  const [scrollTop, setScrollTop] = useState(0);

  // The first and last rows that touch the viewport, then widened by OVERSCAN.
  const first = Math.floor(scrollTop / ROW_HEIGHT);
  const last = Math.floor((scrollTop + VIEWPORT_HEIGHT - 1) / ROW_HEIGHT);
  const start = Math.max(0, first - OVERSCAN);
  const end = Math.min(ITEMS.length - 1, last + OVERSCAN);

  const rows = [];
  for (let i = start; i <= end; i++) {
    rows.push(
      <div
        key={i}
        data-testid="row"
        data-index={i}
        style={{
          position: "absolute",
          top: i * ROW_HEIGHT,
          height: ROW_HEIGHT,
          left: 0,
          right: 0,
        }}
      >
        {ITEMS[i]}
      </div>,
    );
  }

  return (
    <div
      data-testid="viewport"
      style={{
        height: VIEWPORT_HEIGHT,
        overflowY: "auto",
        position: "relative",
      }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div
        data-testid="spacer"
        style={{ height: ITEMS.length * ROW_HEIGHT, position: "relative" }}
      >
        {rows}
      </div>
    </div>
  );
}

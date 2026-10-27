import { ITEMS, ROW_HEIGHT, VIEWPORT_HEIGHT, OVERSCAN } from "./items";

export default function App() {
  // TODO: render only the rows in view (plus OVERSCAN above and below),
  // positioned inside a spacer as tall as the whole list, and update them
  // as the viewport scrolls. Rendering all 10,000 rows is not the answer.
  // See the requirements for the data-testid each element needs.

  return (
    <div
      data-testid="viewport"
      style={{
        height: VIEWPORT_HEIGHT,
        overflowY: "auto",
        position: "relative",
      }}
    >
      <div data-testid="spacer" />
    </div>
  );
}

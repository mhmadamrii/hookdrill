/** Height of every row, in pixels. */
export const ROW_HEIGHT = 32;
/** Height of the scrolling viewport, in pixels. */
export const VIEWPORT_HEIGHT = 320;
/** Extra rows to render above and below the visible ones. */
export const OVERSCAN = 3;

export const ITEMS: string[] = Array.from(
  { length: 10_000 },
  (_, i) => `Order #${String(i + 1).padStart(5, "0")}`,
);

export type Card = { id: string; title: string };
export type Column = { id: string; title: string; cards: Card[] };

export const BOARD: Column[] = [
  {
    id: "todo",
    title: "To do",
    cards: [
      { id: "c1", title: "Write tests" },
      { id: "c2", title: "Design schema" },
      { id: "c3", title: "Set up CI" },
    ],
  },
  {
    id: "doing",
    title: "In progress",
    cards: [
      { id: "c4", title: "Build API" },
      { id: "c5", title: "Review PR" },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "c6", title: "Plan sprint" }],
  },
];

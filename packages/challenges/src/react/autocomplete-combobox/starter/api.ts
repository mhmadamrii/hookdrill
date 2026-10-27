const FRUITS = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Coconut",
  "Cranberry",
  "Date",
  "Dragonfruit",
  "Fig",
  "Grape",
  "Grapefruit",
  "Guava",
  "Kiwi",
  "Lemon",
  "Lime",
  "Lychee",
  "Mango",
  "Melon",
  "Nectarine",
  "Orange",
  "Papaya",
  "Passionfruit",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Raspberry",
  "Strawberry",
  "Tangerine",
  "Watermelon",
];

export type Search = (query: string) => Promise<string[]>;

/**
 * Fruits whose name starts with the query, ignoring case. Like a real API it
 * takes a random 100–600 ms, so answers can arrive out of order.
 */
export const searchFruits: Search = (query) =>
  new Promise((resolve) => {
    const q = query.toLowerCase();
    const results = FRUITS.filter((f) => f.toLowerCase().startsWith(q));
    setTimeout(() => resolve(results), 100 + Math.random() * 500);
  });

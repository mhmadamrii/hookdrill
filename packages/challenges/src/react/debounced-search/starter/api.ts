const BOOKS = [
  "1984",
  "A Tale of Two Cities",
  "Anna Karenina",
  "Brave New World",
  "Catch-22",
  "Crime and Punishment",
  "Don Quixote",
  "Dune",
  "Emma",
  "Fahrenheit 451",
  "Frankenstein",
  "Great Expectations",
  "Jane Eyre",
  "Little Women",
  "Lord of the Flies",
  "Moby-Dick",
  "Middlemarch",
  "One Hundred Years of Solitude",
  "Pride and Prejudice",
  "Rebecca",
  "The Catcher in the Rye",
  "The Great Gatsby",
  "The Hobbit",
  "The Lord of the Rings",
  "The Odyssey",
  "The Road",
  "To Kill a Mockingbird",
  "Ulysses",
  "War and Peace",
  "Wuthering Heights",
];

/** How long typing must pause before searching, in milliseconds. */
export const DEBOUNCE_MS = 300;

export type Search = (query: string) => Promise<string[]>;

/**
 * Books whose title contains the query, ignoring case. Like a real API it
 * takes a random 100–500 ms, so answers can arrive out of order.
 */
export const searchBooks: Search = (query) =>
  new Promise((resolve) => {
    const q = query.toLowerCase();
    const results = BOOKS.filter((b) => b.toLowerCase().includes(q));
    setTimeout(() => resolve(results), 100 + Math.random() * 400);
  });

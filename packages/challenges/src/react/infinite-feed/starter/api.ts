export type Post = { id: number; author: string; text: string };
export type Page = { items: Post[]; nextCursor: string | null };
export type FetchPage = (cursor: string | null) => Promise<Page>;

const AUTHORS = ["Ada", "Grace", "Linus", "Margaret", "Alan", "Barbara"];

const POSTS: Post[] = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  author: AUTHORS[i % AUTHORS.length],
  text: `Post number ${i + 1}`,
}));

const PAGE_SIZE = 10;

/**
 * Returns up to 10 posts starting at `cursor` (null for the first page).
 * `nextCursor` is null on the last page.
 *
 * Like a feed that gains new posts while you scroll, every page after the
 * first starts with the last post of the page before it, so ids can repeat.
 * Answers take a random 300–800 ms, and about 1 request in 10 fails.
 */
export const fetchPosts: FetchPage = (cursor) =>
  new Promise((resolve, reject) => {
    const start = cursor === null ? 0 : Number(cursor);
    const end = start + PAGE_SIZE;
    const page: Page = {
      items: POSTS.slice(start, end),
      nextCursor: end < POSTS.length ? String(end - 1) : null,
    };
    setTimeout(
      () =>
        Math.random() < 0.1
          ? reject(new Error("Network error"))
          : resolve(page),
      300 + Math.random() * 500,
    );
  });

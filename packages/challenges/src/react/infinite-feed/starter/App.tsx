import { fetchPosts, type FetchPage } from "./api";

// The tests pass their own `fetchPage`, so keep this prop and call it.
export default function App({
  fetchPage = fetchPosts,
}: {
  fetchPage?: FetchPage;
}) {
  // TODO: fetch the first page on mount, append each page's posts (skipping
  // ids already shown), load the next page with `nextCursor`, and handle the
  // loading, error and end states.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <h1>Feed</h1>
      <ul>{/* one <li data-testid="post" data-id={post.id}> per post */}</ul>
      <button data-testid="load-more">Load more</button>
    </div>
  );
}

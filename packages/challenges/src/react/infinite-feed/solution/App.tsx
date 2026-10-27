import { useEffect, useRef, useState } from "react";
import { fetchPosts, type FetchPage, type Post } from "./api";

type Status = "loading" | "idle" | "error" | "end";

export default function App({
  fetchPage = fetchPosts,
}: {
  fetchPage?: FetchPage;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  // The cursor of the next page to load. It only moves on success, so a
  // retry asks for the same page again.
  const [cursor, setCursor] = useState<string | null>(null);
  // Refs update synchronously, so a second click before the re-render
  // can't start a second request.
  const inFlight = useRef(false);
  const mounted = useRef(false);

  function load(from: string | null) {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("loading");
    fetchPage(from).then(
      (page) => {
        inFlight.current = false;
        if (!mounted.current) return;
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const fresh: Post[] = [];
          for (const post of page.items) {
            if (seen.has(post.id)) continue;
            seen.add(post.id);
            fresh.push(post);
          }
          return [...prev, ...fresh];
        });
        setCursor(page.nextCursor);
        setStatus(page.nextCursor === null ? "end" : "idle");
      },
      () => {
        inFlight.current = false;
        if (mounted.current) setStatus("error");
      },
    );
  }

  useEffect(() => {
    mounted.current = true;
    // Under StrictMode the effect runs twice; the in-flight guard keeps it
    // to one request, and `mounted` is true again when that request answers.
    load(null);
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <div>
      <h1>Feed</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id} data-testid="post" data-id={post.id}>
            <strong>{post.author}</strong>
            <p>{post.text}</p>
          </li>
        ))}
      </ul>
      {status === "loading" && (
        <p data-testid="loading" role="status">
          Loading…
        </p>
      )}
      {status === "error" && (
        <div data-testid="error" role="alert">
          <p>Couldn’t load posts.</p>
          <button data-testid="retry-button" onClick={() => load(cursor)}>
            Retry
          </button>
        </div>
      )}
      {status === "end" && (
        <p data-testid="end-message">You’re all caught up.</p>
      )}
      {(status === "idle" || status === "loading") && (
        <button
          data-testid="load-more"
          disabled={status === "loading"}
          onClick={() => load(cursor)}
        >
          Load more
        </button>
      )}
    </div>
  );
}

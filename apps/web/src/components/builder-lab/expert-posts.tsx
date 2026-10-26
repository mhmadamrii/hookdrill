import { ExternalLink } from 'lucide-react'
import { EmbeddedTweet } from 'react-tweet'
import type { ExpertPost } from '@/lib/expert-posts'

export function ExpertPosts({ posts }: { posts: ExpertPost[] }) {
  return (
    <section aria-labelledby="experts-heading">
      <h2 id="experts-heading" className="text-xl font-semibold tracking-tight">
        What builders are saying
      </h2>
      <p className="mt-2 max-w-[65ch] text-muted-foreground">
        People building with AI every day largely agree: the work is moving from
        typing code to deciding what to build, directing agents and checking
        what they produce. The craft doesn’t disappear; it moves up the stack.
      </p>
      <div className="mt-6 columns-1 gap-4 md:columns-2">
        {posts.map((post) => (
          <div key={post.id} className="mb-4 break-inside-avoid">
            {post.tweet ? (
              <EmbeddedTweet tweet={post.tweet} />
            ) : (
              <Unavailable post={post} />
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Posts are shown as published on X. Quoted for context, not endorsed.
      </p>
    </section>
  )
}

/** When X can't be reached, link to the post instead of showing nothing. */
function Unavailable({ post }: { post: ExpertPost }) {
  return (
    <a
      href={`https://x.com/${post.handle}/status/${post.id}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm hover:bg-accent"
    >
      <span>
        <span className="block font-medium">{post.author}</span>
        <span className="text-muted-foreground">
          @{post.handle} · View the post on X
        </span>
      </span>
      <ExternalLink className="size-4 text-muted-foreground" />
    </a>
  )
}

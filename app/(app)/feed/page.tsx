import { getFeed, getMe } from "@/lib/data/queries";
import { byId } from "@/lib/data/seed";
import { FeedClient } from "@/components/feed/feed-client";

export default async function FeedPage() {
  const [posts, me] = await Promise.all([getFeed(), getMe()]);

  // Build author map for all posts
  const authorIds = [...new Set(posts.map((p) => p.author))];
  const authors = Object.fromEntries(
    authorIds.map((id) => [id, byId[id]]).filter(([, v]) => v != null),
  );

  return <FeedClient posts={posts} authors={authors} me={me} />;
}

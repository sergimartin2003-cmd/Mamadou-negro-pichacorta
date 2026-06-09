import { getFeed, getMe, getNicheRp } from "@/lib/data/queries";
import { byId } from "@/lib/data/seed";
import { FeedClient } from "@/components/feed/feed-client";

export default async function FeedPage() {
  const [posts, me] = await Promise.all([getFeed(), getMe()]);

  // Build author map for all posts
  const authorIds = [...new Set(posts.map((p) => p.author))];
  const authors = Object.fromEntries(
    authorIds.map((id) => [id, byId[id]]).filter(([, v]) => v != null),
  );

  // The contextual rank badge on each post uses the author's RP in that post's
  // niche (the shared feed shows the niche-relevant tier next to each user).
  const nicheRpEntries = await Promise.all(
    posts.map(
      async (post) =>
        [post.id, (await getNicheRp(post.author, post.niche)) ?? authors[post.author]?.rp ?? 0] as const,
    ),
  );
  const nicheRpByPost = Object.fromEntries(nicheRpEntries);

  return <FeedClient posts={posts} authors={authors} me={me} nicheRpByPost={nicheRpByPost} />;
}

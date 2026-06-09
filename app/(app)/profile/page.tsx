import { getMe, getFeed } from "@/lib/data/queries";
import { TraderProfile } from "@/components/profile/trader-profile";

export default async function ProfilePage() {
  const [me, allPosts] = await Promise.all([getMe(), getFeed()]);
  const posts = allPosts.filter((p) => p.author === me.id);
  return <TraderProfile profile={me} isMe posts={posts} />;
}

import { getMe, getFeed, getNicheStatsForProfile } from "@/lib/data/queries";
import { TraderProfile } from "@/components/profile/trader-profile";

export default async function ProfilePage() {
  const me = await getMe();
  const [allPosts, nicheStats] = await Promise.all([
    getFeed(),
    getNicheStatsForProfile(me.id),
  ]);
  const posts = allPosts.filter((p) => p.author === me.id);
  return <TraderProfile profile={me} isMe posts={posts} nicheStats={nicheStats} />;
}

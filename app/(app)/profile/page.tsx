import { getMe, getFeed } from "@/lib/data/queries";
import { TraderProfile } from "@/components/profile/trader-profile";

export default async function ProfilePage() {
  const [me, posts] = await Promise.all([getMe(), getFeed()]);
  return <TraderProfile profile={me} isMe posts={posts} />;
}

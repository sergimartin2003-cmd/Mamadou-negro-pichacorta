import { notFound } from "next/navigation";
import { getProfile, getFeed, getNicheStatsForProfile } from "@/lib/data/queries";
import { TraderProfile } from "@/components/profile/trader-profile";

interface HandlePageProps {
  params: Promise<{ handle: string }>;
}

export default async function HandlePage({ params }: HandlePageProps) {
  const { handle } = await params;
  const profile = await getProfile(handle);

  if (!profile) notFound();

  const [posts, nicheStats] = await Promise.all([
    getFeed(),
    getNicheStatsForProfile(profile.id),
  ]);

  const authorPosts = posts.filter((p) => p.author === profile.id);
  return <TraderProfile profile={profile} posts={authorPosts} nicheStats={nicheStats} />;
}

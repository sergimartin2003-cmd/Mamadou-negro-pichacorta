import { notFound } from "next/navigation";
import { getProfile, getFeed } from "@/lib/data/queries";
import { TraderProfile } from "@/components/profile/trader-profile";

interface HandlePageProps {
  params: Promise<{ handle: string }>;
}

export default async function HandlePage({ params }: HandlePageProps) {
  const { handle } = await params;
  const [profile, posts] = await Promise.all([getProfile(handle), getFeed()]);

  if (!profile) notFound();

  const authorPosts = posts.filter((p) => p.author === profile.id);
  return <TraderProfile profile={profile} posts={authorPosts} />;
}

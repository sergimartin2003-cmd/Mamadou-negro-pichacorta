import { notFound } from "next/navigation";
import { getNiche, isNicheSlug, NICHE_SLUGS } from "@/config/niches";
import { getFeed, getNicheLeaderboard, getNicheRp, getCourses, getProfilesByIds } from "@/lib/data/queries";
import { byId } from "@/lib/data/seed";
import { NicheHub } from "@/components/nichos/niche-hub";

export function generateStaticParams() {
  return NICHE_SLUGS.map((niche) => ({ niche }));
}

interface NicheHubPageProps {
  params: Promise<{ niche: string }>;
}

export default async function NicheHubPage({ params }: NicheHubPageProps) {
  const { niche } = await params;
  if (!isNicheSlug(niche)) notFound();
  const nicheModule = getNiche(niche);

  const [posts, leaderboard, courses] = await Promise.all([
    getFeed({ niche }),
    getNicheLeaderboard(niche),
    getCourses({ niche }),
  ]);

  const authorIds = [...new Set(posts.map((p) => p.author))];
  const authors = await getProfilesByIds(authorIds);
  const rpEntries = await Promise.all(
    posts.map(
      async (post) =>
        [post.id, (await getNicheRp(post.author, post.niche)) ?? authors[post.author]?.rp ?? 0] as const,
    ),
  );
  const nicheRpByPost = Object.fromEntries(rpEntries);

  const courseInstructorIds = [...new Set(courses.map((c) => c.instructorId))];
  const instructors = Object.fromEntries(
    courseInstructorIds.map((id) => [id, byId[id]]).filter(([, v]) => v != null),
  );

  return (
    <NicheHub
      niche={nicheModule}
      field={leaderboard.length}
      top={leaderboard.slice(0, 3)}
      posts={posts}
      authors={authors}
      nicheRpByPost={nicheRpByPost}
      courses={courses.slice(0, 3)}
      instructors={instructors}
    />
  );
}

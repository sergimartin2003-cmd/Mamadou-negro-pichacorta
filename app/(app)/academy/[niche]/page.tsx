import { notFound } from "next/navigation";
import { getLearningPaths, getLessons } from "@/lib/data/queries";
import { isNicheSlug, NICHE_SLUGS } from "@/config/niches";
import { LearningHub } from "@/components/learning/learning-hub";
import { NicheSelector } from "@/components/niche/niche-selector";

export function generateStaticParams() {
  return NICHE_SLUGS.map((niche) => ({ niche }));
}

interface LearningNichePageProps {
  params: Promise<{ niche: string }>;
}

export default async function LearningNichePage({ params }: LearningNichePageProps) {
  const { niche } = await params;
  if (!isNicheSlug(niche)) notFound();

  const paths = await getLearningPaths(niche);
  const lessons = paths.length > 0 ? await getLessons(paths[0].id) : [];

  return (
    <LearningHub
      paths={paths}
      lessons={lessons}
      header={<NicheSelector section="academy" active={niche} />}
    />
  );
}

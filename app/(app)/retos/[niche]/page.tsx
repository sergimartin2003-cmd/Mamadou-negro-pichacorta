import { notFound } from "next/navigation";
import { getCompetitions, getNicheLeaderboard } from "@/lib/data/queries";
import { isNicheSlug, NICHE_SLUGS } from "@/config/niches";
import { CompetitionsView } from "@/components/competitions/competitions-view";
import { NicheSelector } from "@/components/niche/niche-selector";

export function generateStaticParams() {
  return NICHE_SLUGS.map((niche) => ({ niche }));
}

interface CompetitionsNichePageProps {
  params: Promise<{ niche: string }>;
}

export default async function CompetitionsNichePage({ params }: CompetitionsNichePageProps) {
  const { niche } = await params;
  if (!isNicheSlug(niche)) notFound();

  const [competitions, traders] = await Promise.all([
    getCompetitions(niche),
    getNicheLeaderboard(niche),
  ]);

  return (
    <CompetitionsView
      competitions={competitions}
      traders={traders}
      header={<NicheSelector section="retos" active={niche} />}
    />
  );
}

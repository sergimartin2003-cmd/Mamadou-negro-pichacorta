import { getCompetitions, getRankings } from "@/lib/data/queries";
import { CompetitionsView } from "@/components/competitions/competitions-view";

export default async function CompetitionsPage() {
  const [competitions, traders] = await Promise.all([
    getCompetitions(),
    getRankings(),
  ]);

  return <CompetitionsView competitions={competitions} traders={traders} />;
}

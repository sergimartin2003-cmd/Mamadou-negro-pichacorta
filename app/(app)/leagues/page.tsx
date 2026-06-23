import { getCurrentSeason, getMe } from "@/lib/data/queries";
import { LeaguesView } from "@/components/leagues/leagues-view";

export default async function LeaguesPage() {
  const [season, me] = await Promise.all([getCurrentSeason(), getMe()]);
  return <LeaguesView season={season} me={{ name: me.name, rp: me.rp }} />;
}

import { getMe, getSpeedLeaderboard } from "@/lib/data/queries";
import { SpeedGame } from "@/components/games/speed-trading/speed-game";

export default async function SpeedTradingPage() {
  const [me, board] = await Promise.all([getMe(), getSpeedLeaderboard()]);
  return <SpeedGame me={{ name: me.name, handle: me.handle }} initialBoard={board} />;
}

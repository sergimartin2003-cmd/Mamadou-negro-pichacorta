import { getMe, getPredictLeaderboard } from "@/lib/data/queries";
import { PredictGame } from "@/components/games/predict-candle/predict-game";

export default async function PredictCandlePage() {
  const [me, board] = await Promise.all([getMe(), getPredictLeaderboard()]);
  return <PredictGame me={{ name: me.name, handle: me.handle }} initialBoard={board} />;
}

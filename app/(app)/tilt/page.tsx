import { getTiltTrades } from "@/lib/data/queries";
import { TiltMeter } from "@/components/tilt/tilt-meter";

export default async function TiltPage() {
  const trades = await getTiltTrades();
  return <TiltMeter trades={trades} />;
}

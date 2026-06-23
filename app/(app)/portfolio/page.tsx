import { getPortfolioSnapshot } from "@/lib/data/queries";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export default async function PortfolioPage() {
  const snapshot = await getPortfolioSnapshot();
  return <PortfolioView snapshot={snapshot} />;
}

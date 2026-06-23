import { getSecurities } from "@/lib/data/queries";
import { ResearchHub } from "@/components/research/research-hub";

export default async function ResearchPage() {
  const securities = await getSecurities();
  return <ResearchHub securities={securities} />;
}

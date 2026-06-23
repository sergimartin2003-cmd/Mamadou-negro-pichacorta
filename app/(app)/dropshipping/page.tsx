import { getDropshipSnapshot } from "@/lib/data/queries";
import { DropshipDashboard } from "@/components/dropship/dropship-dashboard";

export default async function DropshippingPage() {
  const snapshot = await getDropshipSnapshot();
  return <DropshipDashboard snapshot={snapshot} />;
}

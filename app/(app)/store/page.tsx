import { getStoreSnapshot } from "@/lib/data/queries";
import { StoreDashboard } from "@/components/store/store-dashboard";

export default async function StorePage() {
  const snapshot = await getStoreSnapshot();
  return <StoreDashboard snapshot={snapshot} />;
}

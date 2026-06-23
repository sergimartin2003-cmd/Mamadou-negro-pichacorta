import { getStartupSnapshot } from "@/lib/data/queries";
import { StartupDashboard } from "@/components/startup/startup-dashboard";

export default async function StartupPage() {
  const snapshot = await getStartupSnapshot();
  return <StartupDashboard snapshot={snapshot} />;
}

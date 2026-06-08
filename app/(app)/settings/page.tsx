import { getMe } from "@/lib/data/queries";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const profile = await getMe();
  return <SettingsView profile={profile} />;
}

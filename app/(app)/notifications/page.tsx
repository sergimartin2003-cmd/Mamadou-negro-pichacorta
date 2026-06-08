import { getNotifications } from "@/lib/data/queries";
import { NotificationsView } from "@/components/notifications/notifications-view";

export default async function NotificationsPage() {
  const items = await getNotifications();
  return <NotificationsView items={items} />;
}

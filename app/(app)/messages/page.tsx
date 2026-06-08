import { getDms, getMe } from "@/lib/data/queries";
import { MessagesView } from "@/components/messages/messages-view";

export default async function MessagesPage() {
  const [dms, me] = await Promise.all([getDms(), getMe()]);
  return <MessagesView dms={dms} me={me} />;
}

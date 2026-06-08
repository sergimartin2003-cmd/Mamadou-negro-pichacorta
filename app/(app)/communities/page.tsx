import { getCommunities, getChannels, getChatMessages } from "@/lib/data/queries";
import { CommunitiesView } from "@/components/communities/communities-view";

export default async function CommunitiesPage() {
  const communities = await getCommunities();
  const firstId = communities[0]?.id ?? "";
  const [channels, chatMessages] = await Promise.all([
    getChannels(firstId),
    getChatMessages(firstId),
  ]);

  return (
    <CommunitiesView
      communities={communities}
      channels={channels}
      chatMessages={chatMessages}
    />
  );
}

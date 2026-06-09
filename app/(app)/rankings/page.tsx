import { redirect } from "next/navigation";
import { DEFAULT_NICHE } from "@/config/niches";

// Rankings are per-niche; land on the default niche's ladder.
export default function RankingsIndex() {
  redirect(`/rankings/${DEFAULT_NICHE}`);
}

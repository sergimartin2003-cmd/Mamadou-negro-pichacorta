import { redirect } from "next/navigation";
import { DEFAULT_NICHE } from "@/config/niches";

// Competitions are per-niche; land on the default niche.
export default function CompetitionsIndex() {
  redirect(`/competitions/${DEFAULT_NICHE}`);
}

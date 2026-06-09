import { redirect } from "next/navigation";
import { DEFAULT_NICHE } from "@/config/niches";

// The learning hub groups paths per niche; land on the default niche.
export default function LearningIndex() {
  redirect(`/learning/${DEFAULT_NICHE}`);
}

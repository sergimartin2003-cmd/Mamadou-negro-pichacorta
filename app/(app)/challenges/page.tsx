import { getChallenges } from "@/lib/data/queries";
import { ChallengesView } from "@/components/challenges/challenges-view";

export default async function ChallengesPage() {
  const { challenges, progress } = await getChallenges();
  return <ChallengesView challenges={challenges} progress={progress} />;
}

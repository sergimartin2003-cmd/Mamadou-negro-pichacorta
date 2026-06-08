import { getLearningPaths, getLessons } from "@/lib/data/queries";
import { LearningHub } from "@/components/learning/learning-hub";

export default async function LearningPage() {
  const paths = await getLearningPaths();
  const firstPathId = paths[0]?.id ?? "";
  const lessons = await getLessons(firstPathId);

  return <LearningHub paths={paths} lessons={lessons} />;
}

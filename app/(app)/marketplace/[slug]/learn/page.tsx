import { notFound } from "next/navigation";
import { getCourse, courseSlugs } from "@/lib/data/queries";
import { LessonPlayer } from "@/components/marketplace/lesson-player";

export function generateStaticParams() {
  return courseSlugs().map((slug) => ({ slug }));
}

interface LearnPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params;
  const detail = await getCourse(slug);
  if (!detail) notFound();

  return <LessonPlayer course={detail.course} modules={detail.modules} />;
}

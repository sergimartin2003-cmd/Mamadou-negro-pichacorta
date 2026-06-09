import { notFound } from "next/navigation";
import { getCourse, courseSlugs } from "@/lib/data/queries";
import { CourseDetail } from "@/components/marketplace/course-detail";

export function generateStaticParams() {
  return courseSlugs().map((slug) => ({ slug }));
}

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const detail = await getCourse(slug);
  if (!detail) notFound();

  return (
    <CourseDetail
      course={detail.course}
      modules={detail.modules}
      reviews={detail.reviews}
      related={detail.related}
    />
  );
}

import { getMe, getCoursesByInstructor } from "@/lib/data/queries";
import { buildReviewsForCourse } from "@/lib/data/courses-seed";
import { InstructorDashboard } from "@/components/teach/instructor-dashboard";

export default async function TeachPage() {
  const me = await getMe();
  const courses = await getCoursesByInstructor(me.id);
  const reviews = courses
    .flatMap((course) =>
      buildReviewsForCourse(course)
        .slice(0, 2)
        .map((review) => ({ review, courseTitle: course.title })),
    )
    .slice(0, 5);

  return <InstructorDashboard instructor={me} courses={courses} reviews={reviews} />;
}

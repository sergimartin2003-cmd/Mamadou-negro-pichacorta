import Link from "next/link";
import { getMe, getCoursesByInstructor } from "@/lib/data/queries";
import { buildReviewsForCourse } from "@/lib/data/courses-seed";
import { getPlanTier, planAtLeast } from "@/lib/auth/plan";
import { InstructorDashboard } from "@/components/teach/instructor-dashboard";

export default async function TeachPage() {
  // Selling courses is a Pro feature; the gate is real once Stripe keys
  // exist (demo mode resolves to elite so the showcase stays navigable).
  const plan = await getPlanTier();
  if (!planAtLeast(plan, "pro")) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 16px" }}>
        <div className="card pad" style={{ textAlign: "center", padding: "36px 28px" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🔒</div>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Enseñar es una función Pro</h1>
          <p style={{ color: "var(--tx-3)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 18 }}>
            Publica tus cursos en el marketplace, cobra el 70% de cada venta y consigue el badge
            de instructor verificado con EmprendeHub Pro.
          </p>
          <Link href="/premium" className="btn primary">
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

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

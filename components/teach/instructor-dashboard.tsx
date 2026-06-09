import Link from "next/link";
import type { Course, CourseReview, Profile } from "@/types/db";
import { Avatar, Icon } from "@/components/ui";
import { getNiche } from "@/config/niches";
import { byId } from "@/lib/data/seed";
import { NicheChip } from "@/components/niche/niche-chip";
import { Stars } from "@/components/marketplace/stars";

const PAYOUT_RATE = 0.7;

interface InstructorReview {
  review: CourseReview;
  courseTitle: string;
}

interface InstructorDashboardProps {
  instructor: Profile;
  courses: Course[];
  reviews: InstructorReview[];
}

function euro(n: number): string {
  return `€${Math.round(n).toLocaleString()}`;
}

function courseRevenue(course: Course): number {
  return course.students * course.price * PAYOUT_RATE;
}

export function InstructorDashboard({ instructor, courses, reviews }: InstructorDashboardProps) {
  const totalStudents = courses.reduce((s, c) => s + c.students, 0);
  const revenueTotal = courses.reduce((s, c) => s + courseRevenue(c), 0);
  const revenueMonth = revenueTotal * 0.12;
  const payoutPending = revenueMonth * 0.45;

  const stats: [string, string, string][] = [
    ["Alumnos", totalStudents.toLocaleString(), "var(--brand)"],
    ["Revenue total", euro(revenueTotal), "var(--profit)"],
    ["Este mes", euro(revenueMonth), "var(--profit)"],
    ["Cursos", String(courses.length), "var(--t-diamond)"],
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Avatar user={instructor} size={44} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 24 }}>Panel de instructor</h1>
          <p style={{ color: "var(--tx-3)", fontSize: 13.5, marginTop: 3 }}>
            {instructor.name.replace(/^You · /, "")} · tus cursos, alumnos e ingresos en EmprendeHub.
          </p>
        </div>
        <Link href="/teach/create" className="btn primary">
          <Icon name="plus" size={16} sw={2.4} /> Crear curso
        </Link>
      </div>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {stats.map(([label, value, color]) => (
          <div key={label} className="card pad">
            <div className="sec-label" style={{ fontSize: 10, marginBottom: 6 }}>{label}</div>
            <div className="mono" style={{ fontWeight: 700, fontSize: 22, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 18, alignItems: "start" }} className="th-course-grid">
        {/* courses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <h2 style={{ fontSize: 16 }}>Tus cursos</h2>
          {courses.length === 0 ? (
            <div className="card pad" style={{ textAlign: "center", color: "var(--tx-3)", fontSize: 13.5 }}>
              Aún no tienes cursos. Crea el primero y empieza a vender lo que sabes.
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/marketplace/${course.slug}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--line-1)", textDecoration: "none", color: "inherit" }}
                >
                  <span aria-hidden style={{ width: 40, height: 40, borderRadius: 9, display: "grid", placeItems: "center", fontSize: 20, background: `color-mix(in srgb, ${getNiche(course.niche).color} 18%, transparent)` }}>
                    {getNiche(course.niche).glyph}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <NicheChip niche={course.niche} />
                      <span className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{course.students.toLocaleString()} alumnos</span>
                      <Stars rating={course.rating} size={11} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--profit)" }}>{euro(courseRevenue(course))}</div>
                    <div style={{ fontSize: 10.5, color: "var(--profit)" }}>Publicado</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* recent reviews */}
          {reviews.length > 0 && (
            <>
              <h2 style={{ fontSize: 16, marginTop: 8 }}>Reseñas recientes</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reviews.map(({ review, courseTitle }) => {
                  const author = byId[review.author] as Profile | undefined;
                  return (
                    <div key={review.id} className="card pad" style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        {author && <Avatar user={author} size={24} />}
                        <strong style={{ fontSize: 12.5 }}>{author?.name.replace(/^You · /, "") ?? "Alumno"}</strong>
                        <div style={{ flex: 1 }} />
                        <Stars rating={review.rating} size={11} />
                      </div>
                      <p style={{ fontSize: 13, color: "var(--tx-2)", lineHeight: 1.5 }}>{review.text}</p>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--tx-4)", marginTop: 5 }}>en {courseTitle}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* payout */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card pad">
            <div className="sec-label" style={{ fontSize: 10, marginBottom: 8 }}>Pago pendiente</div>
            <div className="mono" style={{ fontWeight: 700, fontSize: 26, color: "var(--profit)" }}>{euro(payoutPending)}</div>
            <button className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} disabled>
              <Icon name="bolt" size={15} /> Cobrar
            </button>
            <p style={{ fontSize: 11.5, color: "var(--tx-4)", textAlign: "center", marginTop: 8 }}>
              Conecta Stripe en Ajustes para habilitar los pagos.
            </p>
          </div>
          <div className="card pad" style={{ fontSize: 12.5, color: "var(--tx-3)", lineHeight: 1.5 }}>
            Tu reparto es del <strong style={{ color: "var(--tx-1)" }}>{Math.round(PAYOUT_RATE * 100)}%</strong> de cada venta.
            EmprendeHub se queda el resto para mantener la plataforma.
          </div>
        </aside>
      </div>
    </div>
  );
}

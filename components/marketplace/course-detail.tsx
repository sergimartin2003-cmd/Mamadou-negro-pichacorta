import Link from "next/link";
import type { Course, CourseModule, CourseReview, Profile } from "@/types/db";
import { Avatar, VerifiedTick, Icon } from "@/components/ui";
import { getNiche } from "@/config/niches";
import { NicheChip } from "@/components/niche/niche-chip";
import { byId } from "@/lib/data/seed";
import { Stars } from "./stars";
import { CourseCard } from "./course-card";
import { BuyButton } from "./buy-button";

interface CourseDetailProps {
  course: Course;
  modules: CourseModule[];
  reviews: CourseReview[];
  related: Course[];
}

const LESSON_ICON: Record<CourseModule["lessons"][number]["format"], "play" | "book" | "check" | "target"> = {
  video: "play",
  texto: "book",
  quiz: "check",
  ejercicio: "target",
};

export function CourseDetail({ course, modules, reviews, related }: CourseDetailProps) {
  const niche = getNiche(course.niche);
  const instructor = byId[course.instructorId] as Profile | undefined;
  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : 0;

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 16px 48px" }}>
      <Link href="/marketplace" className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)", textDecoration: "none" }}>
        ← Marketplace
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24, marginTop: 14, alignItems: "start" }} className="th-course-grid">
        {/* main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <NicheChip niche={course.niche} size="md" />
              <span className="mono" style={{ fontSize: 12, color: "var(--tx-3)" }}>{course.level}</span>
            </div>
            <h1 style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{course.title}</h1>
            <p style={{ fontSize: 15, color: "var(--tx-2)", marginTop: 8, maxWidth: 620 }}>{course.tagline}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 12, fontSize: 13 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Stars rating={course.rating} size={14} />
                <span className="mono" style={{ fontWeight: 700, color: "var(--t-gold)" }}>{course.rating.toFixed(1)}</span>
                <span style={{ color: "var(--tx-3)" }}>({course.reviewsCount} reseñas)</span>
              </span>
              <span className="mono" style={{ color: "var(--tx-3)" }}>{course.students.toLocaleString()} alumnos</span>
              <span className="mono" style={{ color: "var(--tx-3)" }}>Actualizado {course.updatedAt}</span>
            </div>
          </div>

          {/* hero banner */}
          <div
            style={{
              height: 200,
              borderRadius: "var(--r-lg)",
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(140deg, color-mix(in srgb, ${niche.color} 40%, var(--bg-2)), var(--bg-3))`,
              border: "1px solid var(--line-1)",
            }}
          >
            <span aria-hidden style={{ fontSize: 72, opacity: 0.92 }}>{niche.glyph}</span>
          </div>

          {/* what you'll learn */}
          <section className="card pad">
            <h2 style={{ fontSize: 17, marginBottom: 14 }}>Qué aprenderás</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {course.whatYouLearn.map((point) => (
                <div key={point} style={{ display: "flex", gap: 9, fontSize: 13.5, color: "var(--tx-2)" }}>
                  <Icon name="check" size={17} style={{ color: "var(--profit)", flexShrink: 0, marginTop: 1 }} />
                  {point}
                </div>
              ))}
            </div>
          </section>

          {/* curriculum */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h2 style={{ fontSize: 17 }}>Contenido del curso</h2>
              <span className="mono" style={{ fontSize: 12, color: "var(--tx-3)" }}>
                {course.modulesCount} módulos · {course.lessonsCount} lecciones · {course.durationHours}h
              </span>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
              {modules.map((mod) => (
                <div key={mod.id}>
                  <div style={{ padding: "12px 16px", background: "var(--bg-3)", borderBottom: "1px solid var(--line-1)", fontWeight: 600, fontSize: 13.5 }}>
                    {mod.n}. {mod.title}
                  </div>
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        padding: "10px 16px",
                        borderBottom: "1px solid var(--line-1)",
                        fontSize: 13,
                      }}
                    >
                      <Icon name={LESSON_ICON[lesson.format]} size={15} style={{ color: "var(--tx-3)" }} />
                      <span style={{ flex: 1, color: "var(--tx-2)" }}>{lesson.title}</span>
                      {lesson.freePreview ? (
                        <Link href={`/marketplace/${course.slug}/learn`} className="mono" style={{ fontSize: 11.5, color: "var(--brand)", textDecoration: "none" }}>
                          Vista previa
                        </Link>
                      ) : (
                        <Icon name="lock" size={13} style={{ color: "var(--tx-4)" }} />
                      )}
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--tx-4)", width: 42, textAlign: "right" }}>
                        {lesson.durationMin}m
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* requirements */}
          <section className="card pad">
            <h2 style={{ fontSize: 17, marginBottom: 12 }}>Requisitos</h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
              {course.requirements.map((req) => (
                <li key={req} style={{ fontSize: 13.5, color: "var(--tx-2)" }}>{req}</li>
              ))}
            </ul>
          </section>

          {/* instructor */}
          {instructor && (
            <section className="card pad">
              <h2 style={{ fontSize: 17, marginBottom: 14 }}>Tu instructor</h2>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Avatar user={instructor} size={56} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <strong style={{ fontSize: 15 }}>{instructor.name.replace(/^You · /, "")}</strong>
                    {instructor.verified && <VerifiedTick size={14} />}
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 2 }}>
                    @{instructor.handle} · {niche.name}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.55, marginTop: 12 }}>{instructor.bio}</p>
            </section>
          )}

          {/* reviews */}
          <section>
            <h2 style={{ fontSize: 17, marginBottom: 12 }}>Reseñas</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviews.map((review) => {
                const author = byId[review.author] as Profile | undefined;
                return (
                  <div key={review.id} className="card pad" style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                      {author && <Avatar user={author} size={28} />}
                      <strong style={{ fontSize: 13 }}>{author?.name.replace(/^You · /, "") ?? "Alumno"}</strong>
                      {review.verifiedPurchase && (
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--profit)" }}>✓ Compra verificada</span>
                      )}
                      <div style={{ flex: 1 }} />
                      <Stars rating={review.rating} size={12} />
                    </div>
                    <p style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.5 }}>{review.text}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* sticky buy sidebar */}
        <aside style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card pad" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 30, fontWeight: 700, fontFamily: "var(--f-display)" }}>
                {course.price === 0 ? "Gratis" : `€${course.price}`}
              </span>
              {course.originalPrice && (
                <>
                  <span className="mono" style={{ fontSize: 15, color: "var(--tx-4)", textDecoration: "line-through" }}>
                    €{course.originalPrice}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--profit)" }}>-{discount}%</span>
                </>
              )}
            </div>

            <BuyButton courseId={course.id} slug={course.slug} price={course.price} />

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="sec-label" style={{ fontSize: 10 }}>Este curso incluye</div>
              {[
                ["play", `${course.durationHours}h de contenido`],
                ["book", `${course.lessonsCount} lecciones`],
                ["globe", course.language === "es" ? "Español" : course.language],
                ["bolt", "Acceso de por vida"],
                ...(course.certificate ? [["shield", "Certificado al completar"] as const] : []),
              ].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--tx-2)" }}>
                  <Icon name={icon as "play"} size={15} style={{ color: "var(--tx-3)" }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Más en {niche.name}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(258px, 1fr))", gap: 16 }}>
            {related.map((rc) => (
              <CourseCard key={rc.id} course={rc} instructor={byId[rc.instructorId]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

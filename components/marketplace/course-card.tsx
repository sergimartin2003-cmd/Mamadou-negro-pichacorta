import Link from "next/link";
import type { Course, Profile } from "@/types/db";
import { Avatar, VerifiedTick, Icon } from "@/components/ui";
import { getNiche } from "@/config/niches";
import { NicheChip } from "@/components/niche/niche-chip";
import { Stars } from "./stars";

interface CourseCardProps {
  course: Course;
  instructor?: Profile;
}

function priceLabel(price: number): string {
  return price === 0 ? "Gratis" : `€${price}`;
}

export function CourseCard({ course, instructor }: CourseCardProps) {
  const niche = getNiche(course.niche);
  const bestseller = course.rating > 4.7 && course.students > 100;
  const isNew = course.createdDaysAgo < 30;

  return (
    <Link
      href={`/marketplace/${course.slug}`}
      className="card fade-up"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        borderRadius: "var(--r-lg)",
      }}
    >
      {/* thumbnail */}
      <div
        style={{
          height: 132,
          position: "relative",
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(140deg, color-mix(in srgb, ${niche.color} 38%, var(--bg-2)), var(--bg-3))`,
        }}
      >
        <span aria-hidden style={{ fontSize: 44, opacity: 0.92 }}>
          {niche.glyph}
        </span>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {bestseller && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "var(--r-pill)",
                background: "var(--t-gold)",
                color: "#0B0F14",
              }}
            >
              Bestseller
            </span>
          )}
          {isNew && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "var(--r-pill)",
                background: "color-mix(in srgb, var(--profit) 22%, transparent)",
                color: "var(--profit)",
                border: "1px solid var(--profit-line)",
              }}
            >
              Nuevo
            </span>
          )}
        </div>
        <span
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "var(--f-mono)",
            padding: "4px 10px",
            borderRadius: "var(--r-pill)",
            background: "rgba(7,9,13,0.7)",
            color: course.price === 0 ? "var(--profit)" : "var(--tx-1)",
            backdropFilter: "blur(6px)",
          }}
        >
          {priceLabel(course.price)}
        </span>
      </div>

      {/* body */}
      <div style={{ padding: "13px 14px 15px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NicheChip niche={course.niche} />
          <span className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
            {course.level}
          </span>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {course.title}
        </h3>

        {instructor && (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Avatar user={instructor} size={20} />
            <span style={{ fontSize: 12, color: "var(--tx-2)" }}>
              {instructor.name.replace(/^You · /, "")}
            </span>
            {instructor.verified && <VerifiedTick size={11} />}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
          <Stars rating={course.rating} />
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--t-gold)" }}>
            {course.rating.toFixed(1)}
          </span>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)" }}>
            ({course.reviewsCount})
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11.5, color: "var(--tx-3)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="play" size={13} /> {course.lessonsCount} lecciones
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="book" size={13} /> {course.durationHours}h
          </span>
          <span className="mono">{course.students.toLocaleString()} alumnos</span>
        </div>
      </div>
    </Link>
  );
}

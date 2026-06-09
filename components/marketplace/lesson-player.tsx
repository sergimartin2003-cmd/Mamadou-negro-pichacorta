"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Course, CourseModule } from "@/types/db";
import { Icon } from "@/components/ui";
import { getNiche } from "@/config/niches";
import { Progress } from "@/components/ui/progress";

interface LessonPlayerProps {
  course: Course;
  modules: CourseModule[];
}

interface FlatLesson {
  id: string;
  title: string;
  durationMin: number;
  moduleTitle: string;
}

export function LessonPlayer({ course, modules }: LessonPlayerProps) {
  const niche = getNiche(course.niche);
  const flat = useMemo<FlatLesson[]>(
    () =>
      modules.flatMap((m) =>
        m.lessons.map((l) => ({ id: l.id, title: l.title, durationMin: l.durationMin, moduleTitle: m.title })),
      ),
    [modules],
  );

  const [currentId, setCurrentId] = useState(flat[0]?.id ?? "");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const index = Math.max(0, flat.findIndex((l) => l.id === currentId));
  const current = flat[index];
  const progress = flat.length ? (completed.size / flat.length) * 100 : 0;

  function toggleComplete(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function go(delta: number) {
    const target = flat[index + delta];
    if (target) setCurrentId(target.id);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", minHeight: "calc(100vh - var(--topbar-h))" }} className="th-learn-grid">
      {/* curriculum sidebar */}
      <aside style={{ borderRight: "1px solid var(--line-1)", background: "var(--bg-2)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--line-1)" }}>
          <Link href={`/marketplace/${course.slug}`} className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)", textDecoration: "none" }}>
            ← {course.title}
          </Link>
          <div style={{ marginTop: 10 }}>
            <Progress value={progress} color={niche.color} />
            <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)", marginTop: 6 }}>
              {completed.size}/{flat.length} completadas
            </div>
          </div>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {modules.map((mod) => (
            <div key={mod.id}>
              <div className="sec-label" style={{ padding: "12px 16px 6px", fontSize: 10 }}>
                {mod.n}. {mod.title}
              </div>
              {mod.lessons.map((lesson) => {
                const active = lesson.id === currentId;
                const done = completed.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentId(lesson.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 16px",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 12.5,
                      background: active ? "color-mix(in srgb, var(--brand) 12%, transparent)" : "transparent",
                      color: active ? "var(--tx-1)" : "var(--tx-2)",
                      borderLeft: `2px solid ${active ? "var(--brand)" : "transparent"}`,
                    }}
                  >
                    <Icon
                      name={done ? "check" : "play"}
                      size={14}
                      style={{ color: done ? "var(--profit)" : "var(--tx-4)", flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>{lesson.title}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--tx-4)" }}>{lesson.durationMin}m</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* lesson stage */}
      <main style={{ padding: "0 0 40px" }}>
        <div
          style={{
            height: 340,
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(140deg, color-mix(in srgb, ${niche.color} 26%, var(--bg-1)), var(--bg-1))`,
            borderBottom: "1px solid var(--line-1)",
          }}
        >
          <div style={{ display: "grid", placeItems: "center", gap: 12 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid var(--line-2)",
              }}
            >
              <Icon name="play" size={26} fill style={{ color: "#fff" }} />
            </div>
            <span className="mono" style={{ fontSize: 12, color: "var(--tx-3)" }}>Vista previa de la lección</span>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div className="sec-label" style={{ fontSize: 10, marginBottom: 4 }}>{current?.moduleTitle}</div>
            <h1 style={{ fontSize: 22 }}>{current?.title}</h1>
          </div>
          <p style={{ fontSize: 14, color: "var(--tx-2)", lineHeight: 1.6 }}>
            En esta lección el instructor desglosa el tema con ejemplos reales y los números encima
            de la mesa. Aplica lo aprendido antes de pasar a la siguiente.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", borderTop: "1px solid var(--line-1)", paddingTop: 16 }}>
            <button className="btn" onClick={() => go(-1)} disabled={index === 0}>
              <Icon name="arrowR" size={16} style={{ transform: "rotate(180deg)" }} /> Anterior
            </button>
            <button
              className={`btn ${current && completed.has(current.id) ? "" : "primary"}`}
              onClick={() => current && toggleComplete(current.id)}
            >
              <Icon name={current && completed.has(current.id) ? "check" : "check"} size={16} />
              {current && completed.has(current.id) ? "Completada" : "Marcar como completada"}
            </button>
            <div style={{ flex: 1 }} />
            <button className="btn" onClick={() => go(1)} disabled={index >= flat.length - 1}>
              Siguiente <Icon name="arrowR" size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

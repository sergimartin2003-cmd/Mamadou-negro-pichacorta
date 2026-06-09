"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { PathCard } from "./path-card";
import { LessonView } from "./lesson-view";
import type { LearningPath, Lesson } from "@/types/db";

interface LearningHubProps {
  paths: LearningPath[];
  lessons: Lesson[];
  /** Optional slot rendered above the hub (e.g. the in-section niche selector). */
  header?: ReactNode;
}

const LEVEL = 12;
const LEVEL_PROGRESS = 0.68;
const XP_TO_NEXT = 680;
const DAY_STREAK = 8;
const LESSONS_DONE = 28;
const PATHS_ACTIVE = 3;

export function LearningHub({ paths, lessons, header }: LearningHubProps) {
  const [openPath, setOpenPath] = useState<LearningPath | null>(null);
  const totalXp = paths.reduce((s, p) => s + p.xp, 0);
  const circumference = 2 * Math.PI * 31;

  if (openPath) {
    return (
      <LessonView
        path={openPath}
        lessons={lessons}
        onBack={() => setOpenPath(null)}
      />
    );
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      {header}

      {/* XP header */}
      <div
        className="card"
        style={{
          padding: "20px 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
          background: "linear-gradient(110deg, color-mix(in srgb, var(--t-gold) 12%, var(--bg-2)), var(--bg-2) 70%)",
        }}
      >
        <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="36" cy="36" r="31" fill="none" stroke="var(--bg-4)" strokeWidth="6" />
            <circle
              cx="36" cy="36" r="31" fill="none"
              stroke="var(--t-gold)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${LEVEL_PROGRESS * circumference} ${circumference}`}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 20 }}>
            {LEVEL}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--t-gold)" }}>Learning level {LEVEL}</div>
          <h1 style={{ fontSize: 22, margin: "4px 0" }}>Keep your streak alive</h1>
          <div style={{ fontSize: 13, color: "var(--tx-3)" }}>
            <span className="mono" style={{ color: "var(--tx-1)" }}>{totalXp.toLocaleString()} XP</span>
            {" "}· {XP_TO_NEXT} XP to level {LEVEL + 1}
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
          {([["🔥 " + DAY_STREAK, "Day streak"], [String(LESSONS_DONE), "Lessons done"], [String(PATHS_ACTIVE), "Paths active"]] as const).map(([v, l]) => (
            <div key={l}>
              <div className="mono" style={{ fontWeight: 700, fontSize: 20 }}>{v}</div>
              <div className="sec-label" style={{ fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 17 }}>Learning paths</h2>
        <button className="chip">Browse all <Icon name="chevR" size={14} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {paths.map((p) => (
          <PathCard key={p.id} path={p} onOpen={() => setOpenPath(p)} />
        ))}
      </div>
    </div>
  );
}

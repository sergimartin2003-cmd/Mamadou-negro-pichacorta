"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { LearningPath, Lesson } from "@/types/db";
import { QuizCard } from "./quiz-card";

interface LessonViewProps {
  path: LearningPath;
  lessons: Lesson[];
  onBack: () => void;
}

export function LessonView({ path, lessons, onBack }: LessonViewProps) {
  const firstUnlocked = lessons.find((l) => l.state !== "locked")?.id ?? lessons[0]?.id;
  const [activeId, setActiveId] = useState<string>(firstUnlocked);
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(lessons.filter((l) => l.state === "done").map((l) => l.id)),
  );

  const cur = lessons.find((l) => l.id === activeId) ?? lessons[0];
  if (!cur) return null;

  function completeLesson() {
    setCompletedIds((prev) => new Set([...prev, cur.id]));
    const idx = lessons.findIndex((l) => l.id === cur.id);
    const next = lessons[idx + 1];
    if (next && next.state !== "locked") setActiveId(next.id);
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", gap: 18, flexWrap: "wrap" }}>
      {/* lesson list */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <button className="chip" onClick={onBack} style={{ marginBottom: 14 }}>
          <Icon name="arrowR" size={14} style={{ transform: "rotate(180deg)" }} /> All paths
        </button>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line-1)", display: "flex", gap: 11, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", fontSize: 19, background: `color-mix(in srgb, ${path.color} 16%, transparent)`, color: path.color, flexShrink: 0 }}>
              {path.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{path.name}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{path.done}/{path.modules} done</div>
            </div>
          </div>
          {lessons.map((l) => {
            const on = l.id === activeId;
            const isDone = completedIds.has(l.id);
            return (
              <button
                key={l.id}
                disabled={l.state === "locked"}
                onClick={() => l.state !== "locked" && setActiveId(l.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", border: "none", borderBottom: "1px solid var(--line-1)",
                  background: on ? "var(--bg-3)" : "transparent", textAlign: "left",
                  opacity: l.state === "locked" ? 0.5 : 1,
                  cursor: l.state === "locked" ? "default" : "pointer",
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  display: "grid", placeItems: "center", fontSize: 12,
                  fontFamily: "var(--f-mono)", fontWeight: 700,
                  background: isDone ? "var(--profit)" : l.state === "current" ? "var(--brand)" : "var(--bg-4)",
                  color: l.state === "locked" ? "var(--tx-4)" : "#fff",
                }}>
                  {isDone
                    ? <Icon name="check" size={14} sw={2.6} />
                    : l.state === "locked"
                    ? <Icon name="lock" size={12} />
                    : l.n}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: on ? 700 : 600, color: on ? "var(--tx-1)" : "var(--tx-2)" }}>{l.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--tx-4)" }}>{l.min} min</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* lesson content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="card" style={{ padding: "26px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <span className="chip tag" style={{ color: path.color, borderColor: `color-mix(in srgb, ${path.color} 36%, transparent)` }}>
              Lesson {cur.n} of {path.modules}
            </span>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)" }}>{cur.min} min read</span>
          </div>
          <h1 style={{ fontSize: 26, marginBottom: 16 }}>{cur.name}</h1>
          <Progress value={(cur.n / path.modules) * 100} color={path.color} />

          <p style={{ fontSize: 15, color: "var(--tx-2)", lineHeight: 1.7, marginTop: 22 }}>
            Reward-to-risk (R:R) is the ratio between what you stand to gain and what you risk on a trade. A 3:1 setup means you risk one unit to make three. Combined with your win rate, it defines your{" "}
            <strong style={{ color: "var(--tx-1)" }}>expectancy</strong> — the average outcome per trade over a large sample.
          </p>

          <div className="ph-img" style={{ height: 180, borderRadius: "var(--r-md)", margin: "20px 0" }}>
            diagram · expectancy = (win% × avgWin) − (loss% × avgLoss)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "8px 0 6px" }}>
            <div className="card pad" style={{ background: "var(--bg-3)" }}>
              <div className="sec-label" style={{ marginBottom: 6 }}>Key takeaway</div>
              <div style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.5 }}>A low win rate can still be highly profitable if your average R:R is high enough.</div>
            </div>
            <div className="card pad" style={{ background: "var(--bg-3)" }}>
              <div className="sec-label" style={{ marginBottom: 6 }}>Try it</div>
              <div style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.5 }}>At 40% win rate and 3:1 R:R, expectancy is +0.6R per trade.</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--line-1)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--t-gold)", fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 13 }}>
              <Icon name="bolt" size={15} fill /> +120 XP on completion
            </span>
            <div style={{ flex: 1 }} />
            <Button variant="default">Previous</Button>
            <Button variant="primary" onClick={completeLesson}>
              <Icon name="check" size={16} sw={2.4} /> Complete lesson
            </Button>
          </div>
        </div>

        {/* end-of-path quiz: earn XP + keep the streak */}
        <QuizCard niche={path.niche} pathId={path.id} />
      </div>
    </div>
  );
}

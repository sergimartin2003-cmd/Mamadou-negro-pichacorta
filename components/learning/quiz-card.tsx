"use client";

import { useState } from "react";
import type { NicheSlug } from "@/types/db";
import { Icon } from "@/components/ui";
import { QUIZ_BANK } from "@/lib/data/quiz-seed";
import { recordQuizCompletion } from "@/lib/actions/social";

interface QuizCardProps {
  niche: NicheSlug;
  pathId: string;
}

/**
 * End-of-path quiz: answer the niche's three questions, earn XP and keep the
 * streak alive. Grading is instant client-side; XP/streak persist via the
 * server action (no-op in demo).
 */
export function QuizCard({ niche, pathId }: QuizCardProps) {
  const questions = QUIZ_BANK[niche] ?? [];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [earned, setEarned] = useState<number | null>(null);

  if (questions.length === 0) return null;

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;

  function submit() {
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    recordQuizCompletion(pathId, correct).then((res) => {
      if (res.ok) setEarned(res.xp ?? correct * 10);
    });
  }

  return (
    <div className="card pad" style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            background: "color-mix(in srgb, var(--t-gold) 18%, transparent)",
            color: "var(--t-gold)",
          }}
        >
          <Icon name="bolt" size={16} fill />
        </span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 15 }}>Quiz del path</strong>
          <div style={{ fontSize: 12, color: "var(--tx-3)" }}>
            {questions.length} preguntas · hasta {questions.length * 10} XP
          </div>
        </div>
        {earned !== null && (
          <span className="chip tag" style={{ color: "var(--t-gold)", borderColor: "color-mix(in srgb, var(--t-gold) 36%, transparent)" }}>
            +{earned} XP
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {questions.map((q, qi) => (
          <div key={q.id}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>
              {qi + 1}. {q.prompt}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {q.options.map((option, oi) => {
                const chosen = answers[q.id] === oi;
                const isCorrect = submitted && oi === q.correctIndex;
                const isWrong = submitted && chosen && oi !== q.correctIndex;
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                    style={{
                      textAlign: "left",
                      padding: "9px 12px",
                      fontSize: 13,
                      cursor: submitted ? "default" : "pointer",
                      borderRadius: "var(--r-md)",
                      background: isCorrect
                        ? "var(--profit-dim)"
                        : isWrong
                          ? "var(--loss-dim)"
                          : chosen
                            ? "color-mix(in srgb, var(--brand) 14%, transparent)"
                            : "var(--bg-3)",
                      border: `1px solid ${
                        isCorrect
                          ? "var(--profit-line)"
                          : isWrong
                            ? "var(--loss-line)"
                            : chosen
                              ? "var(--brand-line)"
                              : "var(--line-1)"
                      }`,
                      color: "var(--tx-1)",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        {!submitted ? (
          <button className="btn primary" onClick={submit} disabled={!allAnswered}>
            Corregir quiz
          </button>
        ) : (
          <span style={{ fontSize: 13.5, fontWeight: 600, color: correct === questions.length ? "var(--profit)" : "var(--tx-2)" }}>
            {correct}/{questions.length} correctas
            {correct === questions.length ? " — perfecto 🔥" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

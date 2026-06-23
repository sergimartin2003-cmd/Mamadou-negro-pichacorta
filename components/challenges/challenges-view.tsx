"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import {
  CHALLENGE_PERIODS,
  progressFraction,
  isComplete,
  isClaimable,
  allComplete,
  streakBonus,
  type Challenge,
  type ChallengeProgress,
  type ChallengePeriod,
} from "@/lib/domain/challenges";

interface ChallengesViewProps {
  challenges: Challenge[];
  progress: Record<string, ChallengeProgress>;
}

const PERIOD_LABEL: Record<ChallengePeriod, string> = {
  daily: "Diarios",
  weekly: "Semanales",
  monthly: "Mensuales",
};

const PERIOD_RESET: Record<ChallengePeriod, string> = {
  daily: "Se reinician cada 24 h",
  weekly: "Se reinician cada lunes",
  monthly: "Se reinician el día 1",
};

export function ChallengesView({ challenges, progress: initial }: ChallengesViewProps) {
  const [period, setPeriod] = useState<ChallengePeriod>("daily");
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>(initial);
  const [claimedXp, setClaimedXp] = useState(0);

  const inPeriod = useMemo(() => challenges.filter((c) => c.period === period), [challenges, period]);
  const periodAllDone = allComplete(inPeriod, progress);

  const claim = (c: Challenge) => {
    setProgress((prev) => ({ ...prev, [c.id]: { ...prev[c.id], claimed: true } }));
    setClaimedXp((x) => x + c.reward);
  };

  const options = CHALLENGE_PERIODS.map((p) => ({ k: p, label: PERIOD_LABEL[p] }));

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        className="card"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          background: "linear-gradient(110deg, color-mix(in srgb, var(--brand) 13%, var(--bg-2)), var(--bg-2) 70%)",
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)", flexShrink: 0 }}>
          <Icon name="target" size={24} style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Desafíos</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>Completa retos, gana XP</h1>
          <div style={{ fontSize: 13, color: "var(--tx-3)" }}>{PERIOD_RESET[period]}</div>
        </div>
        {claimedXp > 0 && (
          <div style={{ textAlign: "center" }}>
            <div className="mono" style={{ fontWeight: 700, fontSize: 20, color: "var(--t-gold)" }}>+{claimedXp.toLocaleString()}</div>
            <div className="sec-label" style={{ fontSize: 10 }}>XP reclamada</div>
          </div>
        )}
      </div>

      <Segmented options={options} value={period} onChange={(k) => setPeriod(k as ChallengePeriod)} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {inPeriod.map((c) => {
          const p = progress[c.id] ?? { current: 0, claimed: false };
          const frac = progressFraction(c, p.current);
          const done = isComplete(c, p.current);
          const claimable = isClaimable(c, p);
          return (
            <div key={c.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {done && <Icon name="check" size={16} style={{ color: "var(--profit)" }} />}
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${frac * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: "100%", background: done ? "var(--profit)" : "var(--brand)", borderRadius: 999 }}
                  />
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)", marginTop: 5 }}>
                  {Math.min(p.current, c.goal)} / {c.goal}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 96 }}>
                <div className="mono" style={{ fontWeight: 700, color: "var(--t-gold)", fontSize: 15, marginBottom: 6 }}>+{c.reward} XP</div>
                {p.claimed ? (
                  <span className="chip" style={{ color: "var(--tx-3)" }}>Reclamado</span>
                ) : (
                  <Button size="sm" variant={claimable ? "primary" : "default"} disabled={!claimable} onClick={() => claim(c)}>
                    {claimable ? "Reclamar" : "En curso"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="card"
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderColor: periodAllDone ? "var(--profit-line)" : "var(--line-1)",
          background: periodAllDone ? "var(--profit-dim)" : "var(--bg-2)",
        }}
      >
        <Icon name="flame" size={20} fill style={{ color: periodAllDone ? "var(--profit)" : "var(--tx-3)" }} />
        <div style={{ fontSize: 13, color: "var(--tx-2)" }}>
          {periodAllDone ? (
            <>¡Todos los {PERIOD_LABEL[period].toLowerCase()} completados! Bonus de racha: <strong style={{ color: "var(--t-gold)" }}>+{streakBonus(period).toLocaleString()} XP</strong></>
          ) : (
            <>Completa todos los {PERIOD_LABEL[period].toLowerCase()} para un bonus de <strong>+{streakBonus(period).toLocaleString()} XP</strong>.</>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { TIERS, tierFor, nextTier, tierProgress, divisionFor, tierGlyph } from "@/lib/domain/tiers";
import { seasonalReset } from "@/lib/domain/elo";
import { daysRemaining, seasonProgress, rewardFor, type Season } from "@/lib/domain/season";

interface LeaguesViewProps {
  season: Season;
  me: { name: string; rp: number };
}

export function LeaguesView({ season, me }: LeaguesViewProps) {
  // Time-dependent values are computed after mount to avoid SSR/client drift.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const myTier = tierFor(me.rp);
  const next = nextTier(me.rp);
  const progress = tierProgress(me.rp);
  const division = divisionFor(me.rp);
  const resetRp = seasonalReset(me.rp);
  const days = now ? daysRemaining(season, now) : null;
  const elapsed = now ? seasonProgress(season, now) : 0;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        className="card"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(110deg, color-mix(in srgb, var(--t-master) 16%, var(--bg-2)), var(--bg-2) 72%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="sec-label" style={{ color: "var(--t-master)" }}>Temporada {season.number}</div>
            <h1 style={{ fontSize: 23, margin: "2px 0" }}>{season.name}</h1>
            <div style={{ fontSize: 13, color: "var(--tx-3)" }}>
              {days == null ? "Cargando…" : days > 0 ? `${days} días restantes` : "Temporada finalizada"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: myTier.color }}>
              {tierGlyph(myTier.key)} {me.rp.toLocaleString()}
            </div>
            <div className="sec-label" style={{ fontSize: 10 }}>
              {myTier.name} {division}
            </div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden", marginTop: 14 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${elapsed}%` }}
            transition={{ duration: 0.6 }}
            style={{ height: "100%", background: "var(--t-master)", borderRadius: 999 }}
          />
        </div>
      </div>

      {/* Progress to next tier */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: "var(--tx-2)" }}>
            {next ? `Progreso hacia ${next.name}` : "Has alcanzado el tier máximo"}
          </span>
          <span className="mono" style={{ color: "var(--tx-3)" }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
            style={{ height: "100%", background: myTier.color, borderRadius: 999 }}
          />
        </div>
        <div style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 10 }}>
          Al cerrar la temporada, tu RP se ajusta a{" "}
          <span className="mono" style={{ color: "var(--tx-1)" }}>{resetRp.toLocaleString()}</span>{" "}
          (soft reset) y empieza una nueva con recompensas exclusivas.
        </div>
      </div>

      {/* Ladder */}
      <div>
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Ligas y recompensas de fin de temporada</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...TIERS].reverse().map((tier) => {
            const reward = rewardFor(tier.key);
            const mine = tier.key === myTier.key;
            return (
              <div
                key={tier.key}
                className="card"
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  borderColor: mine ? tier.color : "var(--line-1)",
                  background: mine ? `color-mix(in srgb, ${tier.color} 10%, var(--bg-2))` : "var(--bg-2)",
                }}
              >
                <div style={{ fontSize: 22, color: tier.color, width: 28, textAlign: "center" }}>{tierGlyph(tier.key)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: tier.color }}>{tier.name}</span>
                    {mine && <span className="chip" style={{ fontSize: 10, color: tier.color, borderColor: tier.color }}>Tú</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{tier.min.toLocaleString()}+ RP</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, maxWidth: 240 }}>
                  <div className="mono" style={{ fontWeight: 700, color: "var(--t-gold)", fontSize: 14 }}>+{reward.xp.toLocaleString()} XP</div>
                  <div style={{ fontSize: 11.5, color: "var(--tx-3)" }}>{reward.loot}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="crown" size={20} style={{ color: "var(--t-gold)" }} />
        <div style={{ fontSize: 13, color: "var(--tx-2)" }}>
          <strong>Top 500</strong> — los 500 mejores traders del mundo por encima de Élite compiten en una tabla global propia con recompensas únicas.
        </div>
      </div>
    </div>
  );
}

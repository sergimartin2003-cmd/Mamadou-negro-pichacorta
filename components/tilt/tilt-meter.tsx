"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import {
  computeTilt,
  tiltLevel,
  LOCK_DURATION_MIN,
  type TiltTrade,
  type TiltLevel,
} from "@/lib/domain/tilt";

const LEVEL_META: Record<TiltLevel, { label: string; color: string }> = {
  calm: { label: "En calma", color: "var(--profit)" },
  caution: { label: "Precaución", color: "var(--t-gold)" },
  danger: { label: "Riesgo alto", color: "#FF8A3D" },
  locked: { label: "Bloqueado", color: "var(--loss)" },
};

const R = 54;
const CIRC = 2 * Math.PI * R;

export function TiltMeter({ trades: initial }: { trades: TiltTrade[] }) {
  const [trades, setTrades] = useState<TiltTrade[]>(initial);
  const [impulses, setImpulses] = useState(0);

  const tilt = useMemo(() => computeTilt(trades), [trades]);
  const level = tiltLevel(tilt.score);
  const meta = LEVEL_META[level];

  const simulate = () => {
    const n = impulses + 1;
    setImpulses(n);
    // Each impulsive trade: a fresh loss, upsized vs. the last loss.
    setTrades((ts) => [{ id: `imp${n}`, minutesAgo: 0, result: "loss", size: 100 + n * 120 }, ...ts]);
  };

  const reset = () => {
    setTrades(initial);
    setImpulses(0);
  };

  const factors = [
    { label: "Rapid fire", value: tilt.rapid, cap: 40, desc: "operaciones en 5 min" },
    { label: "Racha de pérdidas", value: tilt.streak, cap: 30, desc: "pérdidas consecutivas" },
    { label: "Revenge sizing", value: tilt.revenge, cap: 30, desc: "subir tamaño tras perder" },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)" }}>
          <Icon name="flame" size={22} fill style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Tilt-Meter · cortafuegos mental</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>Tu salud de trading</h1>
          <div style={{ fontSize: 12.5, color: "var(--tx-3)" }}>Monitorea el comportamiento, no solo el PnL.</div>
        </div>
      </div>

      {tilt.locked && (
        <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, background: "var(--loss-dim)", borderColor: "var(--loss)" }}>
          <Icon name="lock" size={18} style={{ color: "var(--loss)" }} />
          <div style={{ fontSize: 13, color: "var(--tx-1)" }}>
            <strong>Cuenta bloqueada {Math.round(LOCK_DURATION_MIN / 60)} h.</strong> Feed, competiciones y DMs están desactivados.{" "}
            <Link href="/academy" style={{ color: "var(--loss)", fontWeight: 600 }}>Completa una lección</Link> en la Academia para desbloquear antes.
          </div>
        </div>
      )}

      {/* Gauge */}
      <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--bg-4)" strokeWidth="11" />
            <motion.circle
              cx="70" cy="70" r={R} fill="none"
              stroke={meta.color} strokeWidth="11" strokeLinecap="round"
              initial={false}
              animate={{ strokeDasharray: `${(tilt.score / 100) * CIRC} ${CIRC}` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
            <div>
              <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: meta.color }}>{tilt.score}</div>
              <div className="sec-label" style={{ fontSize: 9 }}>/ 100</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: meta.color }} />
            <span style={{ fontWeight: 700, color: meta.color, fontSize: 16 }}>{meta.label}</span>
          </div>
          {factors.map((f) => (
            <div key={f.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--tx-2)" }}>{f.label} <span style={{ color: "var(--tx-4)" }}>· {f.desc}</span></span>
                <span className="mono" style={{ color: "var(--tx-3)" }}>{f.value}/{f.cap}</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
                <motion.div animate={{ width: `${(f.value / f.cap) * 100}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", background: meta.color, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo controls */}
      <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: "var(--tx-3)", flex: 1, minWidth: 180 }}>
          Demo: simula operaciones impulsivas (pérdidas encadenadas con tamaño creciente) y observa cómo sube el Tilt-Meter hasta bloquear la cuenta.
        </span>
        <button className="btn" onClick={simulate} style={{ borderColor: "var(--loss-line)", color: "var(--loss)" }}>
          <Icon name="down" size={15} /> Operación impulsiva
        </button>
        <button className="btn" onClick={reset}>Reiniciar</button>
      </div>
    </div>
  );
}

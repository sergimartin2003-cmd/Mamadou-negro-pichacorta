"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import {
  marketValue,
  unrealizedPnl,
  unrealizedPnlPct,
  totalValue,
  totalUnrealizedPnl,
  totalReturnPct,
  weightPct,
  allocationByType,
  allocationByRegion,
  concentration,
  diversificationScore,
  topMovers,
  type PortfolioSnapshot,
  type AssetType,
  type AllocationSlice,
} from "@/lib/domain/portfolio";

const TYPE_META: Record<AssetType, { label: string; color: string }> = {
  stock: { label: "Acciones", color: "var(--brand)" },
  etf: { label: "ETFs", color: "var(--t-diamond)" },
  crypto: { label: "Crypto", color: "var(--t-gold)" },
  realestate: { label: "Inmobiliario", color: "var(--t-platinum)" },
  bond: { label: "Bonos", color: "var(--t-silver)" },
  commodity: { label: "Materias primas", color: "var(--t-master)" },
  cash: { label: "Efectivo", color: "var(--tx-3)" },
};

function money(n: number, c: string): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}${c}${Math.abs(Math.round(n)).toLocaleString()}`;
}
function pct(frac: number): string {
  const sign = frac > 0 ? "+" : "";
  return `${sign}${(frac * 100).toFixed(1)}%`;
}
function sliceColor(key: string): string {
  return (TYPE_META as Record<string, { color: string }>)[key]?.color ?? "var(--brand)";
}
function sliceLabel(key: string): string {
  return (TYPE_META as Record<string, { label: string }>)[key]?.label ?? key;
}

export function PortfolioView({ snapshot }: { snapshot: PortfolioSnapshot }) {
  const [allocTab, setAllocTab] = useState<"type" | "region">("type");
  const { holdings, currency: c } = snapshot;

  const m = useMemo(
    () => ({
      total: totalValue(holdings),
      pnl: totalUnrealizedPnl(holdings),
      ret: totalReturnPct(holdings),
      byType: allocationByType(holdings),
      byRegion: allocationByRegion(holdings),
      conc: concentration(holdings),
      div: diversificationScore(holdings),
      movers: topMovers(holdings, holdings.length),
    }),
    [holdings],
  );

  const alloc = allocTab === "type" ? m.byType : m.byRegion;
  const positive = m.pnl >= 0;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        className="card"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          background: `linear-gradient(110deg, color-mix(in srgb, ${positive ? "var(--profit)" : "var(--loss)"} 12%, var(--bg-2)), var(--bg-2) 72%)`,
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)" }}>
          <Icon name="pie" size={22} style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Portfolio Tracker</div>
          <h1 className="mono" style={{ fontSize: 28, margin: "2px 0" }}>{money(m.total, c)}</h1>
          <div style={{ fontSize: 13, color: positive ? "var(--profit)" : "var(--loss)" }}>
            {money(m.pnl, c)} ({pct(m.ret)}) sin realizar
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <Gauge label="Concentración" value={`${(m.conc * 100).toFixed(0)}%`} hint="mayor activo" warn={m.conc > 0.4} />
          <Gauge label="Diversificación" value={`${(m.div * 100).toFixed(0)}`} hint="0–100" warn={m.div < 0.5} />
        </div>
      </div>

      {/* Allocation */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, margin: 0 }}>Distribución</h2>
          <Segmented
            options={[{ k: "type", label: "Por activo" }, { k: "region", label: "Por región" }]}
            value={allocTab}
            onChange={(k) => setAllocTab(k as "type" | "region")}
            size="sm"
          />
        </div>
        <AllocationBar slices={alloc} byType={allocTab === "type"} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
          {alloc.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: allocTab === "type" ? sliceColor(s.key) : "var(--brand)" }} />
              <span style={{ color: "var(--tx-2)" }}>{allocTab === "type" ? sliceLabel(s.key) : s.key}</span>
              <span className="mono" style={{ color: "var(--tx-3)" }}>{(s.pct * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="sec-label" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, padding: "11px 16px", borderBottom: "1px solid var(--line-1)", fontSize: 11 }}>
          <span>Activo</span>
          <span style={{ textAlign: "right" }}>Valor</span>
          <span style={{ textAlign: "right" }}>P&L</span>
          <span style={{ textAlign: "right" }}>Peso</span>
        </div>
        {m.movers.map((hd) => {
          const val = marketValue(hd);
          const p = unrealizedPnl(hd);
          const pp = unrealizedPnlPct(hd);
          const up = p >= 0;
          return (
            <div key={hd.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--line-1)", alignItems: "center", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: TYPE_META[hd.type].color, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hd.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{hd.symbol}</div>
                </div>
              </div>
              <span className="mono" style={{ textAlign: "right" }}>{money(val, c)}</span>
              <span className="mono" style={{ textAlign: "right", color: up ? "var(--profit)" : "var(--loss)" }}>
                {money(p, c)}<br />
                <span style={{ fontSize: 11 }}>{pct(pp)}</span>
              </span>
              <span className="mono" style={{ textAlign: "right", color: "var(--tx-3)" }}>{(weightPct(val, m.total) * 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AllocationBar({ slices, byType }: { slices: AllocationSlice[]; byType: boolean }) {
  return (
    <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", background: "var(--bg-4)" }}>
      {slices.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ width: 0 }}
          animate={{ width: `${s.pct * 100}%` }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
          title={`${byType ? sliceLabel(s.key) : s.key} · ${(s.pct * 100).toFixed(1)}%`}
          style={{ height: "100%", background: byType ? sliceColor(s.key) : `color-mix(in srgb, var(--brand) ${100 - i * 14}%, var(--bg-3))` }}
        />
      ))}
    </div>
  );
}

function Gauge({ label, value, hint, warn }: { label: string; value: string; hint: string; warn: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ fontWeight: 700, fontSize: 18, color: warn ? "var(--t-gold)" : "var(--tx-1)" }}>{value}</div>
      <div className="sec-label" style={{ fontSize: 10 }}>{label}</div>
      <div style={{ fontSize: 9.5, color: "var(--tx-4)" }}>{hint}</div>
    </div>
  );
}

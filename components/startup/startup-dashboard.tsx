"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import {
  arr,
  churnRate,
  cac,
  ltv,
  ltvCacRatio,
  netBurn,
  runwayMonths,
  growthRate,
  requiredMonthlyGrowth,
  buildAlerts,
  type StartupSnapshot,
  type AlertLevel,
} from "@/lib/domain/startup";

const ALERT_STYLE: Record<AlertLevel, { color: string; bg: string; icon: "bolt" | "bell" | "check" }> = {
  critical: { color: "var(--loss)", bg: "var(--loss-dim)", icon: "bolt" },
  warning: { color: "var(--t-gold)", bg: "color-mix(in srgb, var(--t-gold) 14%, transparent)", icon: "bell" },
  info: { color: "var(--profit)", bg: "var(--profit-dim)", icon: "check" },
};

function fmtMoney(n: number, currency: string): string {
  if (!Number.isFinite(n)) return "∞";
  return `${currency}${Math.round(n).toLocaleString()}`;
}

function fmtPct(frac: number): string {
  if (!Number.isFinite(frac)) return "∞";
  const sign = frac > 0 ? "+" : "";
  return `${sign}${(frac * 100).toFixed(1)}%`;
}

function fmtMonths(n: number): string {
  return Number.isFinite(n) ? `${n.toFixed(1)} meses` : "∞";
}

export function StartupDashboard({ snapshot }: { snapshot: StartupSnapshot }) {
  const m = useMemo(() => {
    const series = snapshot.mrrSeries;
    const currentMrr = series[series.length - 1]?.mrr ?? 0;
    const prevMrr = series[series.length - 2]?.mrr ?? currentMrr;
    const churn = churnRate(snapshot.churnedCustomers, snapshot.customersAtStart);
    const cacVal = cac(snapshot.salesMarketingSpend, snapshot.newCustomers);
    const ltvVal = ltv(snapshot.arpa, churn, snapshot.grossMargin);
    const ratio = ltvCacRatio(ltvVal, cacVal);
    const totalExpenses = snapshot.expenses.reduce((s, e) => s + e.amount, 0);
    const burn = netBurn(totalExpenses, currentMrr);
    const runway = runwayMonths(snapshot.cash, burn);
    const mrrGrowth = growthRate(prevMrr, currentMrr);
    const reqGrowth = requiredMonthlyGrowth(currentMrr, snapshot.goalMrr, snapshot.goalMonths);
    const alerts = buildAlerts({ churnRate: churn, churnDeltaPct: snapshot.churnDeltaPct, ltvCac: ratio, runway });
    return { currentMrr, churn, cacVal, ltvVal, ratio, totalExpenses, burn, runway, mrrGrowth, reqGrowth, alerts };
  }, [snapshot]);

  const cur = snapshot.currency;
  const onTrack = m.mrrGrowth >= m.reqGrowth;
  const maxExpense = Math.max(...snapshot.expenses.map((e) => e.amount), 1);

  const cards = [
    { label: "MRR", value: fmtMoney(m.currentMrr, cur), sub: `${fmtPct(m.mrrGrowth)} MoM`, good: m.mrrGrowth >= 0 },
    { label: "ARR", value: fmtMoney(arr(m.currentMrr), cur), sub: "anualizado", good: true },
    { label: "Churn", value: `${(m.churn * 100).toFixed(1)}%`, sub: `${snapshot.churnedCustomers} bajas`, good: m.churn < 0.05 },
    { label: "CAC", value: fmtMoney(m.cacVal, cur), sub: `${snapshot.newCustomers} nuevos`, good: true },
    { label: "LTV", value: fmtMoney(m.ltvVal, cur), sub: `ARPA ${fmtMoney(snapshot.arpa, cur)}`, good: true },
    { label: "LTV:CAC", value: Number.isFinite(m.ratio) ? `${m.ratio.toFixed(1)}x` : "∞", sub: "objetivo ≥ 3x", good: m.ratio >= 3 },
    { label: "Burn rate", value: m.burn > 0 ? fmtMoney(m.burn, cur) : "Rentable", sub: "neto / mes", good: m.burn <= 0 },
    { label: "Runway", value: fmtMonths(m.runway), sub: `caja ${fmtMoney(snapshot.cash, cur)}`, good: !Number.isFinite(m.runway) || m.runway > 6 },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)" }}>
          <Icon name="briefcase" size={22} style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Startup Dashboard</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>{snapshot.company}</h1>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {m.alerts.map((a, i) => {
          const s = ALERT_STYLE[a.level];
          return (
            <div key={i} className="card" style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, background: s.bg, borderColor: s.color }}>
              <Icon name={s.icon} size={16} style={{ color: s.color }} />
              <span style={{ fontSize: 13, color: "var(--tx-1)" }}>{a.message}</span>
            </div>
          );
        })}
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: "14px 16px" }}>
            <div className="sec-label" style={{ fontSize: 10 }}>{c.label}</div>
            <div className="mono" style={{ fontSize: 21, fontWeight: 700, margin: "4px 0 2px" }}>{c.value}</div>
            <div style={{ fontSize: 11.5, color: c.good ? "var(--profit)" : "var(--tx-3)" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* MRR growth chart */}
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Crecimiento de MRR (12 meses)</h2>
        <MrrChart series={snapshot.mrrSeries} currency={cur} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {/* Expense breakdown */}
        <div className="card" style={{ padding: 18 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Gastos mensuales · {fmtMoney(m.totalExpenses, cur)}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {snapshot.expenses.map((e) => (
              <div key={e.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: "var(--tx-2)" }}>{e.label}</span>
                  <span className="mono" style={{ color: "var(--tx-1)" }}>{fmtMoney(e.amount, cur)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(e.amount / maxExpense) * 100}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", background: "var(--brand)", borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal tracker */}
        <div className="card" style={{ padding: 18 }}>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Meta</h2>
          <div style={{ fontSize: 13, color: "var(--tx-2)", marginBottom: 8 }}>
            Llegar a <strong style={{ color: "var(--tx-1)" }}>{fmtMoney(snapshot.goalMrr, cur)}</strong> MRR en {snapshot.goalMonths} meses
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <Row label="Crecimiento necesario" value={`${fmtPct(m.reqGrowth)} / mes`} />
            <Row label="Crecimiento actual" value={`${fmtPct(m.mrrGrowth)} / mes`} />
            <div className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, background: onTrack ? "var(--profit-dim)" : "var(--loss-dim)", borderColor: onTrack ? "var(--profit-line)" : "var(--loss-line)" }}>
              <Icon name={onTrack ? "check" : "down"} size={16} style={{ color: onTrack ? "var(--profit)" : "var(--loss)" }} />
              <span style={{ fontSize: 12.5, color: "var(--tx-1)" }}>
                {onTrack ? "Vas por buen camino para la meta." : "Por debajo del ritmo necesario. Ajusta adquisición o reduce churn."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "var(--tx-3)" }}>{label}</span>
      <span className="mono" style={{ color: "var(--tx-1)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function MrrChart({ series, currency }: { series: StartupSnapshot["mrrSeries"]; currency: string }) {
  const W = 600;
  const H = 160;
  const PAD = 8;
  const values = series.map((p) => p.mrr);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = series.length > 1 ? (W - PAD * 2) / (series.length - 1) : 0;
  const x = (i: number) => PAD + i * step;
  const y = (v: number) => PAD + (1 - (v - min) / span) * (H - PAD * 2);
  const line = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.mrr).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="mrrgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#mrrgrad)" />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9 }}
        />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {series.map((p) => (
          <span key={p.month} className="mono" style={{ fontSize: 9.5, color: "var(--tx-4)" }}>{p.month}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--tx-3)", marginTop: 4 }}>
        <span>mín {currency}{min.toLocaleString()}</span>
        <span>máx {currency}{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

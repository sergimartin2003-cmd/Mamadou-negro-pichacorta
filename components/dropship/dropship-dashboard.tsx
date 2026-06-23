"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import {
  grossProfit,
  netProfit,
  profitMargin,
  grossMarginFraction,
  averageOrderValue,
  refundRate,
  cac,
  roas,
  breakEvenRoas,
  supplierScore,
  rankSuppliers,
  buildDropshipAlerts,
  type DropshipSnapshot,
  type AlertLevel,
} from "@/lib/domain/dropship";

const ALERT_STYLE: Record<AlertLevel, { color: string; bg: string; icon: "bolt" | "bell" | "check" }> = {
  critical: { color: "var(--loss)", bg: "var(--loss-dim)", icon: "bolt" },
  warning: { color: "var(--t-gold)", bg: "color-mix(in srgb, var(--t-gold) 14%, transparent)", icon: "bell" },
  info: { color: "var(--profit)", bg: "var(--profit-dim)", icon: "check" },
};

function money(n: number, c: string): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}${c}${Math.abs(Math.round(n)).toLocaleString()}`;
}
function num(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "∞";
}

export function DropshipDashboard({ snapshot }: { snapshot: DropshipSnapshot }) {
  const { stats, currency: c } = snapshot;

  const m = useMemo(() => {
    const r = roas(stats.revenue, stats.adSpend);
    const be = breakEvenRoas(grossMarginFraction(stats.revenue, stats.cogs));
    return {
      gross: grossProfit(stats.revenue, stats.cogs),
      net: netProfit(stats),
      margin: profitMargin(stats),
      aov: averageOrderValue(stats.revenue, stats.orders),
      refund: refundRate(stats.refunds, stats.orders),
      cacv: cac(stats.adSpend, stats.newCustomers),
      roasv: r,
      breakeven: be,
      profitableAds: r >= be,
      alerts: buildDropshipAlerts(stats),
      suppliers: rankSuppliers(snapshot.suppliers),
    };
  }, [stats, snapshot.suppliers]);

  const kpis = [
    { label: "Revenue", value: money(stats.revenue, c), sub: `${stats.orders.toLocaleString()} pedidos`, good: true },
    { label: "Net profit", value: money(m.net, c), sub: `margen ${(m.margin * 100).toFixed(1)}%`, good: m.net > 0 },
    { label: "ROAS", value: num(m.roasv), sub: `break-even ${num(m.breakeven)}`, good: m.profitableAds },
    { label: "Ad spend", value: money(stats.adSpend, c), sub: `CAC ${money(m.cacv, c)}`, good: true },
    { label: "AOV", value: money(m.aov, c), sub: "ticket medio", good: true },
    { label: "Devoluciones", value: `${(m.refund * 100).toFixed(1)}%`, sub: `${stats.refunds} pedidos`, good: m.refund < 0.1 },
    { label: "Gross profit", value: money(m.gross, c), sub: "revenue − COGS", good: true },
    { label: "Otros costes", value: money(stats.otherCosts, c), sub: "apps, fees", good: true },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)" }}>
          <Icon name="box" size={22} style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Dropshipping Dashboard</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>{snapshot.name}</h1>
        </div>
      </div>

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: "14px 16px" }}>
            <div className="sec-label" style={{ fontSize: 10 }}>{k.label}</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 2px" }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: k.good ? "var(--profit)" : "var(--loss)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Supplier scorecard */}
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Rendimiento de proveedores</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {m.suppliers.map((sup) => {
            const score = supplierScore(sup);
            const color = score >= 75 ? "var(--profit)" : score >= 50 ? "var(--t-gold)" : "var(--loss)";
            return (
              <div key={sup.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{sup.name}</span>
                    <span className="mono" style={{ color }}>{score}/100</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", background: color, borderRadius: 999 }} />
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 5, fontSize: 11, color: "var(--tx-3)" }}>
                    <span>🚚 {sup.avgShipDays}d</span>
                    <span>⚠️ {(sup.incidentRate * 100).toFixed(0)}% incid.</span>
                    <span>★ {sup.quality.toFixed(1)}</span>
                    <span>{sup.orders} pedidos</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

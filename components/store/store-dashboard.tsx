"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import {
  conversionRate,
  averageOrderValue,
  refundRate,
  revenueGrowth,
  grossMargin,
  stockStatus,
  inventoryValue,
  retailValue,
  totalUnits,
  lowStockProducts,
  topProducts,
  type StoreSnapshot,
  type Product,
  type StockStatus,
} from "@/lib/domain/store";

const STATUS_STYLE: Record<StockStatus, { label: string; color: string }> = {
  ok: { label: "En stock", color: "var(--profit)" },
  low: { label: "Stock bajo", color: "var(--t-gold)" },
  out: { label: "Agotado", color: "var(--loss)" },
};

function money(n: number, c: string): string {
  return `${c}${Math.round(n).toLocaleString()}`;
}
function pct(frac: number): string {
  const sign = frac > 0 ? "+" : "";
  return `${sign}${(frac * 100).toFixed(1)}%`;
}

export function StoreDashboard({ snapshot }: { snapshot: StoreSnapshot }) {
  const [tab, setTab] = useState<"overview" | "catalog">("overview");
  const { stats, products, currency: c } = snapshot;

  const m = useMemo(
    () => ({
      conv: conversionRate(stats.orders, stats.visitors),
      aov: averageOrderValue(stats.revenue, stats.orders),
      refund: refundRate(stats.refunds, stats.orders),
      growth: revenueGrowth(stats.prevRevenue, stats.revenue),
      invValue: inventoryValue(products),
      retail: retailValue(products),
      units: totalUnits(products),
      low: lowStockProducts(products),
      top: topProducts(products, 5),
    }),
    [stats, products],
  );

  const kpis = [
    { label: "Ingresos", value: money(stats.revenue, c), sub: `${pct(m.growth)} vs. periodo ant.`, good: m.growth >= 0 },
    { label: "Pedidos", value: stats.orders.toLocaleString(), sub: `${stats.visitors.toLocaleString()} visitas`, good: true },
    { label: "Conversión", value: `${(m.conv * 100).toFixed(2)}%`, sub: "pedidos / visita", good: m.conv >= 0.02 },
    { label: "Ticket medio", value: money(m.aov, c), sub: "AOV", good: true },
    { label: "Devoluciones", value: `${(m.refund * 100).toFixed(1)}%`, sub: `${stats.refunds} pedidos`, good: m.refund < 0.05 },
    { label: "Inventario", value: money(m.invValue, c), sub: `${m.units} uds · ${money(m.retail, c)} PVP`, good: true },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)" }}>
          <Icon name="bag" size={22} style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Store Builder</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>{snapshot.name}</h1>
          <div style={{ fontSize: 12.5, color: "var(--tx-3)" }}>Tema: {snapshot.theme}</div>
        </div>
        <Segmented
          options={[{ k: "overview", label: "Resumen" }, { k: "catalog", label: "Catálogo" }]}
          value={tab}
          onChange={(k) => setTab(k as "overview" | "catalog")}
        />
      </div>

      {m.low.length > 0 && (
        <div className="card" style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, background: "color-mix(in srgb, var(--t-gold) 14%, transparent)", borderColor: "var(--t-gold)" }}>
          <Icon name="bell" size={16} style={{ color: "var(--t-gold)" }} />
          <span style={{ fontSize: 13, color: "var(--tx-1)" }}>
            {m.low.length} producto{m.low.length > 1 ? "s" : ""} con stock bajo o agotado — revisa reposición.
          </span>
        </div>
      )}

      {tab === "overview" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {kpis.map((k) => (
              <div key={k.label} className="card" style={{ padding: "14px 16px" }}>
                <div className="sec-label" style={{ fontSize: 10 }}>{k.label}</div>
                <div className="mono" style={{ fontSize: 21, fontWeight: 700, margin: "4px 0 2px" }}>{k.value}</div>
                <div style={{ fontSize: 11.5, color: k.good ? "var(--profit)" : "var(--tx-3)" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 15, marginBottom: 12 }}>Top productos</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {m.top.map((p, i) => {
                const max = m.top[0]?.sales || 1;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="mono" style={{ color: "var(--tx-3)", width: 18 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <span className="mono" style={{ color: "var(--tx-2)" }}>{p.sales} uds</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(p.sales / max) * 100}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", background: "var(--brand)", borderRadius: 999 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <Catalog products={products} currency={c} />
      )}
    </div>
  );
}

function Catalog({ products, currency }: { products: Product[]; currency: string }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, padding: "11px 16px", borderBottom: "1px solid var(--line-1)", fontSize: 11 }} className="sec-label">
        <span>Producto</span>
        <span style={{ textAlign: "right" }}>Precio</span>
        <span style={{ textAlign: "right" }}>Margen</span>
        <span style={{ textAlign: "right" }}>Vendidos</span>
        <span style={{ textAlign: "right" }}>Stock</span>
      </div>
      {products.map((p) => {
        const status = stockStatus(p.stock);
        const st = STATUS_STYLE[status];
        return (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--line-1)", alignItems: "center", fontSize: 13 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--tx-3)" }}>{p.category}</div>
            </div>
            <span className="mono" style={{ textAlign: "right" }}>{money(p.price, currency)}</span>
            <span className="mono" style={{ textAlign: "right", color: "var(--profit)" }}>{(grossMargin(p) * 100).toFixed(0)}%</span>
            <span className="mono" style={{ textAlign: "right", color: "var(--tx-2)" }}>{p.sales}</span>
            <span style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
              <span className="mono">{p.stock}</span>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} title={st.label} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

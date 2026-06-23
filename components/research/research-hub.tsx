"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import {
  screen,
  sortSecurities,
  valuationScore,
  sectors,
  type Security,
  type ScreenFilter,
  type SortKey,
  type SortDir,
} from "@/lib/domain/screener";

const COLUMNS: { key: SortKey; label: string; fmt: (s: Security) => string }[] = [
  { key: "price", label: "Precio", fmt: (s) => `€${s.price}` },
  { key: "per", label: "PER", fmt: (s) => (s.per > 0 ? s.per.toFixed(1) : "—") },
  { key: "pb", label: "P/B", fmt: (s) => s.pb.toFixed(1) },
  { key: "roe", label: "ROE", fmt: (s) => `${(s.roe * 100).toFixed(0)}%` },
  { key: "dividendYield", label: "Div", fmt: (s) => `${(s.dividendYield * 100).toFixed(1)}%` },
  { key: "growth", label: "Crec.", fmt: (s) => `${(s.growth * 100).toFixed(0)}%` },
];

function scoreColor(v: number): string {
  return v >= 65 ? "var(--profit)" : v >= 45 ? "var(--t-gold)" : "var(--loss)";
}

export function ResearchHub({ securities }: { securities: Security[] }) {
  const sectorList = useMemo(() => sectors(securities), [securities]);
  const [perMax, setPerMax] = useState(60);
  const [roeMin, setRoeMin] = useState(0);
  const [divMin, setDivMin] = useState(0);
  const [sector, setSector] = useState<string>("__all");
  const [sortKey, setSortKey] = useState<SortKey>("valuationScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filter: ScreenFilter = useMemo(
    () => ({
      perMax: perMax < 60 ? perMax : undefined,
      roeMin: roeMin > 0 ? roeMin : undefined,
      divYieldMin: divMin > 0 ? divMin : undefined,
      sector: sector === "__all" ? undefined : sector,
    }),
    [perMax, roeMin, divMin, sector],
  );

  const results = useMemo(
    () => sortSecurities(screen(securities, filter), sortKey, sortDir),
    [securities, filter, sortKey, sortDir],
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "per" || key === "pb" ? "asc" : "desc");
    }
  };

  const reset = () => {
    setPerMax(60);
    setRoeMin(0);
    setDivMin(0);
    setSector("__all");
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)" }}>
          <Icon name="search" size={22} style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Investment Research Hub</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>Screener de acciones</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <Segmented
            options={[{ k: "__all", label: "Todos" }, ...sectorList.map((s) => ({ k: s, label: s }))]}
            value={sector}
            onChange={setSector}
            size="sm"
          />
          <button className="chip" onClick={reset}><Icon name="close" size={13} /> Reiniciar</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          <Slider label="PER máximo" value={perMax} min={5} max={60} step={1} display={perMax >= 60 ? "sin límite" : perMax.toFixed(0)} onChange={setPerMax} />
          <Slider label="ROE mínimo" value={roeMin} min={0} max={0.5} step={0.01} display={`${(roeMin * 100).toFixed(0)}%`} onChange={setRoeMin} />
          <Slider label="Dividendo mínimo" value={divMin} min={0} max={0.08} step={0.005} display={`${(divMin * 100).toFixed(1)}%`} onChange={setDivMin} />
        </div>
      </div>

      <div style={{ fontSize: 13, color: "var(--tx-3)" }}>{results.length} de {securities.length} valores coinciden</div>

      {/* Results table */}
      <div className="card" style={{ padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line-1)" }}>
              <Th onClick={() => toggleSort("valuationScore")} active={sortKey === "valuationScore"} dir={sortDir} align="left">Valor</Th>
              {COLUMNS.map((c) => (
                <Th key={c.key} onClick={() => toggleSort(c.key)} active={sortKey === c.key} dir={sortDir} align="right">{c.label}</Th>
              ))}
              <Th onClick={() => toggleSort("valuationScore")} active={sortKey === "valuationScore"} dir={sortDir} align="right">Score</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((s) => {
              const v = valuationScore(s);
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--line-1)" }}>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{s.symbol} · {s.sector}</div>
                  </td>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="mono" style={{ padding: "11px 16px", textAlign: "right", color: c.key === "growth" && s.growth < 0 ? "var(--loss)" : "var(--tx-2)" }}>
                      {c.fmt(s)}
                    </td>
                  ))}
                  <td style={{ padding: "11px 16px", textAlign: "right" }}>
                    <span className="mono" style={{ fontWeight: 700, color: scoreColor(v) }}>{v}</span>
                  </td>
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr><td colSpan={COLUMNS.length + 2} style={{ padding: 24, textAlign: "center", color: "var(--tx-3)" }}>Ningún valor coincide con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, onClick, active, dir, align }: { children: React.ReactNode; onClick: () => void; active: boolean; dir: SortDir; align: "left" | "right" }) {
  return (
    <th
      onClick={onClick}
      className="sec-label"
      style={{ padding: "11px 16px", textAlign: align, fontSize: 10.5, cursor: "pointer", color: active ? "var(--brand)" : "var(--tx-3)", whiteSpace: "nowrap", userSelect: "none" }}
    >
      {children}{active ? (dir === "asc" ? " ↑" : " ↓") : ""}
    </th>
  );
}

function Slider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
        <span style={{ color: "var(--tx-2)" }}>{label}</span>
        <span className="mono" style={{ color: "var(--tx-1)" }}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--brand)" }}
      />
    </div>
  );
}

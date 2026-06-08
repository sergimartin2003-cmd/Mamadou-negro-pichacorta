import type { ReactNode } from "react";
import { Sparkline } from "./sparkline";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
  spark?: number[];
  sparkColor?: string;
  big?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  accent = "var(--tx-1)",
  spark,
  sparkColor,
  big = false,
}: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--line-1)",
        borderRadius: "var(--r-md)",
        padding: big ? "16px 18px" : "13px 15px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div className="sec-label" style={{ fontSize: 10.5 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span
          className="mono"
          style={{ fontSize: big ? 28 : 21, fontWeight: 700, color: accent, lineHeight: 1 }}
        >
          {value}
        </span>
        {spark && <Sparkline data={spark} w={64} h={26} color={sparkColor ?? accent} />}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--tx-3)" }}>{sub}</div>}
    </div>
  );
}

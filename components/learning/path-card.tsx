"use client";

import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import type { LearningPath } from "@/types/db";

interface PathCardProps {
  path: LearningPath;
  onOpen: () => void;
}

export function PathCard({ path, onOpen }: PathCardProps) {
  const pct = Math.round((path.done / path.modules) * 100);
  const complete = path.done === path.modules;

  return (
    <button
      onClick={onOpen}
      className="card hover"
      style={{ textAlign: "left", padding: 18, display: "flex", flexDirection: "column", gap: 14, cursor: "pointer", width: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center",
            fontSize: 22,
            background: `color-mix(in srgb, ${path.color} 16%, transparent)`,
            color: path.color,
            border: `1px solid color-mix(in srgb, ${path.color} 30%, transparent)`,
            flexShrink: 0,
          }}
        >
          {path.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 16 }}>{path.name}</div>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)", marginTop: 2 }}>
            {path.market} · {path.modules} modules
          </div>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--t-gold)", fontFamily: "var(--f-mono)", fontWeight: 700 }}>
          <Icon name="bolt" size={14} fill /> Lv {path.level}
        </span>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 }}>
          <span style={{ color: "var(--tx-3)" }}>{path.done}/{path.modules} complete</span>
          <span className="mono" style={{ color: complete ? "var(--profit)" : path.color }}>
            {complete ? "✓ Mastered" : `${pct}%`}
          </span>
        </div>
        <Progress value={pct} color={complete ? "var(--profit)" : path.color} glow={complete} />
      </div>
    </button>
  );
}

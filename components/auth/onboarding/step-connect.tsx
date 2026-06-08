"use client";

import type { ConnectionProvider } from "@/lib/auth/schemas";
import { CONNECTION_OPTIONS, type ConnectionOption } from "./constants";

export interface StepConnectProps {
  selected: ConnectionProvider | null;
  onSelect: (provider: ConnectionProvider | null) => void;
}

export function StepConnect({ selected, onSelect }: StepConnectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Connect a verified account
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--tx-2)" }}>
          Verified accounts unlock the leaderboard and a checkmark on your profile. You can do this
          later.
        </p>
      </div>

      <style>{".th-connect-grid{grid-template-columns:repeat(2,minmax(0,1fr))}@media (max-width:420px){.th-connect-grid{grid-template-columns:minmax(0,1fr)}}"}</style>
      <div style={{ display: "grid", gap: 10 }} className="th-connect-grid">
        {CONNECTION_OPTIONS.map((option) => (
          <ConnectionCard
            key={option.key}
            option={option}
            active={selected === option.key}
            onClick={() => onSelect(selected === option.key ? null : option.key)}
          />
        ))}
      </div>
    </div>
  );
}

interface ConnectionCardProps {
  option: ConnectionOption;
  active: boolean;
  onClick: () => void;
}

function ConnectionCard({ option, active, onClick }: ConnectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="card hover"
      style={{
        textAlign: "left",
        padding: 15,
        display: "flex",
        flexDirection: "column",
        gap: 11,
        cursor: "pointer",
        borderColor: active ? "var(--brand-line)" : undefined,
        background: active ? "var(--brand-dim)" : undefined,
        outline: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          aria-hidden
          className="mono"
          style={{
            width: 38,
            height: 38,
            display: "grid",
            placeItems: "center",
            borderRadius: 10,
            background: `color-mix(in srgb, ${option.accent} 18%, transparent)`,
            border: `1px solid color-mix(in srgb, ${option.accent} 38%, transparent)`,
            color: option.accent,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {option.glyph}
        </span>
        {option.verified ? (
          <span
            className="chip tag"
            style={{ color: "var(--profit)", borderColor: "var(--profit-line)", background: "var(--profit-dim)" }}
          >
            verified
          </span>
        ) : (
          <span className="chip tag">manual</span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700 }}>{option.name}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--tx-3)", marginTop: 3 }}>
          {option.desc}
        </div>
      </div>
    </button>
  );
}

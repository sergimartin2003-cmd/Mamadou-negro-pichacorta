export interface OrDividerProps {
  label?: string;
}

export function OrDivider({ label = "or" }: OrDividerProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
      <span style={{ flex: 1, height: 1, background: "var(--line-1)" }} />
      <span className="sec-label" style={{ color: "var(--tx-4)" }}>
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: "var(--line-1)" }} />
    </div>
  );
}

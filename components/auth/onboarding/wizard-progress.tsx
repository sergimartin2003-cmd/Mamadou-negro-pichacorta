import { STEP_TITLES } from "./constants";

export interface WizardProgressProps {
  current: number;
}

export function WizardProgress({ current }: WizardProgressProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 7 }}>
        {STEP_TITLES.map((title, index) => (
          <span
            key={title}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: index <= current ? "var(--brand)" : "var(--bg-4)",
              boxShadow: index === current ? "0 0 10px var(--brand-glow)" : "none",
              transition: "background .35s ease, box-shadow .35s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="sec-label" style={{ color: "var(--brand)" }}>
          Step {current + 1} of {STEP_TITLES.length}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-2)" }}>
          {STEP_TITLES[current]}
        </span>
      </div>
    </div>
  );
}

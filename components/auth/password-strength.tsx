import { scorePassword } from "@/lib/auth/schemas";

export interface PasswordStrengthProps {
  value: string;
}

const SCALE = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;
const COLORS = ["var(--loss)", "var(--loss)", "var(--t-gold)", "var(--t-platinum)", "var(--profit)"] as const;
const SEGMENTS = [0, 1, 2, 3] as const;

export function PasswordStrength({ value }: PasswordStrengthProps) {
  const { score, rules } = scorePassword(value);
  const color = COLORS[score];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", gap: 5 }}>
        {SEGMENTS.map((segment) => (
          <span
            key={segment}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: segment < score ? color : "var(--bg-4)",
              transition: "background .25s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        {rules.map((rule) => (
          <span
            key={rule.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11.5,
              color: rule.met ? "var(--profit)" : "var(--tx-3)",
              transition: "color .2s ease",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: rule.met ? "var(--profit)" : "var(--tx-4)",
              }}
            />
            {rule.label}
          </span>
        ))}
      </div>
      {value.length > 0 && (
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{SCALE[score]}</span>
      )}
    </div>
  );
}

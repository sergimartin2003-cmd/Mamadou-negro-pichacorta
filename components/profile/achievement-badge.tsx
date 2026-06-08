import type { Achievement } from "@/types/db";
import { Icon } from "@/components/ui";

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement: a }: AchievementBadgeProps) {
  const colorVar = `var(--t-${a.tier})`;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 9,
        padding: "18px 12px",
        borderRadius: "var(--r-md)",
        background: a.got ? "var(--bg-3)" : "var(--bg-2)",
        border: `1px solid ${a.got ? "var(--line-2)" : "var(--line-1)"}`,
        opacity: a.got ? 1 : 0.55,
        textAlign: "center",
        transition: "transform .15s",
      }}
      onMouseEnter={(e) => {
        if (a.got) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "none";
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          background: a.got
            ? `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${colorVar} 40%, transparent), color-mix(in srgb, ${colorVar} 8%, transparent))`
            : "var(--bg-4)",
          color: a.got ? colorVar : "var(--tx-4)",
          border: `1.5px solid ${a.got ? `color-mix(in srgb, ${colorVar} 50%, transparent)` : "var(--line-1)"}`,
          boxShadow: a.got ? `0 0 22px color-mix(in srgb, ${colorVar} 30%, transparent)` : "none",
        }}
      >
        {a.got ? a.icon : <Icon name="lock" size={20} />}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 12.5, color: a.got ? "var(--tx-1)" : "var(--tx-3)" }}>
          {a.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--tx-3)", lineHeight: 1.35, marginTop: 3 }}>
          {a.desc}
        </div>
      </div>
    </div>
  );
}

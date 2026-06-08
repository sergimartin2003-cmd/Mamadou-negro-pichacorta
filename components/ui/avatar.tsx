import type { Profile } from "@/types/db";
import { byId } from "@/lib/data/seed";

export interface AvatarProps {
  user: Profile | string;
  size?: number;
  ring?: string | null;
  showStatus?: boolean;
}

function resolveUser(user: Profile | string): Profile | undefined {
  return typeof user === "string" ? byId[user] : user;
}

function initialsFor(name: string): string {
  return name
    .replace(/^You · /, "")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
}

export function Avatar({ user, size = 40, ring = null, showStatus = false }: AvatarProps) {
  const resolved = resolveUser(user);
  if (!resolved) return null;

  const [from, to] = resolved.avatar;
  const statusSize = size * 0.28;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        className="avatar"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.36,
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: ring
            ? `0 0 0 2px var(--bg-2), 0 0 0 ${Math.max(2, size * 0.05)}px ${ring}`
            : "none",
        }}
      >
        {initialsFor(resolved.name)}
      </div>
      {showStatus && (
        <span
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: statusSize,
            height: statusSize,
            minWidth: 9,
            minHeight: 9,
            borderRadius: "50%",
            background: "var(--profit)",
            border: "2px solid var(--bg-2)",
          }}
        />
      )}
    </div>
  );
}

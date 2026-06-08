import Link from "next/link";
import type { Profile } from "@/types/db";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedTick } from "@/components/ui/rank-badge";
import { Pnl } from "@/components/ui/pnl";
import { Icon } from "@/components/ui/icon";

interface PodiumProps {
  top: [Profile, Profile, Profile];
}

const HEIGHTS = [128, 168, 110] as const;
const MEDALS = ["var(--t-silver)", "var(--t-gold)", "var(--t-bronze)"] as const;
const PLACES = [2, 1, 3] as const;

export function Podium({ top }: PodiumProps) {
  const order = [top[1], top[0], top[2]] as const;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 18,
        padding: "10px 0 4px",
        flexWrap: "wrap",
      }}
    >
      {order.map((profile, i) => (
        <Link
          key={profile.id}
          href={`/u/${profile.handle}`}
          style={{
            border: "none",
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            flex: PLACES[i] === 1 ? "0 0 200px" : "0 0 168px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div style={{ position: "relative" }}>
            <Avatar user={profile} size={PLACES[i] === 1 ? 78 : 62} ring={MEDALS[i]} />
            {PLACES[i] === 1 && (
              <div
                style={{
                  position: "absolute",
                  top: -22,
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "var(--t-gold)",
                }}
              >
                <Icon name="crown" size={26} fill />
              </div>
            )}
            <div
              style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: MEDALS[i],
                color: "#0B0F14",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--f-display)",
                fontWeight: 700,
                fontSize: 13,
                border: "3px solid var(--bg-1)",
              }}
            >
              {PLACES[i]}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 5,
                justifyContent: "center",
              }}
            >
              {profile.name.split(" ")[0]}
              {profile.verified && <VerifiedTick size={13} />}
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 2 }}>
              {profile.rp.toLocaleString()} RP
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: HEIGHTS[i],
              borderRadius: "12px 12px 0 0",
              position: "relative",
              background: `linear-gradient(180deg, color-mix(in srgb, ${MEDALS[i]} 26%, var(--bg-2)), var(--bg-2))`,
              border: "1px solid var(--line-1)",
              borderBottom: "none",
              display: "grid",
              placeItems: "start center",
              paddingTop: 14,
            }}
          >
            <Pnl value={profile.pnl} suffix="%" />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 10px, transparent 10px 20px)",
                borderRadius: "12px 12px 0 0",
              }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Competition, Profile } from "@/types/db";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const KIND_COLOR: Record<string, string> = {
  Seasonal: "var(--brand)",
  "48h Battle": "var(--loss)",
  Friends: "var(--t-gold)",
};

interface CompCardProps {
  competition: Competition;
  leaders: readonly Profile[];
}

export function CompCard({ competition: initial, leaders }: CompCardProps) {
  const [joined, setJoined] = useState(initial.joined);
  const [myRank, setMyRank] = useState(initial.myRank);
  const kindColor = KIND_COLOR[initial.kind] ?? "var(--brand)";
  const avatarTraders = leaders.slice(0, 4);

  async function handleJoin() {
    setJoined(true);
    setMyRank(Math.floor(Math.random() * 200) + 50);
  }

  return (
    <div className="card hover" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 96,
          position: "relative",
          background: `linear-gradient(125deg, color-mix(in srgb, ${kindColor} 30%, var(--bg-2)), var(--bg-2) 75%)`,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 12px, transparent 12px 24px)",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <span
            className="chip tag"
            style={{
              color: kindColor,
              borderColor: `color-mix(in srgb, ${kindColor} 40%, transparent)`,
              background: `color-mix(in srgb, ${kindColor} 14%, transparent)`,
            }}
          >
            {initial.kind}
          </span>
          {joined && (
            <span className="chip tag" style={{ color: "var(--profit)", borderColor: "var(--profit-line)" }}>
              <Icon name="check" size={12} /> Joined
            </span>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 18, fontWeight: 600 }}>{initial.name}</div>
          <div style={{ fontSize: 12, color: "var(--tx-2)" }}>
            {initial.market} · {initial.metric}
          </div>
        </div>
      </div>

      <div style={{ padding: "15px 18px", display: "flex", flexDirection: "column", gap: 13, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {(
            [
              ["Participants", initial.participants.toLocaleString()],
              ["Ends in", `${initial.daysLeft}d`],
              ["Prize", initial.prize.split("+")[0]],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <div className="sec-label" style={{ fontSize: 9.5 }}>{label}</div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex" }}>
            {avatarTraders.map((p, i) => (
              <div key={p.id} style={{ marginLeft: i ? -10 : 0 }}>
                <Avatar user={p} size={28} ring="var(--bg-2)" />
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "var(--tx-3)" }}>{initial.rule}</span>
        </div>

        {joined ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 13px",
              borderRadius: "var(--r-sm)",
              background: "var(--bg-3)",
              border: "1px solid var(--line-1)",
            }}
          >
            <Icon name="trophy" size={17} style={{ color: "var(--t-gold)" }} />
            <span style={{ fontSize: 13 }}>Your rank</span>
            <span
              className="mono"
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginLeft: "auto",
                color: myRank !== null && myRank <= 10 ? "var(--profit)" : "var(--tx-1)",
              }}
            >
              #{myRank}
            </span>
          </div>
        ) : (
          <Button variant="primary" block onClick={handleJoin}>
            Join competition
          </Button>
        )}
      </div>
    </div>
  );
}

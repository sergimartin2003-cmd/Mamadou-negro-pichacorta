"use client";

import type { ChatMessage as ChatMessageType } from "@/types/db";
import { Avatar, ChartFrame, RankBadge, VerifiedTick } from "@/components/ui";
import { byId } from "@/lib/data/seed";

export interface ChatMessageProps {
  m: ChatMessageType;
}

export function ChatMessage({ m }: ChatMessageProps) {
  const author = byId[m.author];
  if (!author) return null;

  const chartSymbol = m.chart ? m.chart.split(" ")[0] : "";

  return (
    <div
      style={{ display: "flex", gap: 13, padding: "8px 22px", transition: "background .1s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Avatar user={author} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <strong style={{ fontSize: 14 }}>{author.name.replace(/^You · /, "")}</strong>
          {author.verified && <VerifiedTick size={13} />}
          <RankBadge rp={author.rp} size="sm" showName={false} />
          <span className="mono" style={{ fontSize: 11, color: "var(--tx-4)" }}>
            {m.time}
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.5 }}>{m.text}</div>
        {m.chart && (
          <div style={{ marginTop: 8, maxWidth: 420 }}>
            <ChartFrame label={m.chart} dir="long" symbol={chartSymbol} h={150} />
          </div>
        )}
      </div>
    </div>
  );
}

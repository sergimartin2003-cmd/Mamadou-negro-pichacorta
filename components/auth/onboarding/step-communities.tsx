"use client";

import type { Community } from "@/types/db";
import { formatCompact } from "@/lib/utils";

export interface StepCommunitiesProps {
  communities: readonly Community[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function StepCommunities({ communities, selected, onToggle }: StepCommunitiesProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Join your first communities
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--tx-2)" }}>
          Pick a few rooms to follow. We&apos;ll seed your feed with their best ideas.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {communities.map((community) => (
          <CommunityRow
            key={community.id}
            community={community}
            active={selected.includes(community.id)}
            onClick={() => onToggle(community.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface CommunityRowProps {
  community: Community;
  active: boolean;
  onClick: () => void;
}

function CommunityRow({ community, active, onClick }: CommunityRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="card hover"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "12px 15px",
        textAlign: "left",
        cursor: "pointer",
        borderColor: active ? "var(--brand-line)" : undefined,
        background: active ? "var(--brand-dim)" : undefined,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: 11,
          background: `color-mix(in srgb, ${community.color} 18%, transparent)`,
          border: `1px solid color-mix(in srgb, ${community.color} 38%, transparent)`,
          color: community.color,
          fontSize: 18,
        }}
      >
        {community.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>{community.name}</span>
          <span className="chip tag">{community.market}</span>
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--tx-3)",
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {community.desc}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--tx-3)" }}>
          {formatCompact(community.members)}
        </span>
        <span
          aria-hidden
          style={{
            width: 22,
            height: 22,
            display: "grid",
            placeItems: "center",
            borderRadius: 7,
            border: `1.5px solid ${active ? "var(--brand)" : "var(--line-3)"}`,
            background: active ? "var(--brand)" : "transparent",
            transition: "all .15s ease",
          }}
        >
          {active && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-11" />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
}

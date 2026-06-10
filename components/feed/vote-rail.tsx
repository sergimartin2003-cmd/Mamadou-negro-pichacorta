"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import type { Post } from "@/types/db";
import { votePost } from "@/lib/actions/social";

interface VoteRailProps {
  post: Post;
  layout?: "v" | "h";
}

export function VoteRail({ post, layout = "v" }: VoteRailProps) {
  const [v, setV] = useState<-1 | 0 | 1>(0);
  const score = post.up - post.down + v;
  const vert = layout === "v";

  function toggle(dir: 1 | -1) {
    const prev = v;
    setV(prev === dir ? 0 : dir);
    // Persist in the background (real with Supabase, no-op in demo);
    // revert the optimistic state if the write fails.
    votePost(post.id, dir).then((res) => {
      if (!res.ok) setV(prev);
    });
  }

  const displayScore =
    Math.abs(score) >= 1000 ? (score / 1000).toFixed(1) + "k" : String(score);
  const scoreColor = v === 1 ? "var(--profit)" : v === -1 ? "var(--loss)" : "var(--tx-1)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: vert ? "column" : "row",
        alignItems: "center",
        gap: vert ? 2 : 8,
        background: vert ? "var(--bg-3)" : "transparent",
        borderRadius: "var(--r-pill)",
        padding: vert ? "4px" : "0",
      }}
    >
      <button
        onClick={() => toggle(1)}
        style={{
          border: "none",
          background: "transparent",
          display: "grid",
          placeItems: "center",
          width: 30,
          height: 30,
          borderRadius: "50%",
          color: v === 1 ? "var(--profit)" : "var(--tx-3)",
          transition: "all .12s",
          cursor: "pointer",
        }}
      >
        <Icon name="caretUp" size={20} sw={2.4} />
      </button>
      <span
        className="mono"
        style={{
          fontWeight: 700,
          fontSize: 13.5,
          color: scoreColor,
          minWidth: vert ? "auto" : 34,
          textAlign: "center",
        }}
      >
        {displayScore}
      </span>
      <button
        onClick={() => toggle(-1)}
        style={{
          border: "none",
          background: "transparent",
          display: "grid",
          placeItems: "center",
          width: 30,
          height: 30,
          borderRadius: "50%",
          color: v === -1 ? "var(--loss)" : "var(--tx-3)",
          transition: "all .12s",
          cursor: "pointer",
        }}
      >
        <Icon name="caretDown" size={20} sw={2.4} />
      </button>
    </div>
  );
}

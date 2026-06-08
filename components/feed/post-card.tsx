import Link from "next/link";
import type { Post, Profile } from "@/types/db";
import {
  Avatar,
  RankBadge,
  VerifiedTick,
  ChartFrame,
  Icon,
  IconButton,
} from "@/components/ui";
import { VoteRail } from "./vote-rail";

interface ResultBadge {
  t: "WIN" | "LOSS" | "OPEN";
  c: string;
}

function resultBadge(r: Post["result"]): ResultBadge {
  if (r === "win") return { t: "WIN", c: "var(--profit)" };
  if (r === "loss") return { t: "LOSS", c: "var(--loss)" };
  return { t: "OPEN", c: "var(--t-diamond)" };
}

interface PostCardProps {
  post: Post;
  author: Profile;
  layout?: "comfortable" | "compact";
}

export function PostCard({ post, author, layout = "comfortable" }: PostCardProps) {
  const rb = resultBadge(post.result);
  const compact = layout === "compact";
  const ringColor = author.rp > 7000 ? "var(--t-gold)" : null;

  const statStrip = [
    { l: "Symbol", v: post.symbol, mono: true, c: undefined as string | undefined },
    {
      l: "Direction",
      v: post.dir.toUpperCase(),
      mono: false,
      c: post.dir === "long" ? "var(--profit)" : "var(--loss)",
    },
    { l: "R:R", v: post.rr > 0 ? post.rr.toFixed(1) + ":1" : "—", mono: true, c: undefined },
    {
      l: "Result",
      v: (post.pnl >= 0 ? "+" : "") + post.pnl + "R",
      mono: true,
      c: post.pnl >= 0 ? "var(--profit)" : "var(--loss)",
    },
  ] as const;

  return (
    <article className="card fade-up" style={{ overflow: "hidden", display: "flex", borderRadius: "var(--r-lg)" }}>
      <div style={{ padding: "16px 8px 16px 12px", display: "flex", alignItems: "flex-start" }}>
        <VoteRail post={post} />
      </div>

      <div style={{ flex: 1, minWidth: 0, padding: "15px 16px 14px 4px" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
          <Link href={`/u/${author.handle}`} style={{ border: "none", background: "transparent", padding: 0 }}>
            <Avatar user={author} size={38} ring={ringColor} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>{author.name.replace(/^You · /, "")}</strong>
              {author.verified && <VerifiedTick size={14} />}
              <RankBadge rp={author.rp} size="sm" showName={false} />
              <span className="mono" style={{ fontSize: 11.5, color: "var(--tx-4)" }}>
                · {post.time}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)", marginTop: 1 }}>
              @{author.handle} · {post.market}
            </div>
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontFamily: "var(--f-mono)",
              fontWeight: 700,
              color: rb.c,
              background: `color-mix(in srgb, ${rb.c} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${rb.c} 30%, transparent)`,
              padding: "3px 9px",
              borderRadius: "var(--r-pill)",
              letterSpacing: ".05em",
            }}
          >
            {rb.t}
          </span>
          <IconButton icon="ellipsis" size="sm" />
        </div>

        {/* title + body */}
        <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, marginBottom: 7, letterSpacing: "-0.01em" }}>
          {post.title}
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.55, margin: "0 0 13px", maxWidth: 640 }}>
          {post.body}
        </p>

        {/* trade stat strip */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 13,
            border: "1px solid var(--line-1)",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            background: "var(--bg-3)",
          }}
        >
          {statStrip.map((s, i) => (
            <div
              key={s.l}
              style={{
                flex: 1,
                padding: "9px 13px",
                borderRight: i < 3 ? "1px solid var(--line-1)" : "none",
              }}
            >
              <div className="sec-label" style={{ fontSize: 9.5, marginBottom: 3 }}>
                {s.l}
              </div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 14, color: s.c ?? "var(--tx-1)" }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        {/* chart */}
        {!compact && (
          <div style={{ marginBottom: 13 }}>
            <ChartFrame label={post.chart} dir={post.dir} symbol={post.symbol} h={196} />
          </div>
        )}

        {/* tags */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 13 }}>
          {post.tags.map((t) => (
            <span key={t} className="chip tag">
              #{t}
            </span>
          ))}
        </div>

        {/* actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--tx-3)" }}>
          <button className="th-action">
            <Icon name="comment" size={17} />
            <span className="mono">{post.comments}</span>
          </button>
          <button className="th-action">
            <Icon name="share" size={17} /> Share
          </button>
          <button className="th-action">
            <Icon name="bookmark" size={17} /> Save
          </button>
          <div style={{ flex: 1 }} />
          <button className="th-action">
            <Icon name="target" size={17} /> Copy setup
          </button>
        </div>
      </div>
    </article>
  );
}

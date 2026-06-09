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
import { getNiche } from "@/config/niches";
import { NicheChip } from "@/components/niche/niche-chip";
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

/** Sign/direction-aware color for a stat-strip value. */
function valueColor(value: string): string | undefined {
  if (value === "LONG") return "var(--profit)";
  if (value === "SHORT") return "var(--loss)";
  if (/^\+/.test(value)) return "var(--profit)";
  if (/^[-−]/.test(value)) return "var(--loss)";
  return undefined;
}

interface PostCardProps {
  post: Post;
  author: Profile;
  /** Author's RP in this post's niche, for the contextual rank badge. */
  nicheRp?: number;
  layout?: "comfortable" | "compact";
}

export function PostCard({ post, author, nicheRp, layout = "comfortable" }: PostCardProps) {
  const rb = resultBadge(post.result);
  const compact = layout === "compact";
  const ringColor = author.rp > 7000 ? "var(--t-gold)" : null;
  const isTrading = post.niche === "trading";
  const niche = getNiche(post.niche);
  const badgeRp = nicheRp ?? author.rp;

  // Stat-strip values: explicit override (non-trading) or the trading fallback.
  const fallback: [string, string, string, string] = [
    post.symbol,
    post.dir.toUpperCase(),
    post.rr > 0 ? post.rr.toFixed(1) + ":1" : "—",
    (post.pnl >= 0 ? "+" : "") + post.pnl + "R",
  ];
  const values = post.stats ?? fallback;
  const statStrip = niche.postStatFields.map((field, i) => ({
    l: field.label,
    v: values[i] ?? "—",
    c: valueColor(values[i] ?? ""),
  }));

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
              <RankBadge rp={badgeRp} size="sm" showName={false} niche={post.niche} />
              <span className="mono" style={{ fontSize: 11.5, color: "var(--tx-4)" }}>
                · {post.time}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <NicheChip niche={post.niche} />
              <span className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)" }}>
                @{author.handle}
              </span>
            </div>
          </div>
          {isTrading && (
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
          )}
          <IconButton icon="ellipsis" size="sm" aria-label="Post options" />
        </div>

        {/* title + body */}
        <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, marginBottom: 7, letterSpacing: "-0.01em" }}>
          {post.title}
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.55, margin: "0 0 13px", maxWidth: 640 }}>
          {post.body}
        </p>

        {/* niche stat strip */}
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

        {/* chart (trading setups with a chart label) */}
        {!compact && isTrading && post.chart && (
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
          <button className="th-action" aria-label="View comments">
            <Icon name="comment" size={17} />
            <span className="mono">{post.comments}</span>
          </button>
          <button className="th-action" aria-label="Share post">
            <Icon name="share" size={17} /> Share
          </button>
          <button className="th-action" aria-label="Save post">
            <Icon name="bookmark" size={17} /> Save
          </button>
          <div style={{ flex: 1 }} />
          <button className="th-action" aria-label={niche.copy.postAction}>
            <Icon name="target" size={17} /> {niche.copy.postAction}
          </button>
        </div>
      </div>
    </article>
  );
}

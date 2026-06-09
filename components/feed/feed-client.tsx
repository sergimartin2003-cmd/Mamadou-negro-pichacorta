"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post, Profile, NicheSlug } from "@/types/db";
import { Segmented, Icon } from "@/components/ui";
import { NICHE_LIST } from "@/config/niches";
import { PostCard } from "./post-card";
import { ComposerStrip } from "./composer-strip";

interface FeedClientProps {
  posts: Post[];
  authors: Record<string, Profile>;
  me: Profile;
  nicheRpByPost: Record<string, number>;
}

type Scope = "For you" | "Following" | "Trending";
type Sort = "Trending" | "Latest" | "Top R";
type Layout = "comfortable" | "compact";
type NicheFilter = NicheSlug | "all";

const SCOPE_OPTIONS: Scope[] = ["For you", "Following", "Trending"];
const SORT_OPTIONS: Sort[] = ["Trending", "Latest", "Top R"];

function score(post: Post): number {
  return post.up - post.down;
}

// Scope only selects WHICH posts; ordering is the sort's job (applied after).
// This keeps the sort selection from being silently overridden by the scope.
function scopePosts(posts: Post[], scope: Scope, followingIds: string[]): Post[] {
  if (scope === "Following") {
    const follows = new Set(followingIds);
    return posts.filter((p) => follows.has(p.author));
  }
  return posts;
}

function sortPosts(posts: Post[], sort: Sort): Post[] {
  if (sort === "Top R") {
    return [...posts].sort((a, b) => b.rr - a.rr);
  }
  if (sort === "Trending") {
    return [...posts].sort((a, b) => score(b) - score(a));
  }
  // "Latest": the query layer already orders most-recent first.
  return posts;
}

function filterPosts(
  posts: Post[],
  scope: Scope,
  sort: Sort,
  niche: NicheFilter,
  followingIds: string[],
): Post[] {
  const byNiche = niche === "all" ? posts : posts.filter((p) => p.niche === niche);
  return sortPosts(scopePosts(byNiche, scope, followingIds), sort);
}

export function FeedClient({ posts, authors, me, nicheRpByPost }: FeedClientProps) {
  const [scope, setScope] = useState<Scope>("For you");
  const [sort, setSort] = useState<Sort>("Trending");
  const [layout, setLayout] = useState<Layout>("comfortable");
  const [niche, setNiche] = useState<NicheFilter>("all");

  const visible = filterPosts(posts, scope, sort, niche, me.followingIds ?? []);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Segmented options={SCOPE_OPTIONS} value={scope} onChange={(k) => setScope(k as Scope)} />
        <div style={{ flex: 1 }} />
        <Segmented options={SORT_OPTIONS} value={sort} onChange={(k) => setSort(k as Sort)} size="sm" />
        <button
          className="th-iconbtn"
          onClick={() => setLayout((l) => (l === "compact" ? "comfortable" : "compact"))}
          title="Toggle density"
          aria-label="Toggle density"
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* niche filter — one shared feed; niche is a tag, not a separate feed */}
      <div
        style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}
        role="tablist"
        aria-label="Filter feed by niche"
      >
        <FilterChip
          label="All"
          glyph="✲"
          color="var(--brand)"
          active={niche === "all"}
          onClick={() => setNiche("all")}
        />
        {NICHE_LIST.map((n) => (
          <FilterChip
            key={n.slug}
            label={n.name}
            glyph={n.glyph}
            color={n.color}
            active={niche === n.slug}
            onClick={() => setNiche(n.slug)}
          />
        ))}
      </div>

      <ComposerStrip me={me} />

      {/* season banner */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          background:
            "linear-gradient(110deg, color-mix(in srgb, var(--t-gold) 12%, var(--bg-2)), var(--bg-2))",
          borderColor: "color-mix(in srgb, var(--t-gold) 28%, transparent)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            display: "grid",
            placeItems: "center",
            background: "color-mix(in srgb, var(--t-gold) 18%, transparent)",
            color: "var(--t-gold)",
          }}
        >
          <Icon name="trophy" size={21} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Season 7 ends in 6 days</div>
          <div style={{ fontSize: 12.5, color: "var(--tx-3)" }}>
            You&#39;re 2 ranks from{" "}
            <span style={{ color: "var(--t-diamond)" }}>Diamond</span> in Trading. Keep your drawdown
            under 10%.
          </div>
        </div>
        <Link href="/rankings" className="btn sm">
          View placement
        </Link>
      </div>

      {visible.length === 0 && (
        <div className="card pad" style={{ textAlign: "center", color: "var(--tx-3)", fontSize: 13.5 }}>
          {niche === "all"
            ? "No posts yet."
            : (NICHE_LIST.find((n) => n.slug === niche)?.copy.feedEmpty ?? "No posts yet.")}
        </div>
      )}

      {visible.map((p) => {
        const author = authors[p.author];
        if (!author) return null;
        return (
          <PostCard
            key={p.id}
            post={p}
            author={author}
            nicheRp={nicheRpByPost[p.id]}
            layout={layout}
          />
        );
      })}

      {visible.length > 0 && (
        <button className="btn ghost" style={{ alignSelf: "center", margin: "4px 0 20px" }}>
          Load more
        </button>
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  glyph: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, glyph, color, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        color: active ? color : "var(--tx-2)",
        background: active ? `color-mix(in srgb, ${color} 16%, transparent)` : "var(--bg-3)",
        border: `1px solid ${active ? `color-mix(in srgb, ${color} 42%, transparent)` : "var(--line-1)"}`,
        borderRadius: "var(--r-pill)",
      }}
    >
      <span aria-hidden style={{ fontSize: 13 }}>
        {glyph}
      </span>
      {label}
    </button>
  );
}

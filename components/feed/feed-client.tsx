"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post, Profile } from "@/types/db";
import { Segmented, Icon } from "@/components/ui";
import { PostCard } from "./post-card";
import { ComposerStrip } from "./composer-strip";

interface FeedClientProps {
  posts: Post[];
  authors: Record<string, Profile>;
  me: Profile;
}

type Scope = "For you" | "Following" | "Trending";
type Sort = "Trending" | "Latest" | "Top R";
type Layout = "comfortable" | "compact";

const SCOPE_OPTIONS: Scope[] = ["For you", "Following", "Trending"];
const SORT_OPTIONS: Sort[] = ["Trending", "Latest", "Top R"];

function score(post: Post): number {
  return post.up - post.down;
}

function scopePosts(posts: Post[], scope: Scope, followingIds: string[]): Post[] {
  if (scope === "Following") {
    const follows = new Set(followingIds);
    return posts.filter((p) => follows.has(p.author));
  }
  if (scope === "Trending") {
    return [...posts].sort((a, b) => score(b) - score(a));
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
  // "Latest": seed data is authored newest-first, so preserve incoming order.
  return posts;
}

function filterPosts(posts: Post[], scope: Scope, sort: Sort, followingIds: string[]): Post[] {
  return sortPosts(scopePosts(posts, scope, followingIds), sort);
}

export function FeedClient({ posts, authors, me }: FeedClientProps) {
  const [scope, setScope] = useState<Scope>("For you");
  const [sort, setSort] = useState<Sort>("Trending");
  const [layout, setLayout] = useState<Layout>("comfortable");

  const visible = filterPosts(posts, scope, sort, me.followingIds ?? []);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Segmented
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={(k) => setScope(k as Scope)}
        />
        <div style={{ flex: 1 }} />
        <Segmented
          options={SORT_OPTIONS}
          value={sort}
          onChange={(k) => setSort(k as Sort)}
          size="sm"
        />
        <button
          className="th-iconbtn"
          onClick={() => setLayout((l) => (l === "compact" ? "comfortable" : "compact"))}
          title="Toggle density"
          aria-label="Toggle density"
        >
          <Icon name="menu" size={18} />
        </button>
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
            <span style={{ color: "var(--t-diamond)" }}>Diamond</span>. Keep your drawdown under
            10%.
          </div>
        </div>
        <Link href="/rankings" className="btn sm">
          View placement
        </Link>
      </div>

      {visible.map((p) => {
        const author = authors[p.author];
        if (!author) return null;
        return <PostCard key={p.id} post={p} author={author} layout={layout} />;
      })}

      <button className="btn ghost" style={{ alignSelf: "center", margin: "4px 0 20px" }}>
        Load more setups
      </button>
    </div>
  );
}

import { describe, it, expect } from "vitest";
import {
  mapMarket,
  mapMarketScope,
  relativeTime,
  mapProfileRow,
  mapPostRow,
  mapCommunityRow,
  mapCompetitionRow,
  mapNotificationRow,
} from "@/lib/data/supabase-queries";

describe("mapMarket", () => {
  it("maps known DB enums to capitalized labels", () => {
    expect(mapMarket("crypto")).toBe("Crypto");
    expect(mapMarket("forex")).toBe("Forex");
    expect(mapMarket("futures")).toBe("Futures");
    expect(mapMarket("stocks")).toBe("Stocks");
  });

  it("defaults to Crypto for null/unknown", () => {
    expect(mapMarket(null)).toBe("Crypto");
    expect(mapMarket(undefined)).toBe("Crypto");
    expect(mapMarket("bogus")).toBe("Crypto");
  });
});

describe("mapMarketScope", () => {
  it("returns All when no market is set", () => {
    expect(mapMarketScope(null)).toBe("All");
    expect(mapMarketScope(undefined)).toBe("All");
  });

  it("maps a concrete market", () => {
    expect(mapMarketScope("forex")).toBe("Forex");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-06-23T12:00:00Z").getTime();

  it("renders sub-minute as now", () => {
    expect(relativeTime("2026-06-23T11:59:30Z", now)).toBe("now");
  });

  it("renders minutes, hours, days, weeks", () => {
    expect(relativeTime("2026-06-23T11:46:00Z", now)).toBe("14m");
    expect(relativeTime("2026-06-23T09:00:00Z", now)).toBe("3h");
    expect(relativeTime("2026-06-21T12:00:00Z", now)).toBe("2d");
    expect(relativeTime("2026-06-09T12:00:00Z", now)).toBe("2w");
  });

  it("is resilient to missing/invalid input", () => {
    expect(relativeTime(null, now)).toBe("now");
    expect(relativeTime("not-a-date", now)).toBe("now");
  });
});

describe("mapProfileRow", () => {
  const baseRow = {
    id: "u1",
    handle: "alexr",
    display_name: "Alex Rhodes",
    bio: "in public",
    country: "US",
    flag: "🇺🇸",
    market: "crypto",
    verified: true,
    avatar_from: "#9B5CFF",
    avatar_to: "#16C784",
    rp: 4980,
    followers_count: 12400,
    following_count: 340,
  };

  it("maps a full row with embedded stats (object form)", () => {
    const profile = mapProfileRow({
      ...baseRow,
      trader_stats: {
        win_rate: 62,
        total_pnl_pct: 128.4,
        trades_count: 1185,
        max_drawdown: 9.1,
        consistency: 87,
        win_streak: 8,
      },
    });
    expect(profile).toMatchObject({
      id: "u1",
      name: "Alex Rhodes",
      handle: "alexr",
      rp: 4980,
      market: "Crypto",
      win: 62,
      pnl: 128.4,
      trades: 1185,
      streak: 8,
      avatar: ["#9B5CFF", "#16C784"],
    });
    expect(profile.followingIds).toBeUndefined();
  });

  it("accepts stats as a single-element array (Supabase embed)", () => {
    const profile = mapProfileRow({
      ...baseRow,
      trader_stats: [{ win_rate: 50, total_pnl_pct: 10, trades_count: 5, max_drawdown: 2, consistency: 70, win_streak: 1 }],
    });
    expect(profile.win).toBe(50);
    expect(profile.trades).toBe(5);
  });

  it("falls back to handle as name and zeros when stats are missing", () => {
    const profile = mapProfileRow({ ...baseRow, display_name: null, trader_stats: null });
    expect(profile.name).toBe("alexr");
    expect(profile.win).toBe(0);
    expect(profile.trades).toBe(0);
  });

  it("attaches followingIds when provided", () => {
    const profile = mapProfileRow(baseRow, ["u2", "u3"]);
    expect(profile.followingIds).toEqual(["u2", "u3"]);
  });
});

describe("mapPostRow", () => {
  const now = new Date("2026-06-23T12:00:00Z").getTime();

  it("maps a post with tags and computes relative time", () => {
    const post = mapPostRow(
      {
        id: "p1",
        author_id: "u3",
        market: "futures",
        dir: "long",
        symbol: "NQ",
        title: "Reclaim",
        body: "MSS",
        rr: 3,
        pnl: 4.2,
        result: "win",
        chart_label: "NQ 2m",
        upvotes: 10,
        downvotes: 1,
        comments_count: 4,
        created_at: "2026-06-23T11:46:00Z",
        post_tags: [{ tag: "NQ" }, { tag: "swing" }],
      },
      now,
    );
    expect(post).toMatchObject({
      id: "p1",
      author: "u3",
      time: "14m",
      market: "Futures",
      dir: "long",
      symbol: "NQ",
      result: "win",
      tags: ["NQ", "swing"],
      up: 10,
      down: 1,
      comments: 4,
      chart: "NQ 2m",
    });
  });

  it("defaults sensibly when optional fields are null", () => {
    const post = mapPostRow({
      id: "p2",
      author_id: "u1",
      market: null,
      dir: null,
      symbol: null,
      title: null,
      body: null,
      rr: null,
      pnl: null,
      result: null,
      chart_label: null,
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
      created_at: "2026-06-23T12:00:00Z",
      post_tags: null,
    });
    expect(post.market).toBe("Crypto");
    expect(post.dir).toBe("long");
    expect(post.result).toBe("open");
    expect(post.tags).toEqual([]);
  });
});

describe("mapCommunityRow", () => {
  it("maps a community and falls back to slug for name", () => {
    expect(
      mapCommunityRow({
        id: "c1",
        name: null,
        slug: "order-flow",
        members_count: 1200,
        market: "futures",
        icon: "⊞",
        color: "#56A8FF",
        description: "flow",
      }),
    ).toEqual({
      id: "c1",
      name: "order-flow",
      members: 1200,
      market: "Futures",
      icon: "⊞",
      color: "#56A8FF",
      desc: "flow",
    });
  });
});

describe("mapCompetitionRow", () => {
  const now = new Date("2026-06-23T12:00:00Z").getTime();

  it("maps kind enum and computes days left", () => {
    const comp = mapCompetitionRow(
      {
        id: "k1",
        name: "Spring Ladder",
        kind: "battle",
        market: null,
        participants_count: 64,
        ends_at: "2026-06-25T12:00:00Z",
        prize: "5000",
        metric: "pnl",
        rule: "top",
      },
      true,
      3,
      now,
    );
    expect(comp).toMatchObject({
      kind: "48h Battle",
      market: "All",
      participants: 64,
      daysLeft: 2,
      joined: true,
      myRank: 3,
    });
  });

  it("clamps days left to zero for past competitions", () => {
    const comp = mapCompetitionRow(
      {
        id: "k2",
        name: "Old",
        kind: "seasonal",
        market: "crypto",
        participants_count: 1,
        ends_at: "2026-06-01T12:00:00Z",
        prize: "",
        metric: "",
        rule: "",
      },
      false,
      null,
      now,
    );
    expect(comp.daysLeft).toBe(0);
    expect(comp.kind).toBe("Seasonal");
  });
});

describe("mapNotificationRow", () => {
  const now = new Date("2026-06-23T12:00:00Z").getTime();

  it("maps a renderable notification with actor handle", () => {
    const notif = mapNotificationRow(
      {
        id: "n1",
        type: "follow",
        read: false,
        body: "started following you",
        created_at: "2026-06-23T11:00:00Z",
        actor: { handle: "mara" },
      },
      now,
    );
    expect(notif).toEqual({
      id: "n1",
      type: "follow",
      read: false,
      time: "1h",
      text: "started following you",
      who: "mara",
    });
  });

  it("returns null for unsupported types like system", () => {
    expect(
      mapNotificationRow({
        id: "n2",
        type: "system",
        read: false,
        body: "maintenance",
        created_at: "2026-06-23T11:00:00Z",
        actor: null,
      }),
    ).toBeNull();
  });
});

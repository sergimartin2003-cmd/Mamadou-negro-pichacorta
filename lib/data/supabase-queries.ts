// Supabase-backed read implementations. These run only when supabaseConfigured()
// is true; lib/data/queries.ts delegates here and falls back to seed on any error,
// so the app keeps working in demo mode and turns live the moment credentials exist.
//
// Mapper functions are pure and exported for unit testing (no DB required).

import type {
  Community,
  Competition,
  Market,
  MarketScope,
  Notification,
  NotificationType,
  Post,
  Profile,
  TradeDir,
  TradeResult,
} from "@/types/db";
import type { FeedOptions, RankingsOptions, CompetitionFilter } from "./queries";
import { anonClient } from "@/lib/supabase/anon";

// ---------------------------------------------------------------------------
// Pure mappers (DB row shapes → domain types)
// ---------------------------------------------------------------------------

const MARKET_LABEL: Record<string, Market> = {
  crypto: "Crypto",
  forex: "Forex",
  futures: "Futures",
  stocks: "Stocks",
};

/** DB market enum → domain Market (defaults to Crypto when missing). */
export function mapMarket(value: string | null | undefined): Market {
  return (value && MARKET_LABEL[value]) || "Crypto";
}

/** DB market enum → domain MarketScope ("All" when the row targets every market). */
export function mapMarketScope(value: string | null | undefined): MarketScope {
  return value ? mapMarket(value) : "All";
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** ISO timestamp → compact relative label ("now", "14m", "3h", "2d", "5w"). */
export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "now";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "now";
  const diff = Math.max(0, now - then);
  if (diff < MINUTE) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d`;
  return `${Math.floor(diff / WEEK)}w`;
}

interface ProfileRow {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  country: string | null;
  flag: string | null;
  market: string | null;
  verified: boolean;
  avatar_from: string | null;
  avatar_to: string | null;
  rp: number;
  followers_count: number;
  following_count: number;
  trader_stats?: TraderStatsRow | TraderStatsRow[] | null;
}

interface TraderStatsRow {
  win_rate: number | null;
  total_pnl_pct: number | null;
  trades_count: number | null;
  max_drawdown: number | null;
  consistency: number | null;
  win_streak: number | null;
}

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function mapProfileRow(row: ProfileRow, followingIds?: string[]): Profile {
  const stats = firstOrNull(row.trader_stats);
  return {
    id: row.id,
    name: row.display_name?.trim() || row.handle,
    handle: row.handle,
    rp: row.rp ?? 0,
    verified: row.verified ?? false,
    market: mapMarket(row.market),
    country: row.country ?? "",
    flag: row.flag ?? "🏳️",
    win: stats?.win_rate ?? 0,
    pnl: stats?.total_pnl_pct ?? 0,
    trades: stats?.trades_count ?? 0,
    dd: stats?.max_drawdown ?? 0,
    consistency: stats?.consistency ?? 0,
    streak: stats?.win_streak ?? 0,
    avatar: [row.avatar_from ?? "#9B5CFF", row.avatar_to ?? "#16C784"],
    bio: row.bio ?? "",
    followers: row.followers_count ?? 0,
    following: row.following_count ?? 0,
    ...(followingIds ? { followingIds } : {}),
  };
}

interface PostRow {
  id: string;
  author_id: string;
  market: string | null;
  dir: string | null;
  symbol: string | null;
  title: string | null;
  body: string | null;
  rr: number | null;
  pnl: number | null;
  result: string | null;
  chart_label: string | null;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  created_at: string;
  author?: { handle: string; verified: boolean } | { handle: string; verified: boolean }[] | null;
  post_tags?: { tag: string }[] | null;
}

export function mapPostRow(row: PostRow, now?: number): Post {
  return {
    id: row.id,
    author: row.author_id,
    time: relativeTime(row.created_at, now),
    market: mapMarket(row.market),
    dir: (row.dir as TradeDir) ?? "long",
    symbol: row.symbol ?? "",
    title: row.title ?? "",
    body: row.body ?? "",
    rr: row.rr ?? 0,
    pnl: row.pnl ?? 0,
    result: (row.result as TradeResult) ?? "open",
    tags: (row.post_tags ?? []).map((t) => t.tag),
    up: row.upvotes ?? 0,
    down: row.downvotes ?? 0,
    comments: row.comments_count ?? 0,
    chart: row.chart_label ?? "",
  };
}

interface CommunityRow {
  id: string;
  name: string | null;
  slug: string;
  members_count: number;
  market: string | null;
  icon: string | null;
  color: string | null;
  description: string | null;
}

export function mapCommunityRow(row: CommunityRow): Community {
  return {
    id: row.id,
    name: row.name ?? row.slug,
    members: row.members_count ?? 0,
    market: mapMarketScope(row.market),
    icon: row.icon ?? "⊞",
    color: row.color ?? "#56A8FF",
    desc: row.description ?? "",
  };
}

const COMPETITION_KIND: Record<string, Competition["kind"]> = {
  seasonal: "Seasonal",
  battle: "48h Battle",
  friends: "Friends",
};

interface CompetitionRow {
  id: string;
  name: string | null;
  kind: string;
  market: string | null;
  participants_count: number;
  ends_at: string | null;
  prize: string | null;
  metric: string | null;
  rule: string | null;
}

export function mapCompetitionRow(
  row: CompetitionRow,
  joined: boolean,
  myRank: number | null,
  now: number = Date.now(),
): Competition {
  const daysLeft = row.ends_at
    ? Math.max(0, Math.ceil((new Date(row.ends_at).getTime() - now) / DAY))
    : 0;
  return {
    id: row.id,
    name: row.name ?? "Competition",
    kind: COMPETITION_KIND[row.kind] ?? "Seasonal",
    market: mapMarketScope(row.market),
    participants: row.participants_count ?? 0,
    daysLeft,
    prize: row.prize ?? "",
    metric: row.metric ?? "",
    joined,
    myRank,
    rule: row.rule ?? "",
  };
}

const NOTIF_TYPES = new Set<NotificationType>([
  "rank",
  "like",
  "comp",
  "comment",
  "follow",
  "tier",
]);

interface NotificationRow {
  id: string;
  type: string;
  read: boolean;
  body: string | null;
  created_at: string;
  actor?: { handle: string } | { handle: string }[] | null;
}

/** Returns null for notification types the domain UI does not render (e.g. "system"). */
export function mapNotificationRow(row: NotificationRow, now?: number): Notification | null {
  if (!NOTIF_TYPES.has(row.type as NotificationType)) return null;
  const actor = firstOrNull(row.actor);
  return {
    id: row.id,
    type: row.type as NotificationType,
    read: row.read ?? false,
    time: relativeTime(row.created_at, now),
    text: row.body ?? "",
    who: actor?.handle ?? null,
  };
}

// ---------------------------------------------------------------------------
// Async fetchers (throw on error → queries.ts falls back to seed)
// ---------------------------------------------------------------------------

const PROFILE_SELECT =
  "id, handle, display_name, bio, country, flag, market, verified, avatar_from, avatar_to, rp, followers_count, following_count, trader_stats(win_rate, total_pnl_pct, trades_count, max_drawdown, consistency, win_streak)";

const POST_SELECT =
  "id, author_id, market, dir, symbol, title, body, rr, pnl, result, chart_label, upvotes, downvotes, comments_count, created_at, author:profiles!author_id(handle, verified), post_tags(tag)";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getFeed(opts: FeedOptions = {}): Promise<Post[]> {
  const supabase = anonClient();
  let query = supabase.from("posts").select(POST_SELECT);
  if (opts.market) query = query.eq("market", opts.market.toLowerCase());
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  const now = Date.now();
  let posts = (data as PostRow[]).map((row) => ({ row, post: mapPostRow(row, now) }));

  if (opts.scope === "verified") {
    posts = posts.filter(({ row }) => firstOrNull(row.author)?.verified === true);
  }

  const result = posts.map(({ post }) => post);
  if (opts.sort === "top") {
    result.sort((a, b) => b.up - b.down + b.comments - (a.up - a.down + a.comments));
  }
  return result;
}

export async function getProfile(idOrHandle: string): Promise<Profile | null> {
  const supabase = anonClient();
  const normalized = idOrHandle.replace(/^@/, "");
  const column = UUID_RE.test(normalized) ? "id" : "handle";

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq(column, normalized)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function getTopTraders(n: number): Promise<Profile[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("rp", { ascending: false })
    .limit(Math.max(0, n));
  if (error) throw error;
  return (data as ProfileRow[]).map((row) => mapProfileRow(row));
}

export async function getSuggestedTraders(n: number): Promise<Profile[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("followers_count", { ascending: false })
    .range(4, 4 + Math.max(0, n) - 1);
  if (error) throw error;
  return (data as ProfileRow[]).map((row) => mapProfileRow(row));
}

export async function getRankings(opts: RankingsOptions = {}): Promise<Profile[]> {
  const supabase = anonClient();
  let query = supabase.from("profiles").select(PROFILE_SELECT);
  if (opts.market) query = query.eq("market", opts.market.toLowerCase());
  query = query.order("rp", { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProfileRow[]).map((row) => mapProfileRow(row));
}

export async function getCommunities(): Promise<Community[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from("communities")
    .select("id, name, slug, members_count, market, icon, color, description")
    .order("members_count", { ascending: false });
  if (error) throw error;
  return (data as CommunityRow[]).map(mapCommunityRow);
}

export async function getCompetitions(filter: CompetitionFilter = {}): Promise<Competition[]> {
  // The anon client has no session, so "joined"/"myRank" are resolved per-user
  // by the seed layer for now; public listings show joined=false.
  const supabase = anonClient();
  let query = supabase
    .from("competitions")
    .select("id, name, kind, market, participants_count, ends_at, prize, metric, rule");
  if (filter.market) query = query.eq("market", filter.market.toLowerCase());
  const { data, error } = await query;
  if (error) throw error;

  const now = Date.now();
  let competitions = (data as CompetitionRow[]).map((row) =>
    mapCompetitionRow(row, false, null, now),
  );
  if (filter.joined !== undefined) {
    competitions = competitions.filter((c) => c.joined === filter.joined);
  }
  return competitions;
}

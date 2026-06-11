"use server";

/**
 * Real Supabase READ implementations. These are dynamically imported by the
 * query layer ONLY when `supabaseConfigured()` is true, and every function is
 * wrapped by the caller in try/catch with a seed/empty fallback — so a mapping
 * mismatch can never break the app, it degrades gracefully.
 *
 * Marked "use server": this is a server boundary, so the cookie-bound client
 * (next/headers) never enters the client bundle even though the query layer is
 * client-reachable. All exports are async functions, as the directive requires.
 */

import type {
  ChatMessage,
  Channel,
  Community,
  Market,
  MarketScope,
  Notification,
  NotificationType,
  Post,
  Profile,
} from "@/types/db";

/**
 * Defer the cookie-bound server client behind a runtime import so `next/headers`
 * never enters the static client graph (queries.ts is client-reachable).
 */
async function sb() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

const DEFAULT_AVATAR: [string, string] = ["#9B5CFF", "#5B7CFF"];
const KNOWN_NOTIF_TYPES = new Set(["rank", "like", "comp", "comment", "follow", "tier"]);

/** Short relative-time label ("3m", "5h", "2d") from an ISO timestamp. */
function rel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.max(0, Math.floor(diffMs / 60000));
  if (m < 60) return `${m || 1}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface StatsRow {
  win_rate: number | null;
  total_pnl_pct: number | null;
  trades_count: number | null;
  max_drawdown: number | null;
  consistency: number | null;
  win_streak: number | null;
}

interface ProfileRow {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  country: string | null;
  flag: string | null;
  market: Market | null;
  verified: boolean;
  avatar_from: string | null;
  avatar_to: string | null;
  rp: number;
  followers_count: number;
  following_count: number;
  trader_stats?: StatsRow | StatsRow[] | null;
}

function mapProfile(row: ProfileRow): Profile {
  const s = Array.isArray(row.trader_stats) ? row.trader_stats[0] : row.trader_stats;
  return {
    id: row.id,
    name: row.display_name ?? row.handle,
    handle: row.handle,
    rp: row.rp ?? 1000,
    verified: row.verified ?? false,
    market: (row.market as Market) ?? "Crypto",
    country: row.country ?? "",
    flag: row.flag ?? "🏳️",
    win: s?.win_rate ?? 0,
    pnl: s?.total_pnl_pct ?? 0,
    trades: s?.trades_count ?? 0,
    dd: s?.max_drawdown ?? 0,
    consistency: s?.consistency ?? 0,
    streak: s?.win_streak ?? 0,
    avatar: [row.avatar_from ?? DEFAULT_AVATAR[0], row.avatar_to ?? DEFAULT_AVATAR[1]],
    bio: row.bio ?? "",
    followers: row.followers_count ?? 0,
    following: row.following_count ?? 0,
  };
}

const PROFILE_SELECT =
  "id, handle, display_name, bio, country, flag, market, verified, avatar_from, avatar_to, rp, followers_count, following_count, trader_stats(win_rate, total_pnl_pct, trades_count, max_drawdown, consistency, win_streak)";

export async function realGetMe(): Promise<Profile | null> {
  const supabase = await sb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select(PROFILE_SELECT).eq("id", user.id).maybeSingle();
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function realGetProfile(idOrHandle: string): Promise<Profile | null> {
  const supabase = await sb();
  const handle = idOrHandle.replace(/^@/, "");
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrHandle);
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq(isUuid ? "id" : "handle", isUuid ? idOrHandle : handle)
    .maybeSingle();
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function realGetProfilesByIds(ids: string[]): Promise<Record<string, Profile>> {
  if (ids.length === 0) return {};
  const supabase = await sb();
  const { data } = await supabase.from("profiles").select(PROFILE_SELECT).in("id", ids);
  const map: Record<string, Profile> = {};
  for (const row of (data ?? []) as ProfileRow[]) map[row.id] = mapProfile(row);
  return map;
}

interface PostRow {
  id: string;
  author_id: string;
  niche: string | null;
  market: Market | null;
  dir: "long" | "short" | null;
  symbol: string | null;
  title: string | null;
  body: string | null;
  rr: number | null;
  pnl: number | null;
  result: "win" | "loss" | "open" | null;
  chart_label: string | null;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  created_at: string;
}

export async function realGetFeed(niche?: string): Promise<Post[]> {
  const supabase = await sb();
  let query = supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
  if (niche) query = query.eq("niche", niche);
  const { data } = await query;
  return ((data ?? []) as PostRow[]).map((r) => ({
    id: r.id,
    author: r.author_id,
    time: rel(r.created_at),
    niche: (r.niche as Post["niche"]) ?? "trading",
    market: (r.market as Market) ?? "Crypto",
    dir: r.dir ?? "long",
    symbol: r.symbol ?? "—",
    title: r.title ?? "",
    body: r.body ?? "",
    rr: r.rr ?? 0,
    pnl: r.pnl ?? 0,
    result: r.result ?? "open",
    tags: [],
    up: r.upvotes ?? 0,
    down: r.downvotes ?? 0,
    comments: r.comments_count ?? 0,
    chart: r.chart_label ?? "",
  }));
}

interface CommunityRow {
  id: string;
  name: string | null;
  market: MarketScope | null;
  icon: string | null;
  color: string | null;
  description: string | null;
  members_count: number;
}

export async function realGetCommunities(): Promise<Community[]> {
  const supabase = await sb();
  const { data } = await supabase
    .from("communities")
    .select("id, name, market, icon, color, description, members_count")
    .order("members_count", { ascending: false });
  return ((data ?? []) as CommunityRow[]).map((r) => ({
    id: r.id,
    name: r.name ?? "Comunidad",
    members: r.members_count ?? 0,
    market: (r.market as MarketScope) ?? "All",
    icon: r.icon ?? "◇",
    color: r.color ?? "var(--brand)",
    desc: r.description ?? "",
  }));
}

export async function realGetChannels(communityId: string): Promise<Channel[]> {
  if (!communityId) return [];
  const supabase = await sb();
  const { data } = await supabase
    .from("channels")
    .select("id, name, kind, position")
    .eq("community_id", communityId)
    .order("position", { ascending: true });
  return ((data ?? []) as { id: string; name: string; kind: "text" | "voice" }[]).map((r, i) => ({
    id: r.id,
    name: r.name,
    kind: r.kind ?? "text",
    active: i === 0,
  }));
}

export async function realGetChatMessages(channelId: string): Promise<ChatMessage[]> {
  if (!channelId) return [];
  const supabase = await sb();
  const { data } = await supabase
    .from("channel_messages")
    .select("id, author_id, body, chart_label, created_at")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(60);
  return (
    (data ?? []) as { id: string; author_id: string; body: string | null; chart_label: string | null; created_at: string }[]
  ).map((r) => ({
    id: r.id,
    author: r.author_id,
    time: new Date(r.created_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    text: r.body ?? "",
    chart: r.chart_label ?? undefined,
  }));
}

export async function realGetNotifications(): Promise<Notification[]> {
  const supabase = await sb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("notifications")
    .select("id, actor_id, type, body, read, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);
  return (
    (data ?? []) as { id: string; actor_id: string | null; type: string; body: string | null; read: boolean; created_at: string }[]
  )
    .filter((r) => KNOWN_NOTIF_TYPES.has(r.type))
    .map((r) => ({
      id: r.id,
      type: r.type as NotificationType,
      read: r.read,
      time: rel(r.created_at),
      text: r.body ?? "",
      who: r.actor_id,
    }));
}

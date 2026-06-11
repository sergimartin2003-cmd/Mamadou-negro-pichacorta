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
  Comment,
  Community,
  Dm,
  DmMessage,
  Market,
  MarketScope,
  Notification,
  NotificationType,
  Post,
  Profile,
} from "@/types/db";
import type { NicheStatRow } from "./niche-seed";

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

// --- comments ----------------------------------------------------------------

export async function realGetComments(postId: string): Promise<Comment[]> {
  const supabase = await sb();
  const { data } = await supabase
    .from("comments")
    .select("id, post_id, author_id, parent_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);
  return (
    (data ?? []) as { id: string; post_id: string; author_id: string; parent_id: string | null; body: string | null; created_at: string }[]
  ).map((r) => ({
    id: r.id,
    postId: r.post_id,
    author: r.author_id,
    parentId: r.parent_id,
    body: r.body ?? "",
    time: rel(r.created_at),
    up: 0,
  }));
}

// --- direct messages ---------------------------------------------------------

export async function realGetDms(): Promise<Dm[]> {
  const supabase = await sb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: parts } = await supabase
    .from("dm_participants")
    .select("thread_id")
    .eq("profile_id", user.id);
  const threadIds = ((parts ?? []) as { thread_id: string }[]).map((p) => p.thread_id);
  if (threadIds.length === 0) return [];

  const { data: others } = await supabase
    .from("dm_participants")
    .select("thread_id, profile_id")
    .in("thread_id", threadIds)
    .neq("profile_id", user.id);
  const otherByThread: Record<string, string> = {};
  for (const o of (others ?? []) as { thread_id: string; profile_id: string }[]) {
    otherByThread[o.thread_id] = o.profile_id;
  }

  const { data: msgs } = await supabase
    .from("dm_messages")
    .select("thread_id, body, created_at")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false });
  const lastByThread: Record<string, { body: string | null; created_at: string }> = {};
  for (const m of (msgs ?? []) as { thread_id: string; body: string | null; created_at: string }[]) {
    if (!lastByThread[m.thread_id]) lastByThread[m.thread_id] = m;
  }

  return threadIds
    .map((tid) => ({
      id: tid,
      who: otherByThread[tid] ?? "",
      last: lastByThread[tid]?.body ?? "",
      time: lastByThread[tid] ? rel(lastByThread[tid].created_at) : "",
      unread: 0,
      online: false,
    }))
    .filter((d) => d.who);
}

export async function realGetDmThread(threadId: string): Promise<DmMessage[]> {
  if (!threadId) return [];
  const supabase = await sb();
  const { data } = await supabase
    .from("dm_messages")
    .select("author_id, body, file_name, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(200);
  return (
    (data ?? []) as { author_id: string; body: string | null; file_name: string | null; created_at: string }[]
  ).map((r) => ({
    from: r.author_id,
    time: new Date(r.created_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    text: r.body ?? "",
    file: r.file_name ?? undefined,
  }));
}

// --- competitive layer: per-niche stats & leaderboards -----------------------

interface UnsRow {
  profile_id: string;
  niche: string;
  rp: number;
  verified: boolean;
  win: number | null;
  season_delta: number | null;
  metrics: Record<string, string> | null;
}

function mapNicheRow(r: UnsRow): NicheStatRow {
  return {
    profileId: r.profile_id,
    niche: r.niche as NicheStatRow["niche"],
    rp: r.rp ?? 1000,
    verified: r.verified ?? false,
    win: r.win ?? 0,
    delta: r.season_delta ?? 0,
    metrics: r.metrics ?? {},
  };
}

export async function realGetNicheStatsForProfile(profileId: string): Promise<NicheStatRow[]> {
  const supabase = await sb();
  const { data } = await supabase
    .from("user_niche_stats")
    .select("profile_id, niche, rp, verified, win, season_delta, metrics")
    .eq("profile_id", profileId);
  return ((data ?? []) as UnsRow[]).map(mapNicheRow);
}

export async function realGetNicheRp(profileId: string, niche: string): Promise<number | null> {
  const supabase = await sb();
  const { data } = await supabase
    .from("user_niche_stats")
    .select("rp")
    .eq("profile_id", profileId)
    .eq("niche", niche)
    .maybeSingle();
  return data ? ((data as { rp: number }).rp ?? null) : null;
}

export async function realGetNicheLeaderboard(niche: string): Promise<Profile[]> {
  const supabase = await sb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("user_niche_stats")
    .select(`rp, verified, win, season_delta, profile_id, profiles!inner(${PROFILE_SELECT})`)
    .eq("niche", niche)
    .order("rp", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as Array<{
    rp: number;
    verified: boolean;
    win: number | null;
    season_delta: number | null;
    profile_id: string;
    profiles: ProfileRow | ProfileRow[];
  }>;
  return rows
    .filter((r) => !user || r.profile_id !== user.id)
    .map((r) => {
      const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return { ...mapProfile(p), rp: r.rp, verified: r.verified, win: r.win ?? 0, pnl: r.season_delta ?? 0 };
    });
}

/** Top profiles by RP (rankings, right-panel, suggestions). */
export async function realGetTopProfiles(n: number, offset = 0): Promise<Profile[]> {
  const supabase = await sb();
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("rp", { ascending: false })
    .range(offset, offset + Math.max(0, n) - 1);
  return ((data ?? []) as ProfileRow[]).map(mapProfile);
}

// --- global search -----------------------------------------------------------

export async function realSearchAll(
  q: string,
): Promise<{ profiles: Profile[]; posts: Post[]; courses: import("@/types/db").Course[] }> {
  const query = q.trim();
  if (!query) return { profiles: [], posts: [], courses: [] };
  // Sanitize for PostgREST .or() (commas/parens/% are operators there).
  const safe = query.replace(/[%,().]/g, " ").trim();
  if (!safe) return { profiles: [], posts: [], courses: [] };
  const like = `%${safe}%`;
  const supabase = await sb();

  const [profilesRes, postsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .or(`handle.ilike.${like},display_name.ilike.${like},bio.ilike.${like}`)
      .limit(8),
    supabase
      .from("posts")
      .select("*")
      .or(`title.ilike.${like},body.ilike.${like},symbol.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const profiles = ((profilesRes.data ?? []) as ProfileRow[]).map(mapProfile);
  const posts = ((postsRes.data ?? []) as PostRow[]).map((r) => ({
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

  // Course catalog arrives with the content phase; empty until then.
  return { profiles, posts, courses: [] };
}

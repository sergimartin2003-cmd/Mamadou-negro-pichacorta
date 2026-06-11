"use server";

/**
 * Social-core mutations. Every action follows the platform contract:
 * real Supabase write when configured (RPCs from 0003/0005 keep the
 * tallies consistent), graceful demo degradation when not — the UI
 * stays optimistic either way and never renders a dead button.
 */

import { z } from "zod";
import { supabaseConfigured } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

const WRITE_LIMIT = 30;
const WRITE_WINDOW_MS = 60_000;

const idSchema = z.string().trim().min(1).max(64);

export type ActionResult =
  | { ok: true; persisted: boolean }
  | { ok: false; error: string; message: string };

type AuthedClient = Awaited<ReturnType<typeof clientWithUser>>;

async function clientWithUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

async function guard(
  action: string,
  rawId: string,
): Promise<{ ctx: NonNullable<AuthedClient>; id: string } | ActionResult> {
  const parsed = idSchema.safeParse(rawId);
  if (!parsed.success) {
    return { ok: false, error: "validation", message: "Identificador inválido." };
  }

  const ctx = await clientWithUser();
  if (!ctx) {
    return {
      ok: false,
      error: "not_authenticated",
      message: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    };
  }

  const limited = await rateLimit(`${action}:${ctx.user.id}`, {
    limit: WRITE_LIMIT,
    windowMs: WRITE_WINDOW_MS,
  });
  if (!limited.success) {
    return {
      ok: false,
      error: "rate_limited",
      message: "Demasiadas acciones seguidas, espera un momento.",
    };
  }

  return { ctx, id: parsed.data };
}

function failed(message: string): ActionResult {
  return { ok: false, error: "write_failed", message };
}

/** Upvote/downvote a post; repeating the same value clears it (RPC dedupes). */
export async function votePost(postId: string, value: 1 | -1): Promise<ActionResult> {
  if (value !== 1 && value !== -1) {
    return { ok: false, error: "validation", message: "Voto inválido." };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("vote", postId);
  if ("ok" in res) return res;

  const { error } = await res.ctx.supabase.rpc("cast_vote", {
    p_post: res.id,
    p_value: value,
  });
  return error ? failed(error.message) : { ok: true, persisted: true };
}

/** Follow/unfollow a profile; the RPC maintains both counters. */
export async function followProfile(targetId: string): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("follow", targetId);
  if ("ok" in res) return res;

  const { error } = await res.ctx.supabase.rpc("toggle_follow", { p_target: res.id });
  return error ? failed(error.message) : { ok: true, persisted: true };
}

/** Save/unsave a post for the signed-in user. Returns the new state. */
export async function toggleBookmark(
  postId: string,
): Promise<ActionResult & { saved?: boolean }> {
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("bookmark", postId);
  if ("ok" in res) return res;
  const { supabase, user } = res.ctx;

  const { data: existing, error: readError } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("profile_id", user.id)
    .eq("post_id", res.id)
    .maybeSingle();
  if (readError) return failed(readError.message);

  if (existing) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("profile_id", user.id)
      .eq("post_id", res.id);
    return error ? failed(error.message) : { ok: true, persisted: true, saved: false };
  }

  const { error } = await supabase
    .from("bookmarks")
    .insert({ profile_id: user.id, post_id: res.id });
  return error ? failed(error.message) : { ok: true, persisted: true, saved: true };
}

/** Mark every notification for the signed-in user as read. */
export async function markNotificationsRead(): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const ctx = await clientWithUser();
  if (!ctx) {
    return {
      ok: false,
      error: "not_authenticated",
      message: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    };
  }

  const { error } = await ctx.supabase
    .from("notifications")
    .update({ read: true })
    .eq("profile_id", ctx.user.id)
    .eq("read", false);
  return error ? failed(error.message) : { ok: true, persisted: true };
}

/** Enter a competition; the RPC dedupes and bumps participants. */
export async function joinCompetition(competitionId: string): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("join-comp", competitionId);
  if ("ok" in res) return res;

  const { error } = await res.ctx.supabase.rpc("join_competition", { p_comp: res.id });
  return error ? failed(error.message) : { ok: true, persisted: true };
}

/** Self-service enrollment for FREE courses (paid go through Stripe). */
export async function enrollFreeCourse(courseId: string): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("enroll", courseId);
  if ("ok" in res) return res;

  const { error } = await res.ctx.supabase.rpc("enroll_free_course", { p_course: res.id });
  return error ? failed(error.message) : { ok: true, persisted: true };
}

const avatarUrlSchema = z.string().url().max(600);

/** Persist the signed-in user's uploaded avatar URL (Storage path is public). */
export async function saveAvatarUrl(url: string): Promise<ActionResult> {
  const parsed = avatarUrlSchema.safeParse(url);
  if (!parsed.success) {
    return { ok: false, error: "validation", message: "URL de avatar inválida." };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const ctx = await clientWithUser();
  if (!ctx) {
    return { ok: false, error: "not_authenticated", message: "Inicia sesión de nuevo." };
  }
  const { error } = await ctx.supabase
    .from("profiles")
    .update({ avatar_url: parsed.data })
    .eq("id", ctx.user.id);
  return error ? failed(error.message) : { ok: true, persisted: true };
}

const communityNameSchema = z.string().trim().min(2, "El nombre es demasiado corto.").max(60);

/** Create a community (server) with a default #general channel + owner membership. */
export async function createCommunity(
  name: string,
  description?: string,
): Promise<ActionResult & { id?: string }> {
  const parsed = communityNameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: "validation", message: parsed.error.issues[0].message };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const ctx = await clientWithUser();
  if (!ctx) {
    return { ok: false, error: "not_authenticated", message: "Inicia sesión para crear una comunidad." };
  }
  const limited = await rateLimit(`create-community:${ctx.user.id}`, {
    limit: 5,
    windowMs: WRITE_WINDOW_MS,
  });
  if (!limited.success) {
    return { ok: false, error: "rate_limited", message: "Demasiadas comunidades seguidas, espera un momento." };
  }

  const { supabase, user } = ctx;
  const base = parsed.data
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const slug = `${base || "comunidad"}-${Date.now().toString(36).slice(-4)}`;

  const { data, error } = await supabase
    .from("communities")
    .insert({
      slug,
      name: parsed.data,
      description: (description ?? "").trim().slice(0, 200),
      owner_id: user.id,
      color: "var(--brand)",
      icon: "◇",
    })
    .select("id")
    .single();
  if (error || !data) {
    return failed(error?.message ?? "No se pudo crear la comunidad.");
  }

  await supabase.from("channels").insert({ community_id: data.id, name: "general", kind: "text", position: 0 });
  await supabase
    .from("community_members")
    .insert({ community_id: data.id, profile_id: user.id, role: "admin" });

  return { ok: true, persisted: true, id: data.id as string };
}

const bodySchema = z.string().trim().min(1, "Escribe algo.").max(2000);

/** Add a comment (optionally threaded under `parentId`). */
export async function addComment(
  postId: string,
  body: string,
  parentId?: string,
): Promise<ActionResult & { id?: string }> {
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return { ok: false, error: "validation", message: parsedBody.error.issues[0].message };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("comment", postId);
  if ("ok" in res) return res;

  const { data, error } = await res.ctx.supabase
    .from("comments")
    .insert({
      post_id: res.id,
      author_id: res.ctx.user.id,
      parent_id: parentId ?? null,
      body: parsedBody.data,
    })
    .select("id")
    .single();
  return error || !data
    ? failed(error?.message ?? "No se pudo comentar.")
    : { ok: true, persisted: true, id: data.id as string };
}

/** Send a message to a community channel (Realtime delivers it to others). */
export async function sendChannelMessage(
  channelId: string,
  body: string,
): Promise<ActionResult> {
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return { ok: false, error: "validation", message: parsedBody.error.issues[0].message };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("chat", channelId);
  if ("ok" in res) return res;

  const { error } = await res.ctx.supabase.from("channel_messages").insert({
    channel_id: res.id,
    author_id: res.ctx.user.id,
    body: parsedBody.data,
  });
  return error ? failed(error.message) : { ok: true, persisted: true };
}

/** Send a direct message in a thread the caller participates in (RLS). */
export async function sendDm(threadId: string, body: string): Promise<ActionResult> {
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return { ok: false, error: "validation", message: parsedBody.error.issues[0].message };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("dm", threadId);
  if ("ok" in res) return res;

  const { error } = await res.ctx.supabase.from("dm_messages").insert({
    thread_id: res.id,
    author_id: res.ctx.user.id,
    body: parsedBody.data,
  });
  return error ? failed(error.message) : { ok: true, persisted: true };
}

const reportReasonSchema = z.string().trim().min(1).max(300);
const reportTargetSchema = z.enum(["post", "user", "message", "course"]);

/** File a moderation report (queue is reviewed with the service role). */
export async function reportContent(
  targetType: "post" | "user" | "message" | "course",
  targetId: string,
  reason: string,
): Promise<ActionResult> {
  const parsedTarget = reportTargetSchema.safeParse(targetType);
  const parsedReason = reportReasonSchema.safeParse(reason);
  if (!parsedTarget.success || !parsedReason.success) {
    return { ok: false, error: "validation", message: "Reporte inválido." };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("report", targetId);
  if ("ok" in res) return res;

  const { error } = await res.ctx.supabase.from("reports").insert({
    reporter_id: res.ctx.user.id,
    target_type: parsedTarget.data,
    target_id: res.id,
    reason: parsedReason.data,
  });
  return error ? failed(error.message) : { ok: true, persisted: true };
}

/**
 * Record a quiz completion: XP via the award_xp RPC plus daily-streak upsert.
 * XP is capped server-side; full server-side answer grading lands when quiz
 * rows are seeded in Postgres (quiz_questions/quiz_attempts are ready).
 */
export async function recordQuizCompletion(
  pathId: string,
  correctCount: number,
): Promise<ActionResult & { xp?: number }> {
  const correct = Math.max(0, Math.min(10, Math.floor(correctCount)));
  const xp = correct * 10;
  if (!supabaseConfigured()) return { ok: true, persisted: false, xp };

  const res = await guard("quiz", pathId);
  if ("ok" in res) return res;
  const { supabase, user } = res.ctx;

  const { error: xpError } = await supabase.rpc("award_xp", {
    p_amount: xp,
    p_reason: `quiz:${res.id}`,
  });
  if (xpError) return failed(xpError.message);

  const today = new Date().toISOString().slice(0, 10);
  const { data: streak } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("profile_id", user.id)
    .maybeSingle();

  const last = streak?.last_activity_date as string | undefined;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const current = last === today ? (streak?.current_streak ?? 1) : last === yesterday ? (streak?.current_streak ?? 0) + 1 : 1;
  const longest = Math.max(current, streak?.longest_streak ?? 0);

  const { error: streakError } = await supabase.from("user_streaks").upsert({
    profile_id: user.id,
    current_streak: current,
    longest_streak: longest,
    last_activity_date: today,
  });
  return streakError ? failed(streakError.message) : { ok: true, persisted: true, xp };
}

const nicheSchema = z.enum([
  "ecommerce",
  "saas",
  "contenido",
  "trading",
  "inmobiliario",
  "servicios",
  "amazon",
  "dropshipping",
]);
const metricsSchema = z.record(z.string().trim().min(1).max(40), z.string().trim().min(1).max(60));

/**
 * CSV-import verification MVP: persist self-reported metrics for a niche and
 * mark the per-niche row as verified (source 'csv'). OAuth providers
 * (Stripe/ads/broker) plug into the same verified_metrics table later.
 */
export async function verifyNicheMetrics(
  niche: string,
  metrics: Record<string, string>,
): Promise<ActionResult> {
  const parsedNiche = nicheSchema.safeParse(niche);
  const parsedMetrics = metricsSchema.safeParse(metrics);
  if (!parsedNiche.success || !parsedMetrics.success || Object.keys(metrics).length === 0) {
    return { ok: false, error: "validation", message: "Métricas inválidas." };
  }
  if (!supabaseConfigured()) return { ok: true, persisted: false };

  const res = await guard("verify", parsedNiche.data);
  if ("ok" in res) return res;
  const { supabase, user } = res.ctx;

  const { error: vmError } = await supabase.from("verified_metrics").upsert(
    {
      profile_id: user.id,
      niche: parsedNiche.data,
      source: "csv",
      payload: parsedMetrics.data,
      verified: true,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,niche,source" },
  );
  if (vmError) return failed(vmError.message);

  const { error: statsError } = await supabase.from("user_niche_stats").upsert(
    {
      profile_id: user.id,
      niche: parsedNiche.data,
      verified: true,
      metrics: parsedMetrics.data,
    },
    { onConflict: "profile_id,niche" },
  );
  return statsError ? failed(statsError.message) : { ok: true, persisted: true };
}

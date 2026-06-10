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

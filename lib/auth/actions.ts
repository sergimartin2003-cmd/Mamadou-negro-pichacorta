"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";
import {
  onboardingSchema,
  requestResetSchema,
  signInSchema,
  signUpSchema,
  type ConnectionProvider,
  type MarketLabel,
  type OAuthProvider,
} from "./schemas";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string };

const NOT_CONFIGURED: ActionResult<never> = {
  ok: false,
  error: "auth_not_configured",
  message: "Authentication is not configured in this environment.",
};

const MARKET_ENUM: Record<MarketLabel, string> = {
  Crypto: "crypto",
  Forex: "forex",
  Futures: "futures",
  Stocks: "stocks",
};

const PERSISTED_CONNECTIONS: ReadonlySet<ConnectionProvider> = new Set([
  "tradingview",
  "broker",
  "propfirm",
  "exchange",
  "csv",
]);

const AUTH_RATE_LIMIT = 5;
const AUTH_RATE_WINDOW_MS = 60_000;

function failure(error: string, message: string): ActionResult<never> {
  return { ok: false, error, message };
}

async function requestOrigin(): Promise<string> {
  const header = await headers();
  const origin = header.get("origin");
  if (origin) return origin;
  const host = header.get("host") ?? "localhost:3000";
  const proto = header.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

async function clientIp(): Promise<string> {
  const header = await headers();
  const forwarded = header.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

async function guardAuthAttempt(scope: string, email: string): Promise<boolean> {
  const ip = await clientIp();
  const { success } = await rateLimit(`${scope}:${ip}:${email.toLowerCase()}`, {
    limit: AUTH_RATE_LIMIT,
    windowMs: AUTH_RATE_WINDOW_MS,
  });
  return success;
}

const RATE_LIMITED = failure("rate_limited", "Too many attempts, try again shortly.");

export async function signIn(input: unknown): Promise<ActionResult> {
  if (!supabaseConfigured()) return NOT_CONFIGURED;

  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return failure("validation", parsed.error.issues[0]?.message ?? "Invalid credentials.");
  }

  if (!(await guardAuthAttempt("sign_in", parsed.data.email))) return RATE_LIMITED;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    console.error("signIn failed:", error.message);
    return failure("sign_in_failed", "Invalid email or password.");
  }

  return { ok: true, data: undefined };
}

export async function signUp(input: unknown): Promise<ActionResult> {
  if (!supabaseConfigured()) return NOT_CONFIGURED;

  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return failure("validation", parsed.error.issues[0]?.message ?? "Invalid details.");
  }

  if (!(await guardAuthAttempt("sign_up", parsed.data.email))) return RATE_LIMITED;

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { handle: parsed.data.handle, display_name: parsed.data.handle },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    console.error("signUp failed:", error.message);
    return failure("sign_up_failed", "Could not complete sign up.");
  }

  return { ok: true, data: undefined };
}

export async function startOAuth(provider: OAuthProvider): Promise<ActionResult<string>> {
  if (!supabaseConfigured()) return NOT_CONFIGURED;

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) {
    return failure("oauth_failed", error?.message ?? "Could not start sign-in.");
  }

  return { ok: true, data: data.url };
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  if (!supabaseConfigured()) return NOT_CONFIGURED;

  const parsed = requestResetSchema.safeParse(input);
  if (!parsed.success) {
    return failure("validation", parsed.error.issues[0]?.message ?? "Invalid email.");
  }

  if (!(await guardAuthAttempt("reset", parsed.data.email))) return RATE_LIMITED;

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback`,
  });
  // Do not reveal whether the email exists: always return the same message.
  if (error) console.error("requestPasswordReset failed:", error.message);

  return { ok: true, data: undefined };
}

export async function signOut(): Promise<ActionResult> {
  if (!supabaseConfigured()) return NOT_CONFIGURED;

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return failure("sign_out_failed", error.message);

  return { ok: true, data: undefined };
}

export async function completeOnboarding(input: unknown): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, data: undefined };

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return failure("validation", parsed.error.issues[0]?.message ?? "Invalid onboarding data.");
  }

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    return failure("not_authenticated", "Your session has expired. Please sign in again.");
  }

  const { displayName, username, country, market, connection } = parsed.data;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      handle: username,
      country: country.toUpperCase(),
      market: MARKET_ENUM[market],
    })
    .eq("id", auth.user.id);
  if (profileError) return failure("profile_update_failed", profileError.message);

  if (connection && PERSISTED_CONNECTIONS.has(connection)) {
    const { error: connectionError } = await supabase.from("broker_connections").insert({
      profile_id: auth.user.id,
      provider: connection,
      status: "pending",
    });
    if (connectionError) return failure("connection_failed", connectionError.message);
  }

  return { ok: true, data: undefined };
}

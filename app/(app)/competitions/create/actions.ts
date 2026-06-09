"use server";

import { z } from "zod";
import { supabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

const COMPETITION_KINDS = ["Seasonal", "48h Battle", "Friends"] as const;
const COMPETITION_MARKETS = ["Crypto", "Forex", "Futures", "Stocks", "All"] as const;

const KIND_ENUM: Record<(typeof COMPETITION_KINDS)[number], string> = {
  Seasonal: "seasonal",
  "48h Battle": "battle",
  Friends: "friends",
};

// `All` is not a market_type enum value; competitions.market is nullable.
const MARKET_ENUM: Record<(typeof COMPETITION_MARKETS)[number], string | null> = {
  Crypto: "crypto",
  Forex: "forex",
  Futures: "futures",
  Stocks: "stocks",
  All: null,
};

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const COMPETITION_METRICS = [
  "Risk-adjusted return",
  "Net R multiple",
  "Profit factor",
  "Lowest drawdown",
  "Win rate",
] as const;
const COMPETITION_RULES = [
  "Max 3% risk/trade · verified only",
  "Intraday only · min 10 trades",
  "Invite-only",
  "Open registration",
] as const;

const DURATION_MIN = 1;
const DURATION_MAX = 90;
const NAME_MIN = 3;
const NAME_MAX = 60;

export const createCompetitionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN, `Name must be at least ${NAME_MIN} characters.`)
    .max(NAME_MAX, `Name must be ${NAME_MAX} characters or fewer.`),
  kind: z.enum(COMPETITION_KINDS),
  market: z.enum(COMPETITION_MARKETS),
  metric: z.enum(COMPETITION_METRICS),
  rule: z.enum(COMPETITION_RULES),
  duration: z
    .number()
    .int()
    .min(DURATION_MIN, `Duration must be at least ${DURATION_MIN} day.`)
    .max(DURATION_MAX, `Duration must be at most ${DURATION_MAX} days.`),
});

export type CreateCompetitionInput = z.infer<typeof createCompetitionSchema>;

export type CreateCompetitionResult =
  | { ok: true; persisted: boolean; id?: string }
  | { ok: false; error: string; message: string };

export async function createCompetition(
  input: unknown,
): Promise<CreateCompetitionResult> {
  const parsed = createCompetitionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: parsed.error.issues[0]?.message ?? "Invalid competition data.",
    };
  }

  if (!supabaseConfigured()) {
    return { ok: true, persisted: false };
  }

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    return {
      ok: false,
      error: "not_authenticated",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const limited = await rateLimit(`create-competition:${auth.user.id}`, {
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!limited.success) {
    return {
      ok: false,
      error: "rate_limited",
      message: "Too many attempts, try again shortly.",
    };
  }

  const { data, error } = await supabase.rpc("create_competition", {
    p_name: parsed.data.name,
    p_kind: KIND_ENUM[parsed.data.kind],
    p_market: MARKET_ENUM[parsed.data.market],
    p_metric: parsed.data.metric,
    p_rule: parsed.data.rule,
    p_prize: "",
    p_duration_days: parsed.data.duration,
  });

  if (error) {
    return { ok: false, error: "insert_failed", message: error.message };
  }

  return { ok: true, persisted: true, id: data as string | undefined };
}

import type { PlanTier } from "@/types/db";
import { supabaseConfigured } from "@/lib/env";

const PLAN_RANK: Record<PlanTier, number> = { free: 0, pro: 1, elite: 2 };

/**
 * Resolve the signed-in user's plan tier server-side.
 *
 * - Real mode: reads the subscriptions row maintained by the Stripe
 *   webhook; unauthenticated or missing rows resolve to "free".
 * - Demo mode (no Supabase keys): resolves to "elite" so the showcase
 *   renders every surface — gates become real the moment keys exist.
 */
export async function getPlanTier(): Promise<PlanTier> {
  if (!supabaseConfigured()) return "elite";

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "free";

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!data) return "free";

  // Lapsed subscriptions fall back to free regardless of stored plan.
  const active =
    (data.status === "active" || data.status === "trialing") &&
    (!data.current_period_end || new Date(data.current_period_end) > new Date());
  return active ? ((data.plan as PlanTier) ?? "free") : "free";
}

/** True when `plan` satisfies the `required` tier (free < pro < elite). */
export function planAtLeast(plan: PlanTier, required: PlanTier): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[required];
}

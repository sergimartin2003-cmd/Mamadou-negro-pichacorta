import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env, supabaseConfigured } from "@/lib/env";

/**
 * Stripe Customer Portal — lets a subscriber manage/cancel their plan.
 * Resolves the customer id from the subscriptions table (written by the
 * webhook); degrades with explicit statuses when not configured.
 */
export async function POST(): Promise<NextResponse> {
  const stripeKey = env.stripeSecretKey();
  if (!stripeKey) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (subError) {
    return NextResponse.json({ error: "subscription_lookup_failed" }, { status: 500 });
  }
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${env.appUrl()}/settings`,
  });

  return NextResponse.json({ url: session.url });
}

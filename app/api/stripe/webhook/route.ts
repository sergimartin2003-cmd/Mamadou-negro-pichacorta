import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import type { PlanTier } from "@/types/db";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

/** Map a Stripe price id back to our plan tier via env configuration. */
function planFromPriceId(priceId: string | undefined): PlanTier | null {
  if (!priceId) return null;
  if (priceId === process.env["STRIPE_PRICE_PRO"]) return "pro";
  if (priceId === process.env["STRIPE_PRICE_ELITE"]) return "elite";
  return null;
}

/**
 * Resolve the current period end as ISO. Stripe moved this field between the
 * subscription and its items across API versions, so read both defensively.
 */
function periodEndIso(sub: import("stripe").Stripe.Subscription): string | null {
  const loose = sub as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const unix = loose.current_period_end ?? loose.items?.data?.[0]?.current_period_end;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = env.stripeWebhookSecret();
  const serviceRoleKey = env.supabaseServiceRoleKey();
  const supabaseUrl = env.supabaseUrl();
  // Missing required config means we cannot verify or persist: fail so Stripe retries.
  if (!webhookSecret || !serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const stripeKey = env.stripeSecretKey();
  if (!stripeKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Idempotency: record the event id first; a duplicate insert means we already handled it.
  const { error: dedupeError } = await supabase.from("stripe_events").insert({ id: event.id });
  if (dedupeError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.["user_id"];

    // Course purchase → enrollment (the DB trigger bumps students_count and
    // creates the instructor payout at the course's payout_rate).
    if (session.metadata?.["kind"] === "course") {
      const courseId = session.metadata?.["course_id"];
      const price = Number(session.metadata?.["price"] ?? 0);
      if (userId && courseId) {
        await supabase
          .from("course_enrollments")
          .upsert(
            { profile_id: userId, course_id: courseId, price_paid: price },
            { onConflict: "profile_id,course_id", ignoreDuplicates: true },
          );
      }
      return NextResponse.json({ received: true });
    }

    // Subscription purchase → plan activation.
    const customerId = typeof session.customer === "string" ? session.customer : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;
    const plan = (session.metadata?.["plan"] as PlanTier | undefined) ?? "pro";

    // subscriptions PK is profile_id; never write columns that don't exist.
    if (userId && customerId && subscriptionId) {
      await supabase.from("subscriptions").upsert(
        {
          profile_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: "active",
        },
        { onConflict: "profile_id" },
      );
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as import("stripe").Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : null;
    if (customerId) {
      const plan = planFromPriceId(sub.items.data[0]?.price?.id);
      await supabase
        .from("subscriptions")
        .update({
          status: sub.status,
          current_period_end: periodEndIso(sub),
          // Only overwrite plan when the price maps to a known tier.
          ...(plan ? { plan } : {}),
        })
        .eq("stripe_customer_id", customerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as import("stripe").Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : null;
    if (customerId) {
      await supabase
        .from("subscriptions")
        .update({ status: sub.status, plan: "free" })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

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
  const { error: dedupeError } = await supabase
    .from("stripe_events")
    .insert({ id: event.id });
  if (dedupeError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").Stripe.Checkout.Session;
    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;
    const userId = session.client_reference_id ?? session.metadata?.["user_id"];

    if (userId && customerId && subscriptionId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: "active",
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as import("stripe").Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : null;
    if (customerId) {
      await supabase
        .from("subscriptions")
        .update({
          status: sub.status,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}

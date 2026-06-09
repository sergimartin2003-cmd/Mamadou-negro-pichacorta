import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env, supabaseConfigured } from "@/lib/env";

type PaidPlan = "pro" | "elite";

function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "pro" || value === "elite";
}

function getPriceId(plan: PaidPlan): string | null {
  if (plan === "pro") return process.env["STRIPE_PRICE_PRO"] ?? null;
  return process.env["STRIPE_PRICE_ELITE"] ?? null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const stripeKey = env.stripeSecretKey();
  if (!stripeKey) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
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

  const body = (await req.json()) as { plan?: unknown };
  const plan = body.plan;

  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const priceId = getPriceId(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing env var STRIPE_PRICE_${plan.toUpperCase()}` },
      { status: 500 },
    );
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);
  const appUrl = env.appUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?upgraded=1`,
    cancel_url: `${appUrl}/premium`,
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: { user_id: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}

import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import type { PlanTier } from "@/types/db";

function getPriceId(plan: PlanTier): string | null {
  if (plan === "pro") return process.env["STRIPE_PRICE_PRO"] ?? null;
  if (plan === "elite") return process.env["STRIPE_PRICE_ELITE"] ?? null;
  return null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const stripeKey = env.stripeSecretKey();
  if (!stripeKey) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { plan?: string };
  const plan = body.plan as PlanTier | undefined;

  if (!plan || plan === "free") {
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
  });

  return NextResponse.json({ url: session.url });
}

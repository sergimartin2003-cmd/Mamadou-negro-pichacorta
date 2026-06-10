import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env, supabaseConfigured } from "@/lib/env";

/**
 * One-time Stripe Checkout for a marketplace course. The price is read
 * server-side from the courses table (never trusted from the client); the
 * webhook turns the completed session into an enrollment, and the DB trigger
 * creates the instructor payout.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const body = (await req.json()) as { courseId?: unknown };
  if (typeof body.courseId !== "string" || body.courseId.length === 0) {
    return NextResponse.json({ error: "invalid_course" }, { status: 400 });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title, price, status")
    .eq("id", body.courseId)
    .eq("status", "publicado")
    .maybeSingle();
  if (courseError || !course) {
    return NextResponse.json({ error: "course_not_found" }, { status: 404 });
  }
  if (Number(course.price) <= 0) {
    return NextResponse.json({ error: "course_is_free" }, { status: 400 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);
  const appUrl = env.appUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(Number(course.price) * 100),
          product_data: { name: course.title },
        },
      },
    ],
    success_url: `${appUrl}/marketplace/${course.slug}?enrolled=1`,
    cancel_url: `${appUrl}/marketplace/${course.slug}`,
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: {
      kind: "course",
      user_id: user.id,
      course_id: course.id,
      price: String(course.price),
    },
  });

  return NextResponse.json({ url: session.url });
}

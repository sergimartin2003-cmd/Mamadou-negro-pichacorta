import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { env, supabaseConfigured } from "@/lib/env";

const PROTECTED_PREFIXES = [
  "/feed",
  "/profile",
  "/u",
  "/rankings",
  "/retos",
  "/communities",
  "/messages",
  "/notifications",
  "/academy",
  "/premium",
  "/settings",
  "/create",
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function hasSession(request: NextRequest): Promise<boolean> {
  const url = env.supabaseUrl();
  const anonKey = env.supabaseAnonKey();
  if (!url || !anonKey) return false;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Read-only: cookie refresh is owned by updateSession below.
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = await updateSession(request);

  if (!supabaseConfigured()) {
    return response;
  }

  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return response;
  }

  if (await hasSession(request)) {
    return response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|signup|forgot|auth|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

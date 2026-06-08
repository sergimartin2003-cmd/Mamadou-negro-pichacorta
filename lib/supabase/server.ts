import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

type CookiesToSet = Parameters<SetAllCookies>[0];

export async function createClient() {
  const url = env.supabaseUrl();
  const anonKey = env.supabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll is called from Server Components where mutating cookies is
          // not allowed; middleware refreshes the session so this is safe to ignore.
        }
      },
    },
  });
}

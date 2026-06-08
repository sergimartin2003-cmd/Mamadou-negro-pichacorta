"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { env, posthogConfigured } from "@/lib/env";

function initPostHog(): void {
  if (!posthogConfigured()) return;

  const key = env.posthogKey();
  if (!key) return;

  void import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) return;
    posthog.init(key, {
      api_host: env.posthogHost() ?? "https://us.i.posthog.com",
      capture_pageview: true,
      person_profiles: "identified_only",
    });
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    initPostHog();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

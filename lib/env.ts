function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  supabaseUrl: () => read("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => read("SUPABASE_SERVICE_ROLE_KEY"),
  posthogKey: () => read("NEXT_PUBLIC_POSTHOG_KEY"),
  posthogHost: () => read("NEXT_PUBLIC_POSTHOG_HOST"),
  stripeSecretKey: () => read("STRIPE_SECRET_KEY"),
  stripePublishableKey: () => read("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  stripeWebhookSecret: () => read("STRIPE_WEBHOOK_SECRET"),
  appUrl: () => read("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
} as const;

export function supabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl() && env.supabaseAnonKey());
}

export function posthogConfigured(): boolean {
  return Boolean(env.posthogKey());
}

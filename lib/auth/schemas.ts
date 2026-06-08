import { z } from "zod";

export const MARKETS = ["Crypto", "Forex", "Futures", "Stocks"] as const;
export type MarketLabel = (typeof MARKETS)[number];

export const OAUTH_PROVIDERS = ["google", "apple", "discord", "twitter"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export const CONNECTION_PROVIDERS = [
  "tradingview",
  "broker",
  "propfirm",
  "exchange",
  "csv",
  "manual",
] as const;
export type ConnectionProvider = (typeof CONNECTION_PROVIDERS)[number];

const HANDLE_MIN = 3;
const HANDLE_MAX = 20;
const PASSWORD_MIN = 8;
const DISPLAY_NAME_MAX = 40;

const handleField = z
  .string()
  .trim()
  .min(HANDLE_MIN, `Username must be at least ${HANDLE_MIN} characters.`)
  .max(HANDLE_MAX, `Username must be ${HANDLE_MAX} characters or fewer.`)
  .regex(/^[a-z0-9_]+$/i, "Use letters, numbers and underscores only.");

const emailField = z.string().trim().email("Enter a valid email address.");

const passwordField = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters.`);

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  handle: handleField,
  email: emailField,
  password: passwordField,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const requestResetSchema = z.object({
  email: emailField,
});
export type RequestResetInput = z.infer<typeof requestResetSchema>;

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1, "Add a display name.").max(DISPLAY_NAME_MAX),
  username: handleField,
  country: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code.")
    .regex(/^[a-z]{2}$/i, "Use a 2-letter country code."),
  market: z.enum(MARKETS),
  connection: z.enum(CONNECTION_PROVIDERS).nullable(),
  communities: z.array(z.string()),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= PASSWORD_MIN, label: `${PASSWORD_MIN}+ characters` },
  { test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v), label: "Upper & lower case" },
  { test: (v: string) => /\d/.test(v), label: "A number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "A symbol" },
] as const;

export interface PasswordStrength {
  score: number;
  rules: ReadonlyArray<{ label: string; met: boolean }>;
}

export function scorePassword(value: string): PasswordStrength {
  const rules = PASSWORD_RULES.map((rule) => ({ label: rule.label, met: rule.test(value) }));
  return { score: rules.filter((rule) => rule.met).length, rules };
}

import type { ConnectionProvider, MarketLabel } from "@/lib/auth/schemas";

export interface OnboardingState {
  displayName: string;
  username: string;
  country: string;
  market: MarketLabel;
  connection: ConnectionProvider | null;
  communities: string[];
}

export interface ConnectionOption {
  key: ConnectionProvider;
  name: string;
  desc: string;
  glyph: string;
  accent: string;
  verified: boolean;
}

export const CONNECTION_OPTIONS: readonly ConnectionOption[] = [
  { key: "tradingview", name: "TradingView", desc: "Sync alerts, ideas & paper results.", glyph: "TV", accent: "#56A8FF", verified: true },
  { key: "broker", name: "Broker", desc: "Auto-import fills from your live broker.", glyph: "BK", accent: "#16C784", verified: true },
  { key: "propfirm", name: "Prop firm", desc: "Link your funded challenge account.", glyph: "PF", accent: "#9B5CFF", verified: true },
  { key: "exchange", name: "Crypto exchange", desc: "Read-only API for on-chain & CEX trades.", glyph: "EX", accent: "#F2B33D", verified: true },
  { key: "csv", name: "CSV import", desc: "Upload a statement to backfill history.", glyph: "::", accent: "#46D6C8", verified: false },
  { key: "manual", name: "Manual journal", desc: "Log trades by hand. Stays unverified.", glyph: "✎", accent: "#6C7888", verified: false },
] as const;

export const STEP_COUNT = 5;

export const STEP_TITLES: readonly string[] = [
  "Welcome",
  "Identity",
  "Connect",
  "Communities",
  "All set",
] as const;

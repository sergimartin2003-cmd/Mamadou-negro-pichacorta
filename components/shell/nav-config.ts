import type { IconName } from "@/components/ui";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
}

/** Primary navigation, ported from the prototype `NAV` but pointing at routes. */
export const NAV: readonly NavItem[] = [
  { href: "/feed", label: "Home", icon: "home" },
  { href: "/communities", label: "Communities", icon: "compass" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/competitions", label: "Competitions", icon: "swords" },
  { href: "/games", label: "Arcade", icon: "play" },
  { href: "/learning", label: "Learning", icon: "book" },
  { href: "/messages", label: "Messages", icon: "chat", badge: 2 },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

/** Condensed tab bar shown below 1024px. The center create action is rendered separately. */
export const MOBILE_NAV: readonly NavItem[] = [
  { href: "/feed", label: "Feed", icon: "home" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/competitions", label: "Compete", icon: "swords" },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

export const MARKETS = ["Crypto", "Forex", "Futures", "Stocks"] as const;

export const ROUTE_TITLES: Readonly<Record<string, string>> = {
  "/feed": "Home",
  "/communities": "Communities",
  "/rankings": "Rankings",
  "/competitions": "Competitions",
  "/games": "Arcade",
  "/learning": "Learning Hub",
  "/messages": "Messages",
  "/profile": "Profile",
  "/settings": "Settings",
  "/premium": "TradeHub Pro",
  "/create": "New Post",
};

/** True when `pathname` is within the section rooted at `href`. */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleForPath(pathname: string): string {
  const entry = Object.entries(ROUTE_TITLES).find(
    ([href]) => pathname === href || pathname.startsWith(`${href}/`),
  );
  return entry?.[1] ?? "TradeHub";
}

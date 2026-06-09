import type { IconName } from "@/components/ui";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
}

/** Primary navigation, ported from the prototype `NAV` but pointing at routes. */
export const NAV: readonly NavItem[] = [
  { href: "/feed", label: "Inicio", icon: "home" },
  { href: "/communities", label: "Nichos", icon: "compass" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/competitions", label: "Retos", icon: "swords" },
  { href: "/learning", label: "Academia", icon: "book" },
  { href: "/messages", label: "Mensajes", icon: "chat", badge: 2 },
  { href: "/profile", label: "Perfil", icon: "user" },
] as const;

/** Condensed tab bar shown below 1024px. The center create action is rendered separately. */
export const MOBILE_NAV: readonly NavItem[] = [
  { href: "/feed", label: "Inicio", icon: "home" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/competitions", label: "Retos", icon: "swords" },
  { href: "/profile", label: "Perfil", icon: "user" },
] as const;

export const MARKETS = ["Crypto", "Forex", "Futures", "Stocks"] as const;

export const ROUTE_TITLES: Readonly<Record<string, string>> = {
  "/feed": "Inicio",
  "/communities": "Nichos",
  "/rankings": "Rankings de Emprendedores",
  "/competitions": "Retos",
  "/learning": "Academia",
  "/messages": "Mensajes",
  "/profile": "Mi Perfil",
  "/settings": "Configuración",
  "/premium": "EmprendeHub Pro",
  "/create": "Nuevo Post",
};

/** True when `pathname` is within the section rooted at `href`. */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleForPath(pathname: string): string {
  const entry = Object.entries(ROUTE_TITLES).find(
    ([href]) => pathname === href || pathname.startsWith(`${href}/`),
  );
  return entry?.[1] ?? "EmprendeHub";
}

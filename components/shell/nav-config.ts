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
  { href: "/nichos", label: "Nichos", icon: "compass" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/retos", label: "Retos", icon: "swords" },
  { href: "/academy", label: "Academia", icon: "book" },
  { href: "/marketplace", label: "Cursos", icon: "play" },
  { href: "/startup", label: "Startup", icon: "briefcase" },
  { href: "/store", label: "Tienda", icon: "bag" },
  { href: "/portfolio", label: "Cartera", icon: "pie" },
  { href: "/research", label: "Análisis", icon: "search" },
  { href: "/dropshipping", label: "Dropshipping", icon: "box" },
  { href: "/tasks", label: "Tareas", icon: "board" },
  { href: "/games", label: "Arcade", icon: "bolt" },
  { href: "/challenges", label: "Desafíos", icon: "target" },
  { href: "/leagues", label: "Ligas", icon: "shield" },
  { href: "/tilt", label: "Tilt-Meter", icon: "flame" },
  { href: "/messages", label: "Mensajes", icon: "chat", badge: 2 },
  { href: "/profile", label: "Perfil", icon: "user" },
] as const;

/** Condensed tab bar shown below 1024px. The center create action is rendered separately. */
export const MOBILE_NAV: readonly NavItem[] = [
  { href: "/feed", label: "Inicio", icon: "home" },
  { href: "/rankings", label: "Rankings", icon: "trophy" },
  { href: "/marketplace", label: "Cursos", icon: "play" },
  { href: "/profile", label: "Perfil", icon: "user" },
] as const;

export const MARKETS = ["Crypto", "Forex", "Futures", "Stocks"] as const;

export const ROUTE_TITLES: Readonly<Record<string, string>> = {
  "/feed": "Inicio",
  "/nichos": "Nichos",
  "/communities": "Comunidad",
  "/rankings": "Rankings de Emprendedores",
  "/retos": "Retos",
  "/academy": "Academia",
  "/marketplace": "Marketplace de Cursos",
  "/messages": "Mensajes",
  "/profile": "Mi Perfil",
  "/settings": "Configuración",
  "/premium": "EmprendeHub Pro",
  "/create": "Nuevo Post",
  "/teach": "Panel de instructor",
  "/startup": "Startup Dashboard",
  "/store": "Store Builder",
  "/portfolio": "Portfolio Tracker",
  "/research": "Investment Research Hub",
  "/dropshipping": "Dropshipping Dashboard",
  "/tasks": "Tareas & Proyectos",
  "/games": "Arcade",
  "/challenges": "Desafíos",
  "/leagues": "Ligas",
  "/tilt": "Tilt-Meter",
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

import type { NicheModule } from "@/lib/niches/types";

/** Servicios & freelance — ranked por ingresos y eficiencia verificada. */
export const servicios: NicheModule = {
  slug: "servicios",
  name: "Servicios & Freelance",
  tagline: "Tu expertise, tu tarifa, tu libertad.",
  color: "var(--niche-servicios)",
  glyph: "💼",
  copy: {
    member: "freelance",
    postAction: "Ver sistema",
    composer: "Comparte un revenue update, una captación, una subida de tarifas…",
    feedEmpty: "Aún no hay casos de servicios. Cuenta cómo escalas.",
    curveLabel: "Curva de ingresos verificada",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["agencia", "consultoria", "coaching", "outreach", "tarifas", "productizar", "retainer", "cliente"],
  postStatFields: [
    { key: "income", label: "Ingresos" },
    { key: "clients", label: "Clientes" },
    { key: "ticket", label: "Ticket" },
    { key: "retention", label: "Retención" },
  ],
  profileMetrics: [
    { key: "income", label: "Ingresos/mes", accent: "var(--profit)" },
    { key: "clients", label: "Clientes activos" },
    { key: "ticket", label: "Ticket medio" },
    { key: "retention", label: "Retención", suffix: "%" },
  ],
  verification: {
    method: "stripe-analytics",
    connectLabel: "Conectar facturación",
    description: "Verifica ingresos conectando tu facturación o pasarela (solo lectura).",
    mvp: "Importar CSV de facturas",
    safety: "Solo lectura. Nombres de clientes anonimizados por defecto.",
  },
  competitions: [
    { id: "revenue-per-hour", name: "Revenue per Hour", metric: "Mayor ingreso por hora trabajada", basis: "verified-delta" },
    { id: "mejor-captacion", name: "Mejor Captación", metric: "Sistema de captación votado", basis: "votes" },
  ],
  learning: [
    { id: "captar", name: "Captar clientes", blurb: "Outreach, referidos y contenido." },
    { id: "tarifas", name: "Subir tarifas", blurb: "Posicionamiento y propuesta de valor." },
    { id: "productizar", name: "Productizar el servicio", blurb: "De custom a oferta estándar." },
  ],
  communitiesSeed: [
    { name: "Agency Owners", desc: "Clientes, equipo y operaciones." },
    { name: "Freelance Pro", desc: "Tarifas, scope y sistemas." },
  ],
};

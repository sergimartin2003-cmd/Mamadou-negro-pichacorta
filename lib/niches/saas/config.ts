import type { NicheModule } from "@/lib/niches/types";

/** SaaS & negocios digitales — build in public, ranked por MRR verificado. */
export const saas: NicheModule = {
  slug: "saas",
  name: "SaaS & Digital",
  tagline: "Build in public. Grow in public.",
  color: "var(--niche-saas)",
  glyph: "💻",
  copy: {
    member: "fundador",
    postAction: "Ver build",
    composer: "Comparte un MRR update, un lanzamiento, un análisis de churn…",
    feedEmpty: "Aún no hay updates de SaaS. Ship algo y cuéntalo.",
    curveLabel: "Curva de MRR verificada",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["saas", "mrr", "churn", "lanzamiento", "producthunt", "seo", "cold-email", "milestone"],
  postStatFields: [
    { key: "mrr", label: "MRR" },
    { key: "growth", label: "Crecimiento" },
    { key: "churn", label: "Churn" },
    { key: "users", label: "Usuarios" },
  ],
  profileMetrics: [
    { key: "mrr", label: "MRR", accent: "var(--profit)" },
    { key: "churn", label: "Churn", suffix: "%", accent: "var(--loss)" },
    { key: "users", label: "Usuarios activos" },
    { key: "ltv", label: "LTV" },
  ],
  verification: {
    method: "stripe-analytics",
    connectLabel: "Conectar Stripe",
    description: "Lee tu MRR y churn desde Stripe (solo lectura).",
    mvp: "Importar CSV de métricas",
    safety: "Solo lectura. No cobramos a tus clientes ni movemos dinero.",
  },
  competitions: [
    { id: "mrr-challenge", name: "MRR Challenge", metric: "Mayor crecimiento de MRR en 60 días", basis: "verified-delta" },
    { id: "launch-ph", name: "Lanzamiento del mes", metric: "Mejor lanzamiento verificado", basis: "votes" },
  ],
  learning: [
    { id: "validar", name: "Validar una idea", blurb: "Encuentra un problema real que merezca la pena." },
    { id: "mvp", name: "Construir el MVP", blurb: "Ship lo mínimo que demuestre valor." },
    { id: "primer-1k", name: "De 0 a $1K MRR", blurb: "Primeros clientes de pago y retención." },
    { id: "churn", name: "Reducir el churn", blurb: "Por qué se van los usuarios y cómo evitarlo." },
  ],
  communitiesSeed: [
    { name: "Indie SaaS", desc: "Bootstrapped, build in public." },
    { name: "Product Hunt Club", desc: "Lanzamientos, AppSumo y tracción." },
  ],
};

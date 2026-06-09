import type { NicheModule } from "@/lib/niches/types";

/** Contenido & creator economy — ranked por audiencia e ingresos verificados. */
export const contenido: NicheModule = {
  slug: "contenido",
  name: "Creadores",
  tagline: "Audiencia primero, monetización después.",
  color: "var(--niche-contenido)",
  glyph: "🎬",
  copy: {
    member: "creador",
    postAction: "Ver report",
    composer: "Comparte un report mensual, un vídeo viral, tu mix de ingresos…",
    feedEmpty: "Aún no hay reports de creadores. Enseña tus datos.",
    curveLabel: "Curva de ingresos verificada",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["youtube", "tiktok", "newsletter", "sponsor", "viral", "adsense", "membresia", "formato"],
  postStatFields: [
    { key: "income", label: "Ingresos" },
    { key: "subs", label: "Subs" },
    { key: "views", label: "Vistas" },
    { key: "rpm", label: "RPM" },
  ],
  profileMetrics: [
    { key: "income", label: "Ingresos/mes", accent: "var(--profit)" },
    { key: "subs", label: "Suscriptores" },
    { key: "views", label: "Vistas/mes" },
    { key: "rpm", label: "RPM medio" },
  ],
  verification: {
    method: "stripe-analytics",
    connectLabel: "Conectar analytics",
    description: "Lee vistas e ingresos desde tus plataformas (solo lectura).",
    mvp: "Importar CSV / captura de AdSense",
    safety: "Solo lectura de tus métricas públicas y de ingresos.",
  },
  competitions: [
    { id: "reto-viral", name: "Reto Viral", metric: "Mayor crecimiento de audiencia en 30 días", basis: "verified-delta" },
    { id: "mejor-monetizacion", name: "Mejor Monetización", metric: "Ingreso por 1k vistas", basis: "verified-delta" },
  ],
  learning: [
    { id: "audiencia", name: "Crecer la audiencia", blurb: "Hooks, formatos y consistencia." },
    { id: "monetizar", name: "Monetizar de verdad", blurb: "AdSense, sponsors y producto propio." },
    { id: "sponsors", name: "Cerrar sponsors", blurb: "Cómo conseguirlos y cuánto cobrar." },
  ],
  communitiesSeed: [
    { name: "Creator Lab", desc: "Edición, retención y algoritmo." },
    { name: "Newsletter Club", desc: "Listas, conversión y producto." },
  ],
};

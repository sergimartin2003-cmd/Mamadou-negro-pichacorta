import type { NicheModule } from "@/lib/niches/types";

/** Inmobiliario — inversores, ranked por cartera y rentabilidad verificada. */
export const inmobiliario: NicheModule = {
  slug: "inmobiliario",
  name: "Real Estate",
  tagline: "El ladrillo también tiene métricas.",
  color: "var(--niche-inmobiliario)",
  glyph: "🏠",
  copy: {
    member: "inversor",
    postAction: "Analizar deal",
    composer: "Comparte una adquisición, una rentabilidad real, un flip…",
    feedEmpty: "Aún no hay operaciones. Publica un deal con sus números.",
    curveLabel: "Curva de cartera verificada",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["alquiler", "flip", "turistico", "local", "reforma", "zona", "fiscalidad", "financiacion"],
  postStatFields: [
    { key: "type", label: "Tipo" },
    { key: "strategy", label: "Estrategia" },
    { key: "yield", label: "Rentab." },
    { key: "cashflow", label: "Cashflow" },
  ],
  profileMetrics: [
    { key: "units", label: "Inmuebles" },
    { key: "netYield", label: "Rentab. neta", suffix: "%", accent: "var(--profit)" },
    { key: "cashflow", label: "Cashflow/mes", accent: "var(--profit)" },
    { key: "occupancy", label: "Ocupación", suffix: "%" },
  ],
  verification: {
    method: "documents",
    connectLabel: "Subir prueba",
    description: "Verifica con escrituras, contratos de alquiler o un CSV de cartera.",
    mvp: "Subida de documentos / CSV",
    safety: "Ubicaciones a nivel zona; direcciones exactas privadas por defecto.",
  },
  competitions: [
    { id: "reto-rentabilidad", name: "Reto Rentabilidad", metric: "Mejor ROI sobre activo adquirido", basis: "verified-delta" },
    { id: "mejor-flip", name: "Mejor Flip", metric: "Beneficio neto del flip", basis: "verified-delta" },
  ],
  learning: [
    { id: "analizar", name: "Analizar un piso", blurb: "Rentabilidad bruta, neta y cashflow." },
    { id: "financiacion", name: "Financiación", blurb: "Hipoteca, apalancamiento y creativa." },
    { id: "alquiler-flip", name: "Alquiler vs Flip", blurb: "Qué estrategia según tu objetivo." },
  ],
  communitiesSeed: [
    { name: "Rentabilidad", desc: "Alquiler, cashflow y gestión." },
    { name: "Flipping", desc: "Reforma, costes y venta." },
  ],
};

import type { NicheModule } from "@/lib/niches/types";

/** Amazon FBA & marketplaces — ranked por revenue neto verificado. */
export const amazon: NicheModule = {
  slug: "amazon",
  name: "Amazon & Marketplace",
  tagline: "El marketplace más grande del mundo, tu campo de batalla.",
  color: "var(--niche-amazon)",
  glyph: "📦",
  copy: {
    member: "seller",
    postAction: "Ver research",
    composer: "Comparte un revenue update, un research de producto, un caso de PPC…",
    feedEmpty: "Aún no hay casos de Amazon. Publica tus números reales.",
    curveLabel: "Curva de revenue verificada",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["fba", "ppc", "bsr", "research", "helium10", "buybox", "reviews", "marca-propia"],
  postStatFields: [
    { key: "revenue", label: "Revenue" },
    { key: "netMargin", label: "Margen" },
    { key: "acos", label: "ACoS" },
    { key: "products", label: "Productos" },
  ],
  profileMetrics: [
    { key: "revenue", label: "Revenue/mes", accent: "var(--profit)" },
    { key: "netMargin", label: "Margen tras fees", suffix: "%" },
    { key: "acos", label: "ACoS medio", suffix: "%", accent: "var(--loss)" },
    { key: "products", label: "Productos activos" },
  ],
  verification: {
    method: "ad-platforms",
    connectLabel: "Conectar Seller Central",
    description: "Lee revenue y fees desde Amazon Seller (solo lectura).",
    mvp: "Importar CSV / captura de reportes",
    safety: "Solo lectura de tus reportes de ventas y PPC.",
  },
  competitions: [
    { id: "launch-battle", name: "Launch Battle", metric: "Revenue del producto en sus primeros 30 días", basis: "verified-delta" },
    { id: "mejor-ppc", name: "Mejor PPC", metric: "Menor ACoS con volumen", basis: "verified-delta" },
  ],
  learning: [
    { id: "research", name: "Research de producto", blurb: "Helium10/Jungle Scout y criterios." },
    { id: "lanzamiento", name: "Lanzamiento", blurb: "Reviews, buy box y ranking inicial." },
    { id: "ppc", name: "PPC rentable", blurb: "ACoS, TACoS y estrategia de pujas." },
  ],
  communitiesSeed: [
    { name: "FBA España", desc: "Marca propia, fees y logística." },
    { name: "PPC Lab", desc: "Campañas, ACoS y escalado." },
  ],
};

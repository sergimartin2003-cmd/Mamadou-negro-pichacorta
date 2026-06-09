import type { NicheModule } from "@/lib/niches/types";

/** Dropshipping & importación — ranked por revenue y ROAS verificado. */
export const dropshipping: NicheModule = {
  slug: "dropshipping",
  name: "Dropshipping & Import",
  tagline: "El producto correcto, el margen correcto, el momento correcto.",
  color: "var(--niche-dropshipping)",
  glyph: "🚚",
  copy: {
    member: "dropshipper",
    postAction: "Ver anuncio",
    composer: "Comparte un producto ganador, un análisis de anuncio, un escalado…",
    feedEmpty: "Aún no hay productos ganadores. Enseña tus métricas de ads.",
    curveLabel: "Curva de revenue verificada",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["producto-ganador", "tiktok-ads", "meta-ads", "aliexpress", "1688", "supplier", "escalado", "testing"],
  postStatFields: [
    { key: "revenue", label: "Revenue" },
    { key: "roas", label: "ROAS" },
    { key: "margin", label: "Margen" },
    { key: "winners", label: "Ganadores" },
  ],
  profileMetrics: [
    { key: "revenue", label: "Revenue/mes", accent: "var(--profit)" },
    { key: "roas", label: "ROAS medio", suffix: "x", accent: "var(--profit)" },
    { key: "margin", label: "Margen neto", suffix: "%" },
    { key: "winners", label: "Prod. ganadores" },
  ],
  verification: {
    method: "ad-platforms",
    connectLabel: "Conectar ad account",
    description: "Lee gasto y ROAS desde Meta/TikTok Ads (solo lectura).",
    mvp: "Importar CSV / captura de ads",
    safety: "Solo lectura de tus métricas de campañas.",
  },
  competitions: [
    { id: "product-hunt", name: "Product Hunt", metric: "Mejor producto ganador (ROAS + volumen)", basis: "verified-delta" },
    { id: "mejor-escalado", name: "Mejor Escalado", metric: "Mayor escalado rentable", basis: "verified-delta" },
  ],
  learning: [
    { id: "producto", name: "Encontrar producto ganador", blurb: "Criterios, señales y validación." },
    { id: "anuncios", name: "Anuncios que venden", blurb: "Creativos, CPM, CTR y ROAS." },
    { id: "escalar", name: "Escalar campañas", blurb: "De $50/día a $1K/día sin morir." },
  ],
  communitiesSeed: [
    { name: "Winning Products", desc: "Testing, señales y validación." },
    { name: "Supplier Room", desc: "Alibaba, 1688 y agentes." },
  ],
};

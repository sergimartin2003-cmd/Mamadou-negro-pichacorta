import type { NicheModule } from "@/lib/niches/types";

/** Ecommerce — tiendas propias, ranked por revenue verificado. */
export const ecommerce: NicheModule = {
  slug: "ecommerce",
  name: "Ecommerce",
  tagline: "Tu tienda, tus reglas, tus números.",
  color: "var(--niche-ecommerce)",
  glyph: "🛍️",
  copy: {
    member: "emprendedor",
    postAction: "Ver desglose",
    composer: "Comparte un revenue update, un producto ganador, un análisis de ads…",
    feedEmpty: "Aún no hay casos de ecommerce. Publica tus números.",
    curveLabel: "Curva de revenue verificada",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["shopify", "ads", "producto-ganador", "revenue", "margen", "cro", "email", "logistica"],
  postStatFields: [
    { key: "revenue", label: "Revenue" },
    { key: "margin", label: "Margen" },
    { key: "roas", label: "ROAS" },
    { key: "orders", label: "Pedidos" },
  ],
  profileMetrics: [
    { key: "revenue", label: "Revenue/mes", accent: "var(--profit)" },
    { key: "margin", label: "Margen bruto", suffix: "%" },
    { key: "roas", label: "ROAS medio", suffix: "x", accent: "var(--profit)" },
    { key: "orders", label: "Pedidos" },
  ],
  verification: {
    method: "stripe-analytics",
    connectLabel: "Conectar tienda",
    description: "Verifica tu revenue conectando Shopify o Stripe (solo lectura).",
    mvp: "Importar CSV de ventas",
    safety: "Solo lectura. Nunca tocamos tu dinero ni tus clientes.",
  },
  competitions: [
    { id: "revenue-reto", name: "Reto de Revenue", metric: "Revenue verificado en 30 días", basis: "verified-delta" },
    { id: "margen-rey", name: "Rey del Margen", metric: "Mejor margen neto", basis: "verified-delta" },
  ],
  learning: [
    { id: "primera-venta", name: "De 0 a primera venta", blurb: "Lanza tu tienda y consigue el primer pedido." },
    { id: "paid-ads", name: "Paid Ads rentables", blurb: "Meta y TikTok ads con ROAS positivo." },
    { id: "escalar", name: "Escalar a 5 cifras", blurb: "Producto, oferta y operaciones." },
  ],
  communitiesSeed: [
    { name: "Shopify Lab", desc: "Tiendas propias, apps y conversión." },
    { name: "Paid Ads", desc: "Creativos, escalado y ROAS." },
  ],
};

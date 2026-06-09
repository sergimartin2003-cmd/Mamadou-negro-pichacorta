/**
 * Per-niche competitive seed.
 *
 * The social layer (profiles, feed, communities) is shared and lives in seed.ts.
 * This module derives the *competitive* layer that is split per niche:
 *   - `userNicheStats`  — one row per (profile, niche): rp, tier, verified, card metrics
 *   - `crossNichePosts` — non-trading posts for the single shared feed
 *   - `nicheCompetitions` / `nicheLearningPaths` — generated from each niche module
 *
 * Values are generated deterministically (FNV-1a hash, no Math.random) so server
 * and client render identically — no hydration mismatch.
 */

import type {
  Competition,
  CompetitionKind,
  LearningPath,
  NicheSlug,
  Post,
  Profile,
} from "@/types/db";
import { NICHES, NICHE_SLUGS } from "@/config/niches";
import { TIER_INDEX } from "@/lib/niches/types";
import { tierFor } from "@/lib/domain/tiers";
import { me, traders } from "./seed";

export interface NicheStatRow {
  profileId: string;
  niche: NicheSlug;
  rp: number;
  verified: boolean;
  /** Headline win-rate for the leaderboard "Win %" column. */
  win: number;
  /** Season delta for the leaderboard "Season" column (percent). */
  delta: number;
  /** Per-niche profile-card metric values, keyed by the module metric `key`. */
  metrics: Record<string, string>;
}

const PROFILES: readonly Profile[] = [...traders, me];

/** FNV-1a — stable across server/client. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(min: number, max: number, n: number): number {
  return Math.max(min, Math.min(max, n));
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

function money(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}k`;
  return `€${Math.round(n)}`;
}

/** A profile takes part in a niche if it's a guaranteed seed or hashes in. */
function participates(profile: Profile, slug: NicheSlug, index: number): boolean {
  if (slug === "trading") return true; // every demo profile has a trading ladder
  if (index < 6 || profile.id === "me") return true; // guarantee a field per niche
  return hash(profile.id + slug) % 5 < 3;
}

function nicheRp(profile: Profile, slug: NicheSlug): number {
  const seed = hash(profile.id + slug);
  return clamp(420, 9200, Math.round(profile.rp * (0.55 + (seed % 90) / 100) + ((seed >>> 8) % 1600) - 400));
}

function metricsFor(slug: NicheSlug, level: number, seed: number): Record<string, string> {
  switch (slug) {
    case "ecommerce":
      return {
        revenue: money(level * level * 1500 + (seed % 4000)),
        margin: String(20 + (seed % 35)),
        roas: (1.8 + (seed % 40) / 10).toFixed(1),
        orders: String(80 + level * 120 + (seed % 400)),
      };
    case "saas":
      return {
        mrr: money(level * level * 800 + (seed % 2500)),
        churn: (1 + (seed % 80) / 10).toFixed(1),
        users: compact(level * 150 + (seed % 1200)),
        ltv: money(300 + level * 400 + (seed % 1500)),
      };
    case "contenido":
      return {
        income: money(level * level * 400 + (seed % 3000)),
        subs: compact(level * 5000 + (seed % 80_000)),
        views: compact(level * 40_000 + (seed % 500_000)),
        rpm: `€${(2 + (seed % 80) / 10).toFixed(1)}`,
      };
    case "inmobiliario":
      return {
        units: String(1 + level * 2 + (seed % 5)),
        netYield: (3 + (seed % 60) / 10).toFixed(1),
        cashflow: `${money(level * 600 + (seed % 1800))}/mes`,
        occupancy: String(85 + (seed % 15)),
      };
    case "servicios":
      return {
        income: money(level * level * 900 + (seed % 5000)),
        clients: String(2 + level * 2 + (seed % 8)),
        ticket: money(500 + level * 1200 + (seed % 4000)),
        retention: String(70 + (seed % 30)),
      };
    case "amazon":
      return {
        revenue: money(level * level * 1800 + (seed % 6000)),
        netMargin: String(12 + (seed % 28)),
        acos: String(8 + (seed % 30)),
        products: String(1 + level + (seed % 6)),
      };
    case "dropshipping":
      return {
        revenue: money(level * level * 2000 + (seed % 8000)),
        roas: (1.5 + (seed % 35) / 10).toFixed(1),
        margin: String(15 + (seed % 30)),
        winners: String(1 + level + (seed % 5)),
      };
    default:
      return {};
  }
}

function tradingMetrics(profile: Profile): Record<string, string> {
  return {
    win: String(profile.win),
    pnl: `+${profile.pnl}`,
    dd: String(profile.dd),
    trades: profile.trades.toLocaleString(),
  };
}

function buildUserNicheStats(): NicheStatRow[] {
  const rows: NicheStatRow[] = [];
  PROFILES.forEach((profile, index) => {
    NICHE_SLUGS.forEach((slug) => {
      if (!participates(profile, slug, index)) return;
      if (slug === "trading") {
        rows.push({
          profileId: profile.id,
          niche: slug,
          rp: profile.rp,
          verified: profile.verified,
          win: profile.win,
          delta: profile.pnl,
          metrics: tradingMetrics(profile),
        });
        return;
      }
      const seed = hash(profile.id + slug);
      const rp = nicheRp(profile, slug);
      const level = TIER_INDEX[tierFor(rp).key];
      rows.push({
        profileId: profile.id,
        niche: slug,
        rp,
        verified: (seed % 100) < (profile.verified ? 70 : 35),
        win: 48 + (seed % 38),
        delta: ((seed >>> 4) % 220) - 40,
        metrics: metricsFor(slug, level, seed),
      });
    });
  });
  return rows;
}

export const userNicheStats: readonly NicheStatRow[] = buildUserNicheStats();

// ---------------------------------------------------------------------------
// Cross-niche feed posts — the feed is ONE shared space; niche is just a tag.
// Authors are guaranteed-seed profiles (u1–u6, me) so a rank badge always shows.
// ---------------------------------------------------------------------------

export const crossNichePosts: readonly Post[] = [
  {
    id: "np1",
    author: "u1",
    time: "22m",
    niche: "ecommerce",
    market: "Stocks",
    dir: "long",
    symbol: "—",
    title: "De €0 a €28K/mes en 18 meses — desglose real de mi tienda outdoor",
    body: "Octubre cerró en €28.4K con 34% de margen bruto. El producto ganador fue una mochila ultraligera; el catálogo sostiene el resto. Tienda conectada, así que el número del perfil es el real, no una captura.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["shopify", "producto-ganador"],
    up: 412,
    down: 9,
    comments: 38,
    chart: "",
    stats: ["€28.4k", "34%", "3.8x", "1,240"],
  },
  {
    id: "np2",
    author: "u2",
    time: "1h",
    niche: "saas",
    market: "Crypto",
    dir: "long",
    symbol: "—",
    title: "$9.8K MRR y subiendo — build in public, mes 14",
    body: "Doblé la apuesta en onboarding y añadí planes anuales. Stripe conectado en solo lectura, así que el MRR del perfil es verificado. El churn (3.1%) sigue siendo mi mayor problema — abierto a feedback.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["saas", "mrr"],
    up: 286,
    down: 4,
    comments: 52,
    chart: "",
    stats: ["€9.8k", "+22%", "3.1%", "340"],
  },
  {
    id: "np3",
    author: "u3",
    time: "3h",
    niche: "contenido",
    market: "Stocks",
    dir: "long",
    symbol: "—",
    title: "Report de octubre: 1,2M vistas y €6.2K en ingresos",
    body: "El vídeo que rompió fue un tutorial de 8 minutos, no el que más trabajé. El mix: 40% AdSense, 35% sponsors, 25% producto propio. RPM medio de €4.1. Datos, no postureo.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["youtube", "sponsor"],
    up: 521,
    down: 11,
    comments: 47,
    chart: "",
    stats: ["€6.2k", "58k", "1.2M", "€4.1"],
  },
  {
    id: "np4",
    author: "u4",
    time: "5h",
    niche: "inmobiliario",
    market: "Stocks",
    dir: "long",
    symbol: "—",
    title: "Cerré un piso para alquilar — 7,4% neto con los números encima",
    body: "Compra más reforma todo incluido, alquilado en 3 semanas. Rentabilidad neta del 7,4% y €1.8K de cashflow al mes tras todos los gastos. Escrituras subidas, así que la cartera del perfil queda verificada.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["alquiler", "reforma"],
    up: 318,
    down: 6,
    comments: 29,
    chart: "",
    stats: ["Piso", "Alquiler", "7.4%", "€1.8k/mes"],
  },
  {
    id: "np5",
    author: "u5",
    time: "7h",
    niche: "amazon",
    market: "Stocks",
    dir: "long",
    symbol: "—",
    title: "€31K en Amazon FBA este mes — margen real tras fees y PPC",
    body: "Marca propia, 6 SKUs activos. Tras los fees de Amazon y el PPC, el margen neto queda en 22%. ACoS medio del 18%, bajando con la nueva estructura de campañas. Reportes conectados.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["fba", "ppc"],
    up: 244,
    down: 5,
    comments: 21,
    chart: "",
    stats: ["€31k", "22%", "18%", "6"],
  },
  {
    id: "np6",
    author: "u6",
    time: "9h",
    niche: "dropshipping",
    market: "Crypto",
    dir: "long",
    symbol: "—",
    title: "Producto ganador a 4.1x ROAS — cómo lo encontré y escalé",
    body: "Testeé 14 productos este mes, 3 quedaron en verde. El ganador escaló de €50/día a €1.6K/día manteniendo 4.1x de ROAS y 28% de margen neto. Ad account conectado, métricas verificadas.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["producto-ganador", "tiktok-ads"],
    up: 389,
    down: 8,
    comments: 33,
    chart: "",
    stats: ["€48k", "4.1x", "28%", "3"],
  },
] as const;

// ---------------------------------------------------------------------------
// Per-niche competitions & learning, generated from each niche module.
// Trading keeps its hand-authored seed (see seed.ts); these cover the other 4.
// ---------------------------------------------------------------------------

const COMP_KINDS: readonly CompetitionKind[] = ["Seasonal", "48h Battle", "Friends", "Seasonal"];
const PRIZES = ["Elite badge + $5k", "Season RP x2", "Verified spotlight", "Bragging rights"];

function buildNicheCompetitions(): Competition[] {
  const out: Competition[] = [];
  NICHE_SLUGS.forEach((slug) => {
    if (slug === "trading") return; // hand-authored in seed.ts
    const nicheModule = NICHES[slug];
    nicheModule.competitions.forEach((comp, i) => {
      const seed = hash(slug + comp.id);
      const joined = i === 0 && (seed % 2 === 0);
      out.push({
        id: `${slug}-${comp.id}`,
        name: comp.name,
        niche: slug,
        kind: COMP_KINDS[i % COMP_KINDS.length],
        market: "All",
        participants: 60 + (seed % 4800),
        daysLeft: i === nicheModule.competitions.length - 1 && seed % 3 === 0 ? 0 : 1 + (seed % 26),
        prize: PRIZES[i % PRIZES.length],
        metric: comp.metric,
        joined,
        myRank: joined ? 1 + (seed % 40) : null,
        rule: comp.basis === "votes" ? "Community-voted" : "Verified metrics only",
      });
    });
  });
  return out;
}

function buildNicheLearningPaths(): LearningPath[] {
  const out: LearningPath[] = [];
  NICHE_SLUGS.forEach((slug) => {
    if (slug === "trading") return; // hand-authored in seed.ts
    const nicheModule = NICHES[slug];
    nicheModule.learning.forEach((path) => {
      const seed = hash(slug + path.id);
      const modules = 8 + (seed % 9);
      const done = seed % (modules + 1);
      out.push({
        id: `${slug}-${path.id}`,
        name: path.name,
        niche: slug,
        market: "All",
        color: nicheModule.color,
        icon: nicheModule.glyph,
        modules,
        done,
        xp: done * 120 + (seed % 200),
        level: 1 + (TIER_INDEX[tierFor((seed % 9000) + 200).key]),
      });
    });
  });
  return out;
}

export const nicheCompetitions: readonly Competition[] = buildNicheCompetitions();
export const nicheLearningPaths: readonly LearningPath[] = buildNicheLearningPaths();

/**
 * Seed data for the unified feature modules (gamification + multi-niche tools).
 * Kept separate from the EmprendeHub core seed so both layers stay decoupled.
 */

import type { PredictScore } from "@/lib/domain/predict";
import type { SpeedScore } from "@/lib/domain/speed";
import type { Challenge, ChallengeProgress } from "@/lib/domain/challenges";
import type { Season } from "@/lib/domain/season";
import type { StartupSnapshot } from "@/lib/domain/startup";
import type { StoreSnapshot } from "@/lib/domain/store";
import type { PortfolioSnapshot } from "@/lib/domain/portfolio";
import type { DropshipSnapshot } from "@/lib/domain/dropship";
import type { Task } from "@/lib/domain/tasks";
import type { Security } from "@/lib/domain/screener";
import type { TiltTrade } from "@/lib/domain/tilt";

/** Seed leaderboard for the "Predict the Next Candle" minigame. */
export const predictLeaderboard: readonly PredictScore[] = [
  { handle: "lenatrades", name: "Lena Volkov", mode: "extreme", score: 1000, streak: 14 },
  { handle: "kaito_fx", name: "Kaito Mercer", mode: "turbo", score: 150, streak: 11 },
  { handle: "theonk", name: "Theo Nakamura", mode: "turbo", score: 150, streak: 9 },
  { handle: "sofiacharts", name: "Sofia Marín", mode: "turbo", score: 120, streak: 6 },
  { handle: "dcole", name: "Dmitri Cole", mode: "turbo", score: 90, streak: 5 },
  { handle: "priya_a", name: "Priya Anand", mode: "classic", score: 10, streak: 4 },
  { handle: "owenp", name: "Owen Pierce", mode: "classic", score: 10, streak: 3 },
  { handle: "camir", name: "Camila Rocha", mode: "classic", score: 10, streak: 2 },
] as const;

/** Seed leaderboard for the "Speed Trading Challenge" minigame. */
export const speedLeaderboard: readonly SpeedScore[] = [
  { handle: "kaito_fx", name: "Kaito Mercer", score: 2400, trades: 31, accuracy: 0.74 },
  { handle: "lenatrades", name: "Lena Volkov", score: 2150, trades: 28, accuracy: 0.79 },
  { handle: "dcole", name: "Dmitri Cole", score: 1850, trades: 26, accuracy: 0.69 },
  { handle: "theonk", name: "Theo Nakamura", score: 1600, trades: 24, accuracy: 0.67 },
  { handle: "sofiacharts", name: "Sofia Marín", score: 1350, trades: 22, accuracy: 0.64 },
  { handle: "aisha_b", name: "Aisha Bello", score: 1100, trades: 19, accuracy: 0.63 },
  { handle: "owenp", name: "Owen Pierce", score: 900, trades: 17, accuracy: 0.59 },
] as const;

/** Active challenges across the three reset periods. */
export const challenges: readonly Challenge[] = [
  { id: "d1", period: "daily", title: "Gana 3 trades seguidos", goal: 3, reward: 50 },
  { id: "d2", period: "daily", title: "Opera en 3 mercados diferentes", goal: 3, reward: 75 },
  { id: "d3", period: "daily", title: "Consigue un R:R > 3", goal: 1, reward: 100 },
  { id: "d4", period: "daily", title: "Ayuda a 5 usuarios en el chat", goal: 5, reward: 50 },
  { id: "w1", period: "weekly", title: "Gana 50 trades", goal: 50, reward: 500 },
  { id: "w2", period: "weekly", title: "Sube 100 puntos ELO", goal: 100, reward: 750 },
  { id: "w3", period: "weekly", title: "Gana 3 duelos 1v1", goal: 3, reward: 600 },
  { id: "w4", period: "weekly", title: "Invita a 10 amigos", goal: 10, reward: 1000 },
  { id: "m1", period: "monthly", title: "Gana 500 trades", goal: 500, reward: 5000 },
  { id: "m2", period: "monthly", title: "Alcanza la liga Oro", goal: 1, reward: 10000 },
  { id: "m3", period: "monthly", title: "Gana 1 competición", goal: 1, reward: 7500 },
  { id: "m4", period: "monthly", title: "Consigue 100 seguidores", goal: 100, reward: 3000 },
] as const;

/** Demo progress for the signed-in user. */
export const challengeProgress: Readonly<Record<string, ChallengeProgress>> = {
  d1: { current: 3, claimed: false },
  d2: { current: 2, claimed: false },
  d3: { current: 1, claimed: true },
  d4: { current: 3, claimed: false },
  w1: { current: 41, claimed: false },
  w2: { current: 100, claimed: false },
  w3: { current: 1, claimed: false },
  w4: { current: 4, claimed: false },
  m1: { current: 312, claimed: false },
  m2: { current: 0, claimed: false },
  m3: { current: 0, claimed: false },
  m4: { current: 87, claimed: false },
};

/** The active competitive season (3-month window). */
export const currentSeason: Season = {
  id: "s7",
  number: 7,
  name: "Cyberpunk Trading",
  startsAt: "2026-04-01T00:00:00.000Z",
  endsAt: "2026-07-01T00:00:00.000Z",
};

/** Demo SaaS snapshot powering the Startup Dashboard module. */
export const startupSnapshot: StartupSnapshot = {
  company: "Nimbus Analytics",
  currency: "€",
  mrrSeries: [
    { month: "Jul", mrr: 6200 },
    { month: "Ago", mrr: 7100 },
    { month: "Sep", mrr: 8300 },
    { month: "Oct", mrr: 9600 },
    { month: "Nov", mrr: 10800 },
    { month: "Dic", mrr: 12100 },
    { month: "Ene", mrr: 13200 },
    { month: "Feb", mrr: 14500 },
    { month: "Mar", mrr: 15600 },
    { month: "Abr", mrr: 16700 },
    { month: "May", mrr: 17600 },
    { month: "Jun", mrr: 18400 },
  ],
  expenses: [
    { label: "Salarios", amount: 22000 },
    { label: "Marketing", amount: 8000 },
    { label: "Infra / Hosting", amount: 3200 },
    { label: "Oficina", amount: 1800 },
    { label: "Herramientas", amount: 1400 },
    { label: "Otros", amount: 1600 },
  ],
  cash: 110000,
  customersAtStart: 220,
  churnedCustomers: 9,
  newCustomers: 28,
  salesMarketingSpend: 8000,
  arpa: 84,
  grossMargin: 0.82,
  churnDeltaPct: 2,
  goalMrr: 30000,
  goalMonths: 6,
};

/** Demo online store powering the Store Builder module. */
export const storeSnapshot: StoreSnapshot = {
  name: "Nordic Goods",
  currency: "€",
  theme: "Minimal Mono",
  stats: { visitors: 18420, orders: 642, revenue: 28940, prevRevenue: 24100, refunds: 19 },
  products: [
    { id: "p1", name: "Oak Desk Organizer", category: "Hogar", price: 39, cost: 14, stock: 48, sales: 312 },
    { id: "p2", name: "Linen Throw Blanket", category: "Hogar", price: 59, cost: 23, stock: 4, sales: 268 },
    { id: "p3", name: "Ceramic Pour-Over", category: "Cocina", price: 34, cost: 12, stock: 0, sales: 244 },
    { id: "p4", name: "Wool Slippers", category: "Moda", price: 45, cost: 18, stock: 73, sales: 198 },
    { id: "p5", name: "Brass Candle Set", category: "Decoración", price: 28, cost: 9, stock: 3, sales: 176 },
    { id: "p6", name: "Recycled Tote", category: "Moda", price: 22, cost: 7, stock: 120, sales: 154 },
    { id: "p7", name: "Stoneware Mug", category: "Cocina", price: 18, cost: 6, stock: 60, sales: 132 },
    { id: "p8", name: "Cork Yoga Block", category: "Deporte", price: 24, cost: 8, stock: 2, sales: 96 },
  ],
};

/** Demo multi-asset portfolio powering the Portfolio Tracker module. */
export const portfolioSnapshot: PortfolioSnapshot = {
  name: "Mi cartera",
  currency: "€",
  holdings: [
    { id: "h1", name: "Apple", symbol: "AAPL", type: "stock", region: "US", quantity: 24, avgCost: 145, price: 212 },
    { id: "h2", name: "Vanguard S&P 500", symbol: "VUSA", type: "etf", region: "US", quantity: 60, avgCost: 78, price: 96 },
    { id: "h3", name: "Bitcoin", symbol: "BTC", type: "crypto", region: "Global", quantity: 0.35, avgCost: 41000, price: 58000 },
    { id: "h4", name: "Ethereum", symbol: "ETH", type: "crypto", region: "Global", quantity: 4, avgCost: 3100, price: 2700 },
    { id: "h5", name: "iShares Euro Govt Bond", symbol: "IEGA", type: "bond", region: "EU", quantity: 80, avgCost: 52, price: 50 },
    { id: "h6", name: "REIT Inmobiliario EU", symbol: "EPRA", type: "realestate", region: "EU", quantity: 110, avgCost: 38, price: 44 },
    { id: "h7", name: "Oro físico (ETC)", symbol: "SGLN", type: "commodity", region: "Global", quantity: 30, avgCost: 31, price: 39 },
    { id: "h8", name: "Efectivo", symbol: "EUR", type: "cash", region: "EU", quantity: 3200, avgCost: 1, price: 1 },
  ],
};

/** Demo dropshipping business powering the Dropshipping Dashboard module. */
export const dropshipSnapshot: DropshipSnapshot = {
  name: "PetGadget Pro",
  currency: "€",
  stats: {
    revenue: 42800,
    cogs: 15400,
    adSpend: 16200,
    otherCosts: 2100,
    orders: 1180,
    refunds: 58,
    newCustomers: 940,
  },
  suppliers: [
    { id: "s1", name: "Shenzhen FastShip", avgShipDays: 8, incidentRate: 0.03, quality: 4.6, orders: 540 },
    { id: "s2", name: "Yiwu Trading Co.", avgShipDays: 14, incidentRate: 0.07, quality: 4.1, orders: 380 },
    { id: "s3", name: "EU Warehouse Direct", avgShipDays: 4, incidentRate: 0.02, quality: 4.8, orders: 210 },
    { id: "s4", name: "Guangzhou Bulk", avgShipDays: 22, incidentRate: 0.18, quality: 3.2, orders: 95 },
  ],
};

/** Demo Kanban board powering the Tasks/Projects module. */
export const tasks: readonly Task[] = [
  { id: "t1", title: "Definir buyer persona", status: "done", priority: "high", project: "Lanzamiento" },
  { id: "t2", title: "Diseñar landing page", status: "done", priority: "high", project: "Lanzamiento" },
  { id: "t3", title: "Configurar pasarela de pago", status: "doing", priority: "high", project: "Lanzamiento" },
  { id: "t4", title: "Redactar política de privacidad", status: "todo", priority: "med", project: "Lanzamiento" },
  { id: "t5", title: "Campaña de email de bienvenida", status: "doing", priority: "med", project: "Marketing" },
  { id: "t6", title: "Crear 5 creatividades para Ads", status: "todo", priority: "high", project: "Marketing" },
  { id: "t7", title: "Investigar keywords SEO", status: "todo", priority: "low", project: "Marketing" },
  { id: "t8", title: "Negociar MOQ con proveedor", status: "doing", priority: "med", project: "Operaciones" },
  { id: "t9", title: "Pedir muestras de producto", status: "done", priority: "low", project: "Operaciones" },
  { id: "t10", title: "Automatizar fulfillment", status: "todo", priority: "high", project: "Operaciones" },
];

/** Demo universe powering the Investment Research Hub screener. */
export const securities: readonly Security[] = [
  { id: "se1", name: "Apple", symbol: "AAPL", sector: "Tech", price: 212, per: 29, pb: 46, roe: 0.45, dividendYield: 0.005, growth: 0.08, debtToEquity: 1.5, marketCap: 3.2e12 },
  { id: "se2", name: "Microsoft", symbol: "MSFT", sector: "Tech", price: 430, per: 35, pb: 12, roe: 0.39, dividendYield: 0.007, growth: 0.15, debtToEquity: 0.4, marketCap: 3.1e12 },
  { id: "se3", name: "Coca-Cola", symbol: "KO", sector: "Consumo", price: 62, per: 24, pb: 10, roe: 0.4, dividendYield: 0.031, growth: 0.04, debtToEquity: 1.6, marketCap: 2.7e11 },
  { id: "se4", name: "JPMorgan", symbol: "JPM", sector: "Finanzas", price: 198, per: 12, pb: 1.8, roe: 0.17, dividendYield: 0.024, growth: 0.06, debtToEquity: 1.3, marketCap: 5.7e11 },
  { id: "se5", name: "Pfizer", symbol: "PFE", sector: "Salud", price: 28, per: 13, pb: 1.6, roe: 0.12, dividendYield: 0.058, growth: -0.02, debtToEquity: 0.7, marketCap: 1.6e11 },
  { id: "se6", name: "ExxonMobil", symbol: "XOM", sector: "Energía", price: 116, per: 14, pb: 2.1, roe: 0.18, dividendYield: 0.033, growth: 0.03, debtToEquity: 0.2, marketCap: 4.6e11 },
  { id: "se7", name: "Nvidia", symbol: "NVDA", sector: "Tech", price: 124, per: 55, pb: 50, roe: 0.69, dividendYield: 0.0003, growth: 0.6, debtToEquity: 0.4, marketCap: 3.0e12 },
  { id: "se8", name: "Realty Income", symbol: "O", sector: "Inmobiliario", price: 58, per: 50, pb: 1.3, roe: 0.03, dividendYield: 0.054, growth: 0.05, debtToEquity: 0.7, marketCap: 5.0e10 },
  { id: "se9", name: "Banco Santander", symbol: "SAN", sector: "Finanzas", price: 4.6, per: 6, pb: 0.7, roe: 0.13, dividendYield: 0.045, growth: 0.07, debtToEquity: 2.4, marketCap: 7.0e10 },
  { id: "se10", name: "Inditex", symbol: "ITX", sector: "Consumo", price: 47, per: 26, pb: 6.5, roe: 0.31, dividendYield: 0.029, growth: 0.11, debtToEquity: 0.1, marketCap: 1.5e11 },
];

/** Recent trades for the signed-in user, powering the Tilt-Meter. */
export const tiltTrades: readonly TiltTrade[] = [
  { id: "tt1", minutesAgo: 1, result: "loss", size: 200 },
  { id: "tt2", minutesAgo: 2, result: "loss", size: 100 },
  { id: "tt3", minutesAgo: 4, result: "loss", size: 100 },
  { id: "tt4", minutesAgo: 30, result: "win", size: 100 },
  { id: "tt5", minutesAgo: 55, result: "win", size: 90 },
];

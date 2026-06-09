import type { NicheModule } from "@/lib/niches/types";

/** Emprendimiento — build-in-public for founders, ranked by verified traction. */
export const emprendimiento: NicheModule = {
  slug: "emprendimiento",
  name: "Emprendimiento",
  tagline: "Founders ranked by verified traction, not vanity metrics.",
  color: "var(--profit)",
  glyph: "🚀",
  copy: {
    member: "founder",
    postAction: "Clone idea",
    composer: "Share a milestone, a launch, or an MRR update…",
    feedEmpty: "No build-in-public updates yet. Ship something.",
    curveLabel: "Verified traction curve",
  },
  tierNames: ["Idea", "Builder", "Maker", "Founder", "Operator", "Scaler", "Titan"],
  postTags: ["saas", "ecommerce", "indiehacker", "launch", "mrr", "fundraising", "hiring", "feedback"],
  postStatFields: [
    { key: "stage", label: "Stage" },
    { key: "industry", label: "Industry" },
    { key: "mrr", label: "MRR" },
    { key: "growth", label: "Growth" },
  ],
  profileMetrics: [
    { key: "mrr", label: "MRR", accent: "var(--profit)" },
    { key: "users", label: "Active users" },
    { key: "stage", label: "Stage" },
    { key: "projects", label: "Projects" },
  ],
  verification: {
    method: "stripe-analytics",
    connectLabel: "Connect Stripe",
    description: "Read MRR and revenue from Stripe Connect or analytics (read-only).",
    mvp: "CSV metrics import",
    safety: "Read-only OAuth. We never charge customers or move money.",
  },
  competitions: [
    { id: "mvp-30", name: "MVP in 30 Days", metric: "Shipped & verified launch", basis: "votes" },
    { id: "first-1k", name: "First $1k MRR", metric: "Verified MRR delta", basis: "verified-delta" },
    { id: "growth-race", name: "Monthly Growth Race", metric: "MRR growth %", basis: "verified-delta" },
  ],
  learning: [
    { id: "validate", name: "Validate an Idea", blurb: "Find a real problem worth solving." },
    { id: "mvp", name: "Build the MVP", blurb: "Ship the smallest thing that proves value." },
    { id: "first-customers", name: "First Customers", blurb: "From zero to paying users." },
    { id: "pricing", name: "Pricing & Monetization", blurb: "Package, price and capture value." },
    { id: "fundraising", name: "Fundraising", blurb: "Angels, pre-seed and the deck." },
  ],
  communitiesSeed: [
    { name: "SaaS Builders", desc: "Build-in-public for B2B SaaS founders." },
    { name: "Indie Hackers ES", desc: "Bootstrapped, profitable, solo & small teams." },
    { name: "Fundraising Room", desc: "Decks, intros and term-sheet talk." },
  ],
};

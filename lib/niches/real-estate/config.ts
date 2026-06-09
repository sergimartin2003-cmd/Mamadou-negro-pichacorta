import type { NicheModule } from "@/lib/niches/types";

/** Real Estate — build-in-public for investors, ranked by verified portfolio. */
export const realEstate: NicheModule = {
  slug: "real-estate",
  name: "Real Estate",
  tagline: "Investors ranked by verified doors, cash flow and deals.",
  color: "var(--t-diamond)",
  glyph: "🏠",
  copy: {
    member: "investor",
    postAction: "Analyze deal",
    composer: "Share a deal, a flip, or a rental analysis…",
    feedEmpty: "No deals yet. Post one under contract or closed.",
    curveLabel: "Verified portfolio curve",
  },
  tierNames: ["Tenant", "Landlord", "Investor", "Operator", "Syndicator", "Mogul", "Titan"],
  postTags: ["brrrr", "flip", "wholesale", "buy-hold", "multifamily", "shortterm", "commercial", "analysis"],
  postStatFields: [
    { key: "location", label: "Location" },
    { key: "strategy", label: "Strategy" },
    { key: "capRate", label: "Cap rate" },
    { key: "cashFlow", label: "Cash flow" },
  ],
  profileMetrics: [
    { key: "doors", label: "Doors" },
    { key: "portfolio", label: "Portfolio", accent: "var(--profit)" },
    { key: "cashFlow", label: "Cash flow", accent: "var(--profit)" },
    { key: "capRate", label: "Avg cap rate", suffix: "%" },
  ],
  verification: {
    method: "documents",
    connectLabel: "Upload proof",
    description: "Verify deals with closing docs, rent roll or a portfolio CSV.",
    mvp: "Document upload / CSV import",
    safety: "Locations shown at neighborhood level; exact addresses stay private.",
  },
  competitions: [
    { id: "first-rental-90", name: "First Rental in 90 Days", metric: "Verified acquisition", basis: "votes" },
    { id: "ten-doors", name: "10 Doors Challenge", metric: "Verified door count", basis: "verified-delta" },
    { id: "cashflow-race", name: "Monthly Cash-Flow Race", metric: "Cash-flow delta", basis: "verified-delta" },
    { id: "best-analysis", name: "Best Deal Analysis", metric: "Community votes", basis: "votes" },
  ],
  learning: [
    { id: "analyze", name: "Analyze a Deal", blurb: "Cap rate, cash-on-cash and the numbers." },
    { id: "financing", name: "Financing & Leverage", blurb: "Debt, DSCR and creative funding." },
    { id: "brrrr", name: "BRRRR End-to-End", blurb: "Buy, rehab, rent, refinance, repeat." },
    { id: "management", name: "Property Management", blurb: "Tenants, turns and operations." },
    { id: "scale", name: "Scaling the Portfolio", blurb: "Systems, partners and syndication." },
  ],
  communitiesSeed: [
    { name: "BRRRR Lab", desc: "Refi strategy, contractors & ARV." },
    { name: "Short-Term Rentals", desc: "Airbnb, pricing & guest ops." },
    { name: "Multifamily Room", desc: "Underwriting, syndication & capital." },
  ],
};

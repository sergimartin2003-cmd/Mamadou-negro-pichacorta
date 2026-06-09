import type { NicheModule } from "@/lib/niches/types";

/** Marketing — build-in-public for marketers, ranked by verified results. */
export const marketing: NicheModule = {
  slug: "marketing",
  name: "Marketing",
  tagline: "Marketers ranked by verified ROAS — with real community benchmarks.",
  color: "var(--t-elite)",
  glyph: "📈",
  copy: {
    member: "marketer",
    postAction: "View breakdown",
    composer: "Share a campaign, a result, or a funnel breakdown…",
    feedEmpty: "No campaigns yet. Post a result or a creative test.",
    curveLabel: "Verified performance curve",
  },
  tierNames: ["Intern", "Specialist", "Strategist", "Growth Lead", "Director", "CMO", "Legend"],
  postTags: ["paid-social", "google-ads", "seo", "email", "content", "cro", "creative", "affiliate"],
  postStatFields: [
    { key: "channel", label: "Channel" },
    { key: "objective", label: "Objective" },
    { key: "roas", label: "ROAS" },
    { key: "result", label: "Result" },
  ],
  profileMetrics: [
    { key: "spend", label: "Managed spend", accent: "var(--profit)" },
    { key: "roas", label: "Avg ROAS", suffix: "x", accent: "var(--profit)" },
    { key: "audience", label: "Audience" },
    { key: "campaigns", label: "Campaigns" },
  ],
  verification: {
    method: "ad-platforms",
    connectLabel: "Connect ad account",
    description: "Read spend, conversions and revenue from Meta, Google, TikTok or GA4.",
    mvp: "CSV / screenshot results import",
    safety: "Read-only OAuth. Client names anonymized by default.",
  },
  competitions: [
    { id: "best-roas", name: "Best ROAS of the Month", metric: "Verified ROAS", basis: "verified-delta" },
    { id: "audience-build", name: "Audience Builder", metric: "Verified audience growth", basis: "verified-delta" },
    { id: "creative-battle", name: "Creative Battle", metric: "Community votes", basis: "votes" },
    { id: "funnel-teardown", name: "Funnel Teardown", metric: "Community votes", basis: "votes" },
  ],
  learning: [
    { id: "paid-ads", name: "Paid Ads to Positive ROAS", blurb: "From first campaign to profit." },
    { id: "seo", name: "SEO", blurb: "Search intent, content and links." },
    { id: "copy", name: "Copywriting that Converts", blurb: "Angles, hooks and offers." },
    { id: "email", name: "Email & Automation", blurb: "Lifecycle, flows and deliverability." },
    { id: "cro", name: "Funnels & CRO", blurb: "Landing pages and conversion." },
  ],
  communitiesSeed: [
    { name: "Paid Social", desc: "Meta & TikTok ads, creatives & scaling." },
    { name: "SEO & Content", desc: "Organic growth, topical authority." },
    { name: "Agency Owners", desc: "Clients, retainers & operations." },
  ],
};

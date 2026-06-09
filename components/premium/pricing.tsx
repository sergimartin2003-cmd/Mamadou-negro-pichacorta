"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { PlanTier } from "@/types/db";

interface Plan {
  name: string;
  tier: PlanTier;
  price: string;
  tag: string;
  accent: string;
  popular?: boolean;
  cta: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    tier: "free",
    price: "$0",
    tag: "Get started",
    accent: "var(--tx-2)",
    cta: "Current plan",
    features: [
      "Public feed & communities",
      "Basic rank & tier",
      "3 learning paths",
      "Join 1 competition",
    ],
  },
  {
    name: "Pro",
    tier: "pro",
    price: "$19",
    tag: "Most popular",
    accent: "var(--brand)",
    popular: true,
    cta: "Upgrade to Pro",
    features: [
      "Verified performance badge",
      "Full analytics dashboard",
      "Unlimited competitions",
      "All learning paths + XP boosts",
      "Advanced rank insights",
      "Priority chart embeds",
    ],
  },
  {
    name: "Elite",
    tier: "elite",
    price: "$49",
    tag: "For pros",
    accent: "var(--t-gold)",
    cta: "Go Elite",
    features: [
      "Everything in Pro",
      "Private community hosting",
      "Broker auto-verification",
      "Seasonal Elite badge",
      "Affiliate & payout tools",
      "1:1 performance reviews",
    ],
  },
];

const PARTNER_LOGOS = ["Prop Firm A", "Broker B", "Exchange C"] as const;

export function Pricing() {
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState<PlanTier | null>(null);

  async function handleUpgrade(tier: PlanTier) {
    if (tier === "free") return;
    setLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tier }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 503 || data.error === "stripe_not_configured") {
        setToast("Add Stripe keys to enable checkout.");
        setTimeout(() => setToast(null), 4000);
        return;
      }
      if (!res.ok || !data.url) {
        setToast(data.error ?? "Checkout failed. Please try again.");
        setTimeout(() => setToast(null), 4000);
        return;
      }
      window.location.href = data.url;
    } catch {
      setToast("Network error. Please try again.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "var(--bg-float)",
            border: "1px solid var(--line-2)",
            borderRadius: "var(--r-md)",
            padding: "12px 20px",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--tx-1)",
            boxShadow: "var(--sh-2)",
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <span
          className="chip"
          style={{
            color: "var(--t-gold)",
            borderColor: "color-mix(in srgb, var(--t-gold) 36%, transparent)",
          }}
        >
          <Icon name="bolt" size={14} fill /> EmprendeHub Pro
        </span>
        <h1 style={{ fontSize: 34, margin: "14px 0 8px" }}>
          Status is earned.{" "}
          <span style={{ color: "var(--brand)" }}>Prove it faster.</span>
        </h1>
        <p
          style={{
            color: "var(--tx-3)",
            fontSize: 15,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          Desbloquea analíticas verificadas de tu negocio, retos ilimitados,
          vender tus cursos en el marketplace y las herramientas que los
          emprendedores usan para crecer.
        </p>
      </div>

      {/* Plans grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >
        {PLANS.map((p) => (
          <div
            key={p.name}
            className="card"
            style={{
              padding: "24px 22px",
              position: "relative",
              overflow: "hidden",
              border: p.popular
                ? "1.5px solid var(--brand-line)"
                : "1px solid var(--line-1)",
              background: p.popular
                ? "linear-gradient(180deg, color-mix(in srgb, var(--brand) 10%, var(--bg-2)), var(--bg-2))"
                : "var(--bg-2)",
              transform: p.popular ? "scale(1.03)" : "none",
              boxShadow: p.popular ? "var(--sh-brand)" : "none",
            }}
          >
            {p.popular && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "var(--brand)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: "0 0 0 12px",
                }}
              >
                POPULAR
              </div>
            )}
            <div className="sec-label" style={{ color: p.accent }}>
              {p.tag}
            </div>
            <div
              style={{
                fontFamily: "var(--f-display)",
                fontSize: 22,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {p.name}
            </div>
            <div style={{ margin: "12px 0 18px" }}>
              <span
                className="mono"
                style={{ fontSize: 36, fontWeight: 700 }}
              >
                {p.price}
              </span>
              <span style={{ color: "var(--tx-3)", fontSize: 14 }}>/mo</span>
            </div>
            <button
              className={`btn ${p.popular ? "primary" : ""} block`}
              style={{ marginBottom: 20 }}
              disabled={p.tier === "free" || loading === p.tier}
              onClick={() => handleUpgrade(p.tier)}
            >
              {loading === p.tier ? "Loading…" : p.cta}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {p.features.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    fontSize: 13,
                    color: "var(--tx-2)",
                  }}
                >
                  <Icon
                    name="check"
                    size={16}
                    sw={2.4}
                    style={{ color: p.accent, flexShrink: 0, marginTop: 1 }}
                  />{" "}
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Partner offers */}
      <div className="card pad" style={{ padding: "18px 22px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div className="sec-label" style={{ marginBottom: 4 }}>
              Partner offers
            </div>
            <div style={{ fontSize: 13, color: "var(--tx-3)" }}>
              Verified deals from vetted prop firms &amp; brokers.{" "}
              <span style={{ color: "var(--tx-4)" }}>Affiliate.</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PARTNER_LOGOS.map((x) => (
              <div
                key={x}
                className="ph-img"
                style={{
                  width: 120,
                  height: 48,
                  borderRadius: "var(--r-sm)",
                  fontSize: 10,
                }}
              >
                {x} logo
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { createCompetition, type CreateCompetitionInput } from "./actions";

const KINDS = ["Seasonal", "48h Battle", "Friends"] as const;
const MARKETS = ["Crypto", "Forex", "Futures", "Stocks", "All"] as const;
const METRICS = [
  "Risk-adjusted return",
  "Net R multiple",
  "Profit factor",
  "Lowest drawdown",
  "Win rate",
] as const;
const RULES = [
  "Max 3% risk/trade · verified only",
  "Intraday only · min 10 trades",
  "Invite-only",
  "Open registration",
] as const;

type Kind = (typeof KINDS)[number];
type Market = (typeof MARKETS)[number];
type Metric = (typeof METRICS)[number];
type Rule = (typeof RULES)[number];

interface FormState {
  name: string;
  kind: Kind;
  market: Market;
  metric: Metric;
  rule: Rule;
  duration: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  kind: "Seasonal",
  market: "Crypto",
  metric: "Risk-adjusted return",
  rule: "Open registration",
  duration: "7",
};

const LABEL_STYLE = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 7,
  fontSize: 13,
  color: "var(--tx-2)",
  fontWeight: 600,
};

const SELECT_STYLE = {
  height: 40,
  width: "100%",
  padding: "0 13px",
  background: "var(--bg-3)",
  border: "1px solid var(--line-2)",
  borderRadius: "var(--r-sm)",
  color: "var(--tx-1)",
  fontSize: 13.5,
  outline: "none",
};

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: CreateCompetitionInput = {
      name: form.name,
      kind: form.kind,
      market: form.market,
      metric: form.metric,
      rule: form.rule,
      duration: parseInt(form.duration, 10),
    };

    const result = await createCompetition(input);

    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    router.push("/competitions");
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "var(--brand-dim)",
            color: "var(--brand)",
          }}
        >
          <Icon name="swords" size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>Create competition</h1>
          <div style={{ fontSize: 13, color: "var(--tx-3)", marginTop: 2 }}>
            Challenge friends or open to the league
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        <div className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
          <label style={LABEL_STYLE}>
            Competition name
            <input
              className="input"
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. May Crypto League"
              required
              minLength={3}
              maxLength={60}
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <label style={LABEL_STYLE}>
              Kind
              <select
                style={SELECT_STYLE}
                value={form.kind}
                onChange={(e) => setField("kind", e.target.value as Kind)}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>

            <label style={LABEL_STYLE}>
              Market
              <select
                style={SELECT_STYLE}
                value={form.market}
                onChange={(e) => setField("market", e.target.value as Market)}
              >
                {MARKETS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label style={LABEL_STYLE}>
            Scoring metric
            <select
              style={SELECT_STYLE}
              value={form.metric}
              onChange={(e) => setField("metric", e.target.value as Metric)}
            >
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label style={LABEL_STYLE}>
            Rule set
            <select
              style={SELECT_STYLE}
              value={form.rule}
              onChange={(e) => setField("rule", e.target.value as Rule)}
            >
              {RULES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label style={LABEL_STYLE}>
            Duration (days)
            <input
              className="input"
              type="number"
              value={form.duration}
              onChange={(e) => setField("duration", e.target.value)}
              min={1}
              max={90}
              required
            />
          </label>
        </div>

        {error && (
          <div
            style={{
              padding: "11px 14px",
              borderRadius: "var(--r-sm)",
              background: "var(--loss-dim)",
              border: "1px solid var(--loss-line)",
              color: "var(--loss)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/competitions")}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            style={{ flex: 2 }}
          >
            {submitting ? "Creating…" : "Create competition"}
          </Button>
        </div>
      </form>
    </div>
  );
}

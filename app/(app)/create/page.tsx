"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TradeDir, Market } from "@/types/db";
import { Icon } from "@/components/ui";
import { createPost } from "./actions";

interface FormState {
  title: string;
  body: string;
  symbol: string;
  entry: string;
  rr: string;
  dir: TradeDir;
  market: Market;
  communityId: string;
  tags: string[];
  tagInput: string;
}

interface FormErrors {
  title?: string;
  symbol?: string;
  rr?: string;
}

const SEED_COMMUNITIES = [
  { id: "c1", name: "Order Flow Lab", icon: "⊞", color: "#56A8FF" },
  { id: "c2", name: "Crypto Macro", icon: "◎", color: "#16C784" },
  { id: "c3", name: "Smart Money FX", icon: "◈", color: "#9B5CFF" },
];

const MARKETS: Market[] = ["Crypto", "Forex", "Futures", "Stocks"];

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Headline is required.";
  if (!form.symbol.trim()) errors.symbol = "Symbol is required.";
  const rrNum = parseFloat(form.rr);
  if (form.rr && (isNaN(rrNum) || rrNum <= 0)) errors.rr = "R:R must be a positive number.";
  return errors;
}

export default function CreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: "",
    body: "",
    symbol: "",
    entry: "",
    rr: "",
    dir: "long",
    market: "Crypto",
    communityId: "c2",
    tags: ["BTC", "swing"],
    tagInput: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [publishing, setPublishing] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  function addTag() {
    const trimmed = form.tagInput.trim().replace(/^#/, "");
    if (trimmed && !form.tags.includes(trimmed)) {
      set("tags", [...form.tags, trimmed]);
    }
    set("tagInput", "");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handlePublish() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setPublishing(true);
    try {
      await createPost({
        title: form.title.trim(),
        body: form.body.trim(),
        symbol: form.symbol.trim().toUpperCase(),
        entry: form.entry.trim(),
        rr: parseFloat(form.rr) || 0,
        dir: form.dir,
        market: form.market,
        communityId: form.communityId,
        tags: form.tags,
      });
      router.push("/feed");
    } catch {
      setPublishing(false);
    }
  }

  function handleClose() {
    router.push("/feed");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(5,7,10,0.7)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
      onClick={handleClose}
    >
      <div
        className="fade-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 100%)",
          maxHeight: "90vh",
          background: "var(--bg-float)",
          border: "1px solid var(--line-2)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--sh-3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid var(--line-1)",
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: 18 }}>Share a trade</h2>
          <button className="th-iconbtn" onClick={handleClose}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* scrollable body */}
        <div
          className="scroll"
          style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* headline */}
          <div>
            <input
              className="input"
              placeholder="Add a headline — e.g. BTC reclaim, scaling in"
              style={{ height: 46, fontSize: 15, fontWeight: 600 }}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {errors.title && (
              <div style={{ fontSize: 11.5, color: "var(--loss)", marginTop: 4 }}>
                {errors.title}
              </div>
            )}
          </div>

          {/* chart drop-zone */}
          <div
            className="ph-img"
            style={{
              height: 170,
              borderRadius: "var(--r-md)",
              flexDirection: "column",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <Icon name="image" size={26} />
            <div>Drop a chart screenshot or click to upload</div>
          </div>

          {/* trade data */}
          <div>
            <div className="sec-label" style={{ marginBottom: 9 }}>
              Trade data
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}
            >
              <div>
                <label className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
                  Symbol
                </label>
                <input
                  className="input"
                  placeholder="BTC"
                  style={{ marginTop: 5 }}
                  value={form.symbol}
                  onChange={(e) => set("symbol", e.target.value)}
                />
                {errors.symbol && (
                  <div style={{ fontSize: 11.5, color: "var(--loss)", marginTop: 4 }}>
                    {errors.symbol}
                  </div>
                )}
              </div>
              <div>
                <label className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
                  Entry
                </label>
                <input
                  className="input"
                  placeholder="62,400"
                  style={{ marginTop: 5 }}
                  value={form.entry}
                  onChange={(e) => set("entry", e.target.value)}
                />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
                  R:R
                </label>
                <input
                  className="input"
                  placeholder="3.0"
                  style={{ marginTop: 5 }}
                  value={form.rr}
                  onChange={(e) => set("rr", e.target.value)}
                />
                {errors.rr && (
                  <div style={{ fontSize: 11.5, color: "var(--loss)", marginTop: 4 }}>
                    {errors.rr}
                  </div>
                )}
              </div>
            </div>

            {/* long / short toggle */}
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                className="btn"
                onClick={() => set("dir", "long")}
                style={{
                  flex: 1,
                  color: form.dir === "long" ? "var(--profit)" : "var(--tx-2)",
                  borderColor: form.dir === "long" ? "var(--profit-line)" : "var(--line-2)",
                  background: form.dir === "long" ? "var(--profit-dim)" : "var(--bg-3)",
                }}
              >
                <Icon name="up" size={16} /> Long
              </button>
              <button
                className="btn"
                onClick={() => set("dir", "short")}
                style={{
                  flex: 1,
                  color: form.dir === "short" ? "var(--loss)" : "var(--tx-2)",
                  borderColor: form.dir === "short" ? "var(--loss-line)" : "var(--line-2)",
                  background: form.dir === "short" ? "var(--loss-dim)" : "var(--bg-3)",
                }}
              >
                <Icon name="down" size={16} /> Short
              </button>
            </div>
          </div>

          {/* analysis */}
          <div>
            <div className="sec-label" style={{ marginBottom: 9 }}>
              Analysis
            </div>
            <textarea
              className="input"
              style={{ height: 90, padding: "11px 13px", resize: "none" }}
              placeholder="Your thesis, stop logic and management plan…"
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
            />
          </div>

          {/* market + community */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="sec-label" style={{ marginBottom: 9 }}>
                Market
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {MARKETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => set("market", m)}
                    className={`chip ${form.market === m ? "active" : ""}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="sec-label" style={{ marginBottom: 9 }}>
                Post to
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {SEED_COMMUNITIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => set("communityId", c.id)}
                    className={`chip ${form.communityId === c.id ? "active" : ""}`}
                  >
                    <span style={{ color: c.color }}>{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* tags */}
          <div>
            <div className="sec-label" style={{ marginBottom: 9 }}>
              Tags
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
              {form.tags.map((t) => (
                <button
                  key={t}
                  className="chip tag active"
                  onClick={() => removeTag(t)}
                  type="button"
                >
                  #{t} <Icon name="close" size={11} />
                </button>
              ))}
              <input
                className="input"
                placeholder="Add tag"
                style={{ width: 100, height: 28, padding: "0 9px", fontSize: 11.5 }}
                value={form.tagInput}
                onChange={(e) => set("tagInput", e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
              />
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 22px",
            borderTop: "1px solid var(--line-1)",
            flexShrink: 0,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tx-3)" }}>
            <Icon name="verified" size={15} style={{ color: "var(--t-diamond)" }} /> Verified via
            broker sync
          </span>
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={handleClose} disabled={publishing}>
            Cancel
          </button>
          <button className="btn primary" onClick={handlePublish} disabled={publishing}>
            <Icon name="send" size={15} />
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

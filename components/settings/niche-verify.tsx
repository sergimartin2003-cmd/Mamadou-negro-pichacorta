"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { NICHE_LIST, getNiche } from "@/config/niches";
import { verifyNicheMetrics } from "@/lib/actions/social";

type VerifyState = "idle" | "working" | "done" | "error";

/**
 * CSV-import verification (the MVP every niche spec starts with): paste
 * `métrica,valor` lines, pick the niche, and the per-niche profile gets its
 * verified metrics. OAuth providers plug into the same pipeline later.
 */
export function NicheVerify() {
  const [niche, setNiche] = useState(NICHE_LIST[0].slug);
  const [csv, setCsv] = useState("");
  const [state, setState] = useState<VerifyState>("idle");
  const [message, setMessage] = useState("");

  const nicheModule = getNiche(niche);
  const placeholder = nicheModule.profileMetrics
    .map((m) => `${m.key},${m.label === "MRR" ? "9800" : "valor"}`)
    .join("\n");

  function parseCsv(input: string): Record<string, string> | null {
    const rows = input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(",").map((cell) => cell.trim()));
    if (rows.length === 0 || rows.some((cells) => cells.length < 2 || !cells[0] || !cells[1])) {
      return null;
    }
    return Object.fromEntries(rows.slice(0, 12).map(([k, v]) => [k, v]));
  }

  async function submit() {
    const metrics = parseCsv(csv);
    if (!metrics) {
      setState("error");
      setMessage("Formato inválido. Una línea por métrica: clave,valor");
      return;
    }
    setState("working");
    const res = await verifyNicheMetrics(niche, metrics);
    if (!res.ok) {
      setState("error");
      setMessage(res.message);
      return;
    }
    setState("done");
    setMessage(
      res.persisted
        ? `Métricas de ${nicheModule.name} verificadas (fuente: CSV).`
        : `Verificación simulada (modo demo) para ${nicheModule.name}.`,
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line-1)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Verificar métricas por CSV</div>
        <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 3 }}>
          {nicheModule.verification.description} El import por CSV es la vía rápida; las
          integraciones OAuth llegan a la misma tabla.
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          className="input"
          value={niche}
          onChange={(e) => {
            setNiche(e.target.value as typeof niche);
            setState("idle");
          }}
          style={{ width: "auto", height: 38, padding: "0 12px", fontSize: 13 }}
          aria-label="Nicho a verificar"
        >
          {NICHE_LIST.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.glyph} {n.name}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className="input"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={4}
        placeholder={placeholder}
        style={{ height: "auto", padding: "10px 12px", fontSize: 12.5, fontFamily: "var(--f-mono)", resize: "vertical" }}
        aria-label="Métricas en CSV"
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn primary sm" onClick={submit} disabled={state === "working" || !csv.trim()}>
          <Icon name="verified" size={14} /> {state === "working" ? "Verificando…" : "Verificar"}
        </button>
        {state === "done" && (
          <span style={{ fontSize: 12.5, color: "var(--profit)" }}>✓ {message}</span>
        )}
        {state === "error" && <span style={{ fontSize: 12.5, color: "var(--loss)" }}>{message}</span>}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { createCommunity } from "@/lib/actions/social";

type State = "idle" | "working" | "demo" | "error";

/** Create-a-server flow. Real insert with Supabase; clear demo notice without. */
export function CreateCommunityForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit() {
    if (name.trim().length < 2) return;
    setState("working");
    const res = await createCommunity(name, desc);
    if (!res.ok) {
      setState("error");
      setMessage(res.message);
      return;
    }
    if (!res.persisted) {
      setState("demo");
      setMessage("Comunidad creada (modo demo — se persiste al conectar Supabase).");
      return;
    }
    router.push("/communities");
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
      <Link href="/communities" className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)", textDecoration: "none" }}>
        ← Comunidades
      </Link>
      <div>
        <h1 style={{ fontSize: 24 }}>Crear comunidad</h1>
        <p style={{ color: "var(--tx-3)", fontSize: 14, marginTop: 4 }}>
          Tu servidor con su canal #general. Invita después a quien quieras.
        </p>
      </div>

      <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 14, padding: 22 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="sec-label" style={{ fontSize: 10 }}>Nombre</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Indie Hackers ES"
            maxLength={60}
            style={{ height: 40, fontSize: 14 }}
            autoFocus
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="sec-label" style={{ fontSize: 10 }}>Descripción (opcional)</span>
          <input
            className="input"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="De qué va tu comunidad"
            maxLength={200}
            style={{ height: 40, fontSize: 14 }}
          />
        </label>

        {state === "demo" && <span style={{ fontSize: 12.5, color: "var(--profit)" }}>✓ {message}</span>}
        {state === "error" && <span style={{ fontSize: 12.5, color: "var(--loss)" }}>{message}</span>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Link href="/communities" className="btn">Cancelar</Link>
          <button className="btn primary" onClick={submit} disabled={state === "working" || name.trim().length < 2}>
            <Icon name="plus" size={16} sw={2.4} /> {state === "working" ? "Creando…" : "Crear comunidad"}
          </button>
        </div>
      </div>
    </div>
  );
}

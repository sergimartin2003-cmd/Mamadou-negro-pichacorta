"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { NICHE_LIST } from "@/config/niches";
import { Icon } from "@/components/ui";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"] as const;

const inputStyle: CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  fontSize: 13.5,
  background: "var(--bg-3)",
  border: "1px solid var(--line-1)",
  borderRadius: "var(--r-md)",
  color: "var(--tx-1)",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="sec-label" style={{ fontSize: 10 }}>{label}</span>
      {children}
    </label>
  );
}

export function CreateCourseForm() {
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState(NICHE_LIST[0].slug);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Principiante");
  const [price, setPrice] = useState("0");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div className="card pad" style={{ textAlign: "center", padding: "32px 24px" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 14px", background: "var(--profit-dim)", color: "var(--profit)" }}>
          <Icon name="check" size={24} sw={2.4} />
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 6 }}>Borrador guardado</h2>
        <p style={{ color: "var(--tx-3)", fontSize: 13.5, maxWidth: 420, margin: "0 auto 16px" }}>
          En modo demo no se persiste. Con Supabase configurado, tu curso se guardaría como borrador
          listo para añadir módulos y publicar.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn" onClick={() => setSaved(false)}>Crear otro</button>
          <Link href="/teach" className="btn primary">Volver al panel</Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="card pad"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
      style={{ display: "flex", flexDirection: "column", gap: 16, padding: "24px" }}
    >
      <Field label="Título del curso">
        <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. De 0 a tu primera venta en Shopify" required />
      </Field>
      <Field label="Pitch (una línea)">
        <input style={inputStyle} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Lo que el alumno consigue, en una frase" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Nicho">
          <select style={inputStyle} value={niche} onChange={(e) => setNiche(e.target.value as typeof niche)}>
            {NICHE_LIST.map((n) => (
              <option key={n.slug} value={n.slug}>{n.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Nivel">
          <select style={inputStyle} value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Precio (€)">
          <input style={inputStyle} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </div>
      <Field label="Descripción">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical" }}
          placeholder="Qué van a aprender y por qué tú eres quien debe enseñarlo."
        />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Link href="/teach" className="btn">Cancelar</Link>
        <button type="submit" className="btn primary">Guardar borrador</button>
      </div>
    </form>
  );
}

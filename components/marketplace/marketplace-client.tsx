"use client";

import { useState, useMemo } from "react";
import type { Course, NicheSlug, Profile } from "@/types/db";
import { NICHE_LIST } from "@/config/niches";
import { Icon } from "@/components/ui";
import { CourseCard } from "./course-card";

type NicheFilter = NicheSlug | "all";
type Level = "Todos" | "Principiante" | "Intermedio" | "Avanzado";
type Sort = "Popular" | "Mejor valorados" | "Nuevos" | "Precio: menor" | "Precio: mayor";

const LEVELS: Level[] = ["Todos", "Principiante", "Intermedio", "Avanzado"];
const SORTS: Sort[] = ["Popular", "Mejor valorados", "Nuevos", "Precio: menor", "Precio: mayor"];

interface MarketplaceClientProps {
  courses: Course[];
  instructors: Record<string, Profile>;
}

function sortCourses(list: Course[], sort: Sort): Course[] {
  const out = [...list];
  switch (sort) {
    case "Mejor valorados":
      return out.sort((a, b) => b.rating - a.rating);
    case "Nuevos":
      return out.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
    case "Precio: menor":
      return out.sort((a, b) => a.price - b.price);
    case "Precio: mayor":
      return out.sort((a, b) => b.price - a.price);
    default:
      return out.sort((a, b) => b.students - a.students);
  }
}

export function MarketplaceClient({ courses, instructors }: MarketplaceClientProps) {
  const [niche, setNiche] = useState<NicheFilter>("all");
  const [level, setLevel] = useState<Level>("Todos");
  const [sort, setSort] = useState<Sort>("Popular");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    let list = courses;
    if (niche !== "all") list = list.filter((c) => c.niche === niche);
    if (level !== "Todos") list = list.filter((c) => c.level === level);
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (c) => c.title.toLowerCase().includes(query) || c.tags.some((t) => t.includes(query)),
      );
    }
    return sortCourses(list, sort);
  }, [courses, niche, level, sort, q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* niche filter */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }} role="tablist" aria-label="Filtrar por nicho">
        <Chip label="Todos" glyph="✲" color="var(--brand)" active={niche === "all"} onClick={() => setNiche("all")} />
        {NICHE_LIST.map((n) => (
          <Chip
            key={n.slug}
            label={n.name}
            glyph={n.glyph}
            color={n.color}
            active={niche === n.slug}
            onClick={() => setNiche(n.slug)}
          />
        ))}
      </div>

      {/* level + sort + search */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LEVELS.map((l) => (
            <Chip key={l} label={l} active={level === l} color="var(--t-diamond)" onClick={() => setLevel(l)} />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "0 10px",
            height: 36,
            borderRadius: "var(--r-pill)",
            background: "var(--bg-3)",
            border: "1px solid var(--line-1)",
          }}
        >
          <Icon name="search" size={15} style={{ color: "var(--tx-3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cursos…"
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--tx-1)", fontSize: 13, width: 150 }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="input"
          style={{ width: "auto", height: 36, padding: "0 12px", fontSize: 13 }}
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 12.5, color: "var(--tx-3)" }}>
        {visible.length} {visible.length === 1 ? "curso" : "cursos"}
      </div>

      {visible.length === 0 ? (
        <div className="card pad" style={{ textAlign: "center", color: "var(--tx-3)", fontSize: 13.5 }}>
          No hay cursos que coincidan con tu búsqueda.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(258px, 1fr))", gap: 16 }}>
          {visible.map((course) => (
            <CourseCard key={course.id} course={course} instructor={instructors[course.instructorId]} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ChipProps {
  label: string;
  glyph?: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, glyph, color, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        color: active ? color : "var(--tx-2)",
        background: active ? `color-mix(in srgb, ${color} 16%, transparent)` : "var(--bg-3)",
        border: `1px solid ${active ? `color-mix(in srgb, ${color} 42%, transparent)` : "var(--line-1)"}`,
        borderRadius: "var(--r-pill)",
      }}
    >
      {glyph && (
        <span aria-hidden style={{ fontSize: 13 }}>
          {glyph}
        </span>
      )}
      {label}
    </button>
  );
}

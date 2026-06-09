import Link from "next/link";
import { getCourses } from "@/lib/data/queries";
import { byId } from "@/lib/data/seed";
import { MarketplaceClient } from "@/components/marketplace/marketplace-client";

export default async function MarketplacePage() {
  const courses = await getCourses();

  const instructorIds = [...new Set(courses.map((c) => c.instructorId))];
  const instructors = Object.fromEntries(
    instructorIds.map((id) => [id, byId[id]]).filter(([, v]) => v != null),
  );

  return (
    <div
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "24px 16px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontSize: 24 }}>Marketplace de Cursos</h1>
          <p style={{ color: "var(--tx-3)", fontSize: 14, marginTop: 4, maxWidth: 560 }}>
            Cursos de emprendedores que enseñan lo que de verdad les funciona — con sus números
            encima. Aprende de quien ya lo ha hecho.
          </p>
        </div>
        <Link href="/teach" className="btn">
          Enseña en EmprendeHub
        </Link>
      </div>

      <MarketplaceClient courses={courses} instructors={instructors} />
    </div>
  );
}

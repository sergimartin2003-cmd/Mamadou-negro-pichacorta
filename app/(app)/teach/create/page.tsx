import Link from "next/link";
import { CreateCourseForm } from "@/components/teach/create-course-form";

export default function CreateCoursePage() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
      <Link href="/teach" className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)", textDecoration: "none" }}>
        ← Panel de instructor
      </Link>
      <div>
        <h1 style={{ fontSize: 24 }}>Crear curso</h1>
        <p style={{ color: "var(--tx-3)", fontSize: 14, marginTop: 4 }}>
          Empaqueta lo que sabes. Empieza por lo básico y luego añade los módulos.
        </p>
      </div>
      <CreateCourseForm />
    </div>
  );
}

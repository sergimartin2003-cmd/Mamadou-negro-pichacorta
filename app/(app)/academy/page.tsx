import { redirect } from "next/navigation";
import { DEFAULT_NICHE } from "@/config/niches";

// La academia agrupa los paths por nicho; aterriza en el nicho por defecto.
export default function AcademyIndex() {
  redirect(`/academy/${DEFAULT_NICHE}`);
}

import { redirect } from "next/navigation";
import { DEFAULT_NICHE } from "@/config/niches";

// Los retos son por nicho; aterriza en el nicho por defecto.
export default function RetosIndex() {
  redirect(`/retos/${DEFAULT_NICHE}`);
}

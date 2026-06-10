"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrollFreeCourse } from "@/lib/actions/social";

interface BuyButtonProps {
  courseId: string;
  slug: string;
  price: number;
}

type BuyState = "idle" | "working" | "demo" | "error";

/**
 * Course purchase CTA. Free → instant enrollment (RPC) and into the player.
 * Paid → Stripe Checkout with the price resolved server-side. In demo mode
 * (no Stripe keys) it degrades to opening the player with a clear notice.
 */
export function BuyButton({ courseId, slug, price }: BuyButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<BuyState>("idle");

  async function handleClick() {
    setState("working");

    if (price === 0) {
      await enrollFreeCourse(courseId);
      router.push(`/marketplace/${slug}/learn`);
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.status === 503) {
        // Stripe not configured — demo path straight into the player.
        setState("demo");
        router.push(`/marketplace/${slug}/learn`);
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <button
        className="btn primary"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={handleClick}
        disabled={state === "working"}
      >
        {state === "working"
          ? "Procesando…"
          : price === 0
            ? "Empezar gratis"
            : `Comprar por €${price}`}
      </button>
      {state === "error" && (
        <p style={{ fontSize: 11.5, color: "var(--loss)", textAlign: "center", marginTop: 8 }}>
          No se pudo iniciar el pago. Inténtalo de nuevo.
        </p>
      )}
      {price > 0 && state !== "error" && (
        <p style={{ fontSize: 11.5, color: "var(--tx-4)", textAlign: "center", marginTop: 8 }}>
          Pago seguro con Stripe{state === "demo" ? " — demo sin claves, abriendo el curso" : ""}.
        </p>
      )}
    </>
  );
}

/**
 * Comment seed for the shared feed — deterministic (FNV-1a, no Math.random)
 * so SSR and CSR agree. A handful of voices per post plus one threaded reply.
 */

import type { Comment } from "@/types/db";

const VOICES: ReadonlyArray<readonly [string, string]> = [
  ["u2", "Esto es exactamente lo que significa construir en público. Gracias por los números."],
  ["u4", "¿Qué herramienta usas para el tracking? Me interesa replicarlo."],
  ["u6", "Guardado. El desglose del proceso vale más que el resultado."],
  ["u8", "Mes duro aquí, esto motiva. ¿Cuánto tiempo te llevó llegar a este punto?"],
  ["u3", "Los datos cuadran con lo que veo en mi nicho. Buen aporte."],
  ["u10", "¿Hilo con más detalle? Esto merece una versión larga."],
];

const REPLIES: ReadonlyArray<readonly [string, string]> = [
  ["u1", "Unos 14 meses de iteración constante. Lo difícil fue no rendirse en el 6."],
  ["u5", "+1 — lo publico esta semana con el desglose completo."],
  ["me", "Me apunto a ese hilo también 🙌"],
];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 2–4 top-level comments per post, the first with one threaded reply. */
export function commentsForPost(postId: string): Comment[] {
  const seed = hash(postId);
  const count = 2 + (seed % 3);
  const out: Comment[] = [];

  for (let i = 0; i < count; i++) {
    const [author, body] = VOICES[(seed + i * 7) % VOICES.length];
    out.push({
      id: `${postId}-c${i + 1}`,
      postId,
      author,
      parentId: null,
      body,
      time: `${1 + ((seed >>> (i + 2)) % 9)}h`,
      up: (seed >>> (i + 3)) % 60,
    });
  }

  const [replyAuthor, replyBody] = REPLIES[seed % REPLIES.length];
  out.push({
    id: `${postId}-r1`,
    postId,
    author: replyAuthor,
    parentId: out[0].id,
    body: replyBody,
    time: `${(seed >>> 5) % 50}m`,
    up: (seed >>> 6) % 25,
  });

  return out;
}

# Session notes — 2026-06-09

## Contexto del proyecto
TradeHub: red social competitiva para traders (TradingView + Reddit + Discord +
gamificación Duolingo + ladder esports + pulido estilo Apple). Se partió de un
prototipo SOLO visual (React por CDN + Babel, datos mock, sin build, escritorio)
y se está convirtiendo en una app de producción real.

## Decisiones tomadas esta sesión
- Stack: Next.js 15 (App Router) + React 19 + TS estricto + Tailwind v4
  (tokens.css portado VERBATIM → identidad visual intacta) + Supabase (Auth/DB/
  Storage/Realtime) + TanStack Query + Zustand + Framer Motion + Stripe + PostHog.
- Capa de datos `async` con seed local (demo sin claves) y ruta Supabase real
  → la app compila y corre sin credenciales y se activa al poner las env vars.
- Orquestación por agentes (explorer/implementer/security/reviewer/tester/devops),
  commits por hito (contenedor efímero), build verde como gate.
- Rate limiting in-process por defecto (lib/ratelimit.ts) con upgrade a Upstash.

## Archivos modificados
Toda la app: app/(app)/* (todas las pantallas), app/(auth)/* (login/signup/forgot/
onboarding), app/api/stripe/*, components/{ui,shell,feed,profile,rankings,
competitions,communities,messages,notifications,learning,premium,settings,auth},
lib/{data,domain,auth,supabase,ratelimit}, supabase/migrations/000{1..4}*.sql + seed,
tests/*, configs y README/CI/Vercel.

## Próximos pasos
1. Completar fixes de hardening restantes (middleware, errores genéricos auth,
   webhook idempotente) y polish de UX (feed scopes, communities reset, etc.).
2. Realtime real (Supabase) en chat/DM/notificaciones; persistencia de mutaciones.
3. Integraciones verificadas (broker/prop/TradingView) y Stripe en vivo con claves.

## Notas técnicas importantes
- Ficheros "use server" solo pueden exportar funciones async (schemas zod NO
  exportados desde ellos).
- ChartFrame/equity usan PRNG sembrado (sin Math.random) → sin hydration mismatch.
- RLS validado contra Postgres real; SECURITY DEFINER con search_path fijado.
---

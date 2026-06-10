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

# Session notes — 2026-06-09 (B) · capa multi-nicho

## Pivote arquitectónico (manda sobre el plan "5 verticales con selector")
Una SOLA red social compartida (feed, comunidades, perfiles, mensajes,
notificaciones, follows → globales, SIN columna de nicho). Encima, una capa
COMPETITIVA por nicho (stats del usuario, rangos/tiers, competiciones, retos,
verificación, learning). El selector de nicho vive DENTRO de rankings/
competitions/learning, no en el shell global. "Una red social, muchos ladders."

## Qué se construyó esta sesión
- Contrato de nicho: `lib/niches/types.ts` (`NicheModule`) + 5 módulos en
  `lib/niches/{trading,emprendimiento,real-estate,marketing,crypto}/config.ts`
  + registro `config/niches.ts` (`NICHES`, `NICHE_SLUGS`, `DEFAULT_NICHE`,
  `getNiche`, `isNicheSlug`).
- Motor de tiers parametrizado: `lib/domain/niche-tiers.ts` — el ELO/ladder es
  el MISMO; solo cambian los NOMBRES de tier (Diamond→Whale→Syndicator…).
- Seed competitivo por nicho: `lib/data/niche-seed.ts` — `userNicheStats`
  (una fila por (perfil, nicho): rp, verified, win, delta, métricas de tarjeta),
  posts cross-nicho para el feed único, competiciones y learning por nicho.
  Generación DETERMINISTA (FNV-1a, sin Math.random) → sin hydration mismatch.
- Capa de datos: `getFeed({niche})` (feed único + filtro), `getCompetitions(niche)`,
  `getLearningPaths(niche)`, `getNicheLeaderboard/Profile/Rp/StatsForProfile`.
- Rutas competitivas por nicho: `app/(app)/{rankings,competitions,learning}/[niche]`
  con `generateStaticParams` (5 nichos SSG) + `notFound()` en slug inválido;
  los índices `/rankings|/competitions|/learning` redirigen al nicho por defecto.
- UI: `NicheSelector` (in-section) + `NicheChip`; `NicheCards` (tarjetas de perfil
  por nicho); `RankBadge` con prop `niche` (relabela tier, retrocompatible);
  feed con filtro de nicho + badge de rango contextual; PostCard parametrizado
  (strip de stats por `niche.postStatFields`, trading idéntico a antes).

## Decisiones clave
- `profiles.rp`/`verified` se MANTIENEN como caché denormalizada del nicho
  primario (trading) para no romper el núcleo existente; la fuente de verdad
  por nicho es `userNicheStats` (→ futura tabla `user_niche_stats`).
- `Post`, `Competition`, `LearningPath` ganan campo `niche` (la capa social
  NO se namespacea). `Post.stats?` permite strip por nicho sin tocar el resto.
- Social global intacto: feed/comunidades/DMs/notifs sin columna de nicho.

## Gates (verde)
typecheck ✓ · lint ✓ (solo warnings preexistentes) · build ✓ (5 nichos
prerenderizados SSG en cada sección) · vitest 123/123 (10 nuevos de nicho).

## Próximos pasos
1. Migración real `user_niche_stats` (profile_id, niche, rp, tier, win stats,
   verification ref) + `verified_metrics`/`metric_snapshots` claveados por
   (profile_id, niche); mover rp/verified fuera de `profiles`.
2. Verificación por nicho (MVP CSV/upload/firma) y feature propia de cada nicho
   (deal analyzer, benchmarks+swipe, alpha feed on-chain).
3. PostCard: leer el strip desde `post.metrics` jsonb real; Realtime; gates de
   premium por plan; búsqueda global por nicho.
---

# Session notes — 2026-06-09 (C) · pivote EmprendeHub (Fase 1)

## Pivote de identidad (manda sobre TradeHub)
TradeHub → EmprendeHub: red social de emprendimiento con 8 nichos (+ marketplace
de cursos pendiente). El stack NO cambia. Reconciliación con la capa multi-nicho
previa (5 nichos): se UNIFICA sobre los 8 nichos del pivote reutilizando toda la
infraestructura (registro, rutas `/[niche]`, tarjetas de perfil, feed por nicho).
Trading pasa a ser 1 de los 8.

## Los 8 nichos
ecommerce · saas · contenido · trading · inmobiliario · servicios · amazon ·
dropshipping. Cada uno con color (token `--niche-*`), tagline, glyph, métricas de
perfil, postStatFields, verificación, retos, learning y comunidades semilla.

## Qué se hizo (Fase 1 — identidad, en verde)
- `NicheSlug` (types/db.ts) → los 8 nichos. `Market` (Crypto/Forex/…) se mantiene
  como detalle INTERNO del nicho Trading (no se borra para no romper el núcleo).
- 7 módulos nuevos en `lib/niches/*` + trading; borrados los 4 antiguos.
- `config/niches.ts`: registro de los 8, `DEFAULT_NICHE='ecommerce'`.
- `niche-seed.ts`: `metricsFor` por nicho (€), posts cross-nicho en ES para el
  feed único; generación determinista intacta.
- Rebrand visible → EmprendeHub: layout/metadata, logo, sidebar, landing, pricing,
  auth (login/onboarding/brand-panel), settings. Nav ES (Inicio/Nichos/Rankings/
  Retos/Academia/Mensajes/Perfil). RP→EP, Win→Éxito %, Season PnL→Resultado.
- Tokens CSS `--niche-*` (8). Tiers estándar Bronze→Elite en todos los nichos.
- `tests/domain/niches.test.ts` actualizado a los 8 nichos.

## Gates: typecheck ✓ · lint ✓ · build ✓ (8 nichos SSG por sección) · vitest 123/123.

## Pendiente (Fases 2-5)
- Rutas/páginas nuevas: `/nichos`, `/nichos/[niche]`, `/marketplace` (+detalle +
  `/learn`), `/teach`; renombrar paths `/competitions`→`/retos`, `/learning`→`/academy`.
- Marketplace de cursos: schema (courses/modules/lessons/enrollments/reviews/
  payouts), tipos TS, seed (≥16 cursos), UI (course-card/detail/player/instructor
  dashboard), Stripe Checkout + webhook → enrollment + payout, RLS.
- Migración DB real: `niche_type`, `entrepreneur_stats`, `posts.niche/proof_type/
  business_stage`, `profiles.business_*`.
- Onboarding 5 pasos (nicho + métricas por nicho), features de instructor en premium,
  achievements por nicho, y rebrand de los 10 perfiles base a emprendedores
  (handles afectan rutas `/u/[handle]` → con cuidado).
---

# Session notes — 2026-06-10 · backend real (mutaciones, realtime, premium)

## Qué se construyó (de prototipo visual → arquitectura real, en verde)
- Migración `0005_niches_marketplace.sql`: enum `niche_type` (8), columnas de
  negocio/`niche`/`metrics`/`proof_type` en posts, `user_niche_stats` (fuente de
  verdad del ladder por nicho), `verified_metrics`/`metric_snapshots`, `bookmarks`,
  `user_streaks`, `reports`, `quiz_questions`/`quiz_attempts`, y el marketplace
  completo (`courses`/`course_modules`/`course_lessons`/`course_enrollments`/
  `course_reviews`/`course_payouts`) con triggers (students_count, payout, rating)
  + RPC `enroll_free_course` + RLS estricta en TODAS las tablas nuevas.
- Server actions reales `lib/actions/social.ts`: `votePost` (RPC cast_vote),
  `followProfile` (toggle_follow), `toggleBookmark`, `markNotificationsRead`,
  `joinCompetition`, `enrollFreeCourse`. Validación zod + rate-limit + degradación
  demo (sin claves → no-op, UI optimista). Cableadas: VoteRail, SaveButton (nuevo),
  follow del perfil, comp-card join, notifications mark-all-read.
- Realtime: hook `lib/supabase/use-realtime-inserts.ts` (postgres_changes, RLS,
  no-op en demo). Activo en chat de comunidades (`channel_messages`) y en
  notificaciones (`notifications`).
- Premium real: `lib/auth/plan.ts` (`getPlanTier`/`planAtLeast`, lee subscriptions),
  gate de `/teach` por plan Pro, Stripe Customer Portal `/api/stripe/portal`.
  Webhook corregido (bug real: escribía `user_id`/`updated_at` inexistentes y no
  guardaba `plan` → premium nunca se activaba): ahora `profile_id`, `plan` desde
  metadata, `current_period_end` robusto entre versiones de Stripe, plan→free al
  cancelar.

## Gates: typecheck ✓ · lint ✓ · build ✓ (+/api/stripe/portal) · vitest 123/123.

## Pendiente
- DM realtime (mismo hook, falta thread_id real), persistencia de crear-post/DM,
  quizzes UI + XP/streaks, verificación por nicho (CSV/upload/OAuth), checkout
  Stripe de cursos (price dinámico) → enrollment, búsqueda global, moderación UI.
- Aplicar la migración a un Supabase real y poblar `user_niche_stats` desde el seed.
---

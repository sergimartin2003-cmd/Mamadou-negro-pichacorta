# EmprendeHub — Guía de puesta en producción

La app compila y corre **sin ninguna clave** (modo demo con datos seed). Al rellenar
las variables de `.env.local` (copia de `.env.example`), cada sistema se activa
solo: auth, base de datos, realtime, pagos y analytics.

---

## 1 · Tabla de claves a rellenar

| # | Variable | Servicio | Obligatoria | Qué activa |
|---|----------|----------|-------------|------------|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | Supabase | ✅ Sí | Base de datos, auth, realtime |
| 2 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | ✅ Sí | Cliente público (RLS aplica) |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | Supabase | ✅ Sí | Webhook Stripe → escribe suscripciones/enrollments |
| 4 | `STRIPE_SECRET_KEY` | Stripe | Para cobrar | Checkout de planes y cursos, Customer Portal |
| 5 | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Para cobrar | Cliente de Stripe en el navegador |
| 6 | `STRIPE_WEBHOOK_SECRET` | Stripe | Para cobrar | Verifica la firma del webhook (seguridad) |
| 7 | `STRIPE_PRICE_PRO` | Stripe | Para cobrar | Precio de la suscripción Pro |
| 8 | `STRIPE_PRICE_ELITE` | Stripe | Para cobrar | Precio de la suscripción Elite |
| 9 | `NEXT_PUBLIC_APP_URL` | Tu dominio | ✅ Sí (prod) | Redirects de checkout y links absolutos |
| 10 | `NEXT_PUBLIC_POSTHOG_KEY` | PostHog | Opcional | Analytics de producto |
| 11 | `NEXT_PUBLIC_POSTHOG_HOST` | PostHog | Opcional | Host de PostHog (default US) |
| 12 | `UPSTASH_REDIS_REST_URL` | Upstash | Opcional | Rate limiting compartido entre instancias |
| 13 | `UPSTASH_REDIS_REST_TOKEN` | Upstash | Opcional | Token del Redis anterior |

---

## 2 · Cómo sacar cada clave, paso a paso

### Supabase (claves 1–3)
1. Entra en <https://supabase.com> → **Start your project** → crea cuenta (GitHub vale).
2. **New project** → elige organización, nombre (`emprendehub`), contraseña de DB
   (guárdala) y región (eu-west para España). Espera ~2 min a que provisione.
3. En el panel: **Project Settings (engranaje) → API**:
   - `Project URL` → pégala en `NEXT_PUBLIC_SUPABASE_URL`.
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `service_role` (pulsa *Reveal*) → `SUPABASE_SERVICE_ROLE_KEY`.
     ⚠️ La service_role **nunca** va en el cliente ni en un repo público.
4. Aplica el schema: **SQL Editor → New query** y ejecuta EN ORDEN el contenido de
   `supabase/migrations/0001…0006` (uno por uno). Después `supabase/seed.sql` si
   quieres contenido inicial.
5. Activa Realtime: **Database → Replication → supabase_realtime** y añade las
   tablas `channel_messages`, `dm_messages`, `notifications`.
6. Auth por email ya viene activo. Para OAuth: **Authentication → Providers** →
   activa Google/Apple/Discord/X y pega el Client ID/Secret de cada consola de
   desarrollador (cada provider te pide crear una app en su plataforma; Supabase
   te muestra la *Redirect URL* exacta que debes registrar allí).

### Stripe (claves 4–8)
1. Crea cuenta en <https://dashboard.stripe.com/register> (modo Test para probar).
2. **Developers → API keys**:
   - `Secret key` (`sk_test_…`) → `STRIPE_SECRET_KEY`.
   - `Publishable key` (`pk_test_…`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Crea los planes: **Product catalog → Add product**:
   - "EmprendeHub Pro" → precio recurrente mensual (p. ej. 19 €) → guarda y copia
     el **Price ID** (`price_…`) → `STRIPE_PRICE_PRO`.
   - "EmprendeHub Elite" → ídem (p. ej. 49 €) → `STRIPE_PRICE_ELITE`.
   - (Los cursos NO necesitan producto: el checkout usa precio dinámico.)
4. Webhook: **Developers → Webhooks → Add endpoint**:
   - URL: `https://TU-DOMINIO/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`.
   - Tras crearlo, copia el **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.
   - En local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
     (el CLI te imprime un `whsec_…` temporal).
5. Activa el **Customer Portal**: Settings → Billing → Customer portal → Activate.

### Dominio / Vercel (clave 9)
1. <https://vercel.com> → **Add New → Project** → importa el repo de GitHub.
2. En **Environment Variables** pega TODAS las variables de esta guía.
3. Deploy. Tu URL (p. ej. `https://emprendehub.vercel.app` o tu dominio) →
   `NEXT_PUBLIC_APP_URL`. Vuelve a desplegar tras fijarla.

### PostHog (claves 10–11, opcional)
1. <https://posthog.com> → cuenta gratis → crea proyecto.
2. **Settings → Project → Project API Key** → `NEXT_PUBLIC_POSTHOG_KEY`.
3. Si elegiste cloud EU: `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.

### Upstash (claves 12–13, opcional)
1. <https://upstash.com> → cuenta gratis → **Create Database** (Redis, región
   cercana a tu deploy).
2. En la pestaña **REST API**: copia `UPSTASH_REDIS_REST_URL` y
   `UPSTASH_REDIS_REST_TOKEN`. Sin esto, el rate limiting funciona igual pero
   por instancia (suficiente para empezar).

---

## 3 · Checklist final antes de lanzar

- [ ] Migraciones 0001–0006 aplicadas en Supabase sin errores.
- [ ] Realtime activado en `channel_messages`, `dm_messages`, `notifications`.
- [ ] Variables en Vercel (Production) y redeploy hecho.
- [ ] Webhook de Stripe apuntando al dominio final y firma verificada
      (Developers → Webhooks → el evento de prueba responde 200).
- [ ] Compra de prueba con tarjeta `4242 4242 4242 4242` (modo Test): el plan
      se activa en Settings y un curso de pago crea enrollment + payout.
- [ ] OAuth providers con la Redirect URL del dominio final.
- [ ] `npm run build` verde en CI.

## 4 · Qué queda fuera de esta versión (siguiente iteración)

- Lectura real de Supabase en las queries de lectura (hoy: seed también con
  claves; las ESCRITURAS sí son reales) y poblar `user_niche_stats` desde el seed.
- Integraciones OAuth de verificación (Stripe Connect, Meta/Google Ads, broker,
  wallet) — el import CSV ya escribe en `verified_metrics`.
- Email transaccional (Resend/SendGrid) y Web Push.
- Subida de avatar/imágenes a Storage; moderación con panel de admin.
- E2E (Playwright) y cron de temporadas/benchmarks.

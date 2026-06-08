# TradeHub — Supabase backend

Production Postgres schema, Row Level Security, triggers/RPCs, and a dev seed
for TradeHub: a competitive social network for traders (feed, communities,
DMs, competitions, learning paths, achievements, leaderboards).

```
supabase/
├── migrations/
│   ├── 0001_schema.sql          extensions · enums · tables · indexes · tier_for_rp() · leaderboard_global view
│   ├── 0002_rls.sql             RLS on every table · public-read catalog · owner-scoped writes
│   └── 0003_triggers_rpcs.sql   handle_new_user · cast_vote · toggle_follow · join_competition · award_xp · count triggers
└── seed.sql                     10 traders + "me", posts, communities, channels, comps, paths, lessons, achievements, notifications
```

Target: **Postgres 15 / Supabase**. Extensions used: `pgcrypto`, `citext`.

---

## 1. Create the project

1. Create a project at <https://app.supabase.com>.
2. Note the **Project URL** and the API keys (Project Settings → API).

## 2. Environment variables

Set these in your app (`.env.local`) and in your hosting provider. Never expose
the service-role key to the browser.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-side only
```

## 3. Run the migrations (in order)

Migrations are plain SQL and **must run in numeric order**. The schema is
idempotent on enums/types only via fresh-DB assumptions, so apply to a clean
database.

### Option A — Supabase CLI (recommended)

```bash
supabase link --project-ref <project-ref>
supabase db push          # applies everything in supabase/migrations/*
```

### Option B — SQL editor

Open the SQL editor and run, one after another:

1. `migrations/0001_schema.sql`
2. `migrations/0002_rls.sql`
3. `migrations/0003_triggers_rpcs.sql`

## 4. Load the dev seed

`seed.sql` writes demo content for a development project. It inserts minimal
`auth.users` rows first (using fixed UUIDs) so the `profiles → auth.users` FK
resolves, then the demo profiles and all related data.

- Writing `auth.users` requires elevated rights. Run the seed as the
  **service role**: paste it in the **SQL editor** (which runs privileged), or:

  ```bash
  psql "$SUPABASE_DB_URL" -f supabase/seed.sql
  ```

- The seed is **idempotent** — every statement uses `ON CONFLICT ... DO NOTHING`
  (or upsert), so re-running it is safe.
- **Do not run the seed in production.** Real users come from `handle_new_user`
  (see §8). The seeded `auth.users` rows have no password/identity and exist
  only to satisfy the FK for demo data.

## 5. Auth providers

Authentication → Providers. Enable and configure:

| Provider     | Notes |
|--------------|-------|
| Email        | Enable "Confirm email" for production. |
| Google       | OAuth client ID + secret from Google Cloud. |
| Apple        | Services ID + key (Sign in with Apple). |
| Discord      | Client ID + secret from the Discord developer portal. |
| Twitter / X  | API key + secret (OAuth 2.0). |

**Redirect URLs** (Authentication → URL Configuration):

- Site URL: `https://your-app.com`
- Additional redirect URLs:
  - `https://your-app.com/auth/callback`
  - `http://localhost:3000/auth/callback` (local dev)

On the provider side, set the callback to:
`https://<project-ref>.supabase.co/auth/v1/callback`.

## 6. Storage buckets

Storage → Create bucket. Create two **public** buckets:

| Bucket    | Public | Use |
|-----------|--------|-----|
| `avatars` | yes    | Profile avatars. |
| `charts`  | yes    | Trade chart screenshots attached to posts / messages. |

Public read is on by default for public buckets. Restrict **writes** to the
owning user with these policies (Storage → Policies → New policy on
`storage.objects`). The convention is that the first path segment is the
owner's UID, e.g. `avatars/<uid>/me.png`.

```sql
-- avatars: anyone can read; only the owner may write to their own folder
create policy "avatars_read_all"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "avatars_write_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- charts: same shape, bucket_id = 'charts'
create policy "charts_read_all"
  on storage.objects for select
  using ( bucket_id = 'charts' );

create policy "charts_write_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'charts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "charts_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'charts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "charts_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'charts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 7. Realtime

Database → Replication → `supabase_realtime` publication. Add these tables so
live screens (community chat, DMs, the bell, competition brackets) update
without polling:

- `channel_messages`
- `dm_messages`
- `notifications`
- `competition_entries`

Equivalent SQL:

```sql
alter publication supabase_realtime add table channel_messages;
alter publication supabase_realtime add table dm_messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table competition_entries;
```

RLS still applies to realtime: a client only receives rows it is allowed to
`SELECT` (DM/channel policies gate this automatically).

## 8. How profiles are created automatically

`handle_new_user()` (in `0003_triggers_rpcs.sql`) is an `AFTER INSERT` trigger on
`auth.users`. The moment a user signs up (any provider), it provisions:

- a `profiles` row — `id = auth.users.id`; `handle` from
  `raw_user_meta_data.handle`, falling back to `trader_<first-8-of-uid>`;
- an empty `trader_stats` row;
- a `subscriptions` row on the `free` plan.

The function is `SECURITY DEFINER` with `search_path = public` pinned, so it
runs regardless of the caller's RLS. Pass a desired handle at sign-up via
`options.data.handle` and it is used verbatim.

## 9. Server-side helpers (RPCs)

Call these from the client with `supabase.rpc(...)`. Each is `SECURITY DEFINER`,
pins `search_path = public`, and rejects unauthenticated callers
(`auth.uid()` must be non-null):

| RPC | Signature | Effect |
|-----|-----------|--------|
| `cast_vote`       | `(p_post uuid, p_value smallint)` | Upsert the caller's vote; recompute `posts.upvotes/downvotes`. |
| `toggle_follow`   | `(p_target uuid) → boolean`       | Follow/unfollow; maintain follower/following counts. Returns `true` if now following. |
| `join_competition`| `(p_comp uuid)`                   | Insert an entry; bump `participants_count`. |
| `award_xp`        | `(p_amount int, p_reason text)`   | Record an `xp_events` row for the caller. |

`comments_count` and `members_count` are kept current by row triggers — no app
code required.

## 10. Security model (summary)

- **RLS is enabled on every table.** Default deny; policies grant the minimum.
- **Public read**, anon + authenticated: profiles, posts, post_tags, comments,
  communities, channels, competitions, competition_entries, learning_paths,
  lessons, achievements, and the leaderboard data they back.
- **Owner-scoped writes** pinned to `auth.uid()`:
  - `posts` / `comments` — author only.
  - `post_votes` / `follows` / `lesson_progress` / `profile_achievements` — owner only.
  - `notifications` / `subscriptions` / `broker_connections` / `xp_events` — owner only.
  - `profiles` — a user may update only their own row.
- **Membership-gated**: `channel_messages` are readable/insertable only by
  members of the channel's community (and the author must be the caller).
- **Private by participation**: `dm_threads` / `dm_participants` / `dm_messages`
  are visible only to the thread's participants.
- Stripe-driven columns on `subscriptions` are written by the service role
  (e.g. from a webhook handler), never by the browser.

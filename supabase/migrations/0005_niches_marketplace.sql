-- ============================================================
-- EmprendeHub — Niche competitive layer + course marketplace
-- 0005_niches_marketplace.sql
--
-- Architecture: the social layer (profiles, posts, communities,
-- DMs, notifications) stays SHARED — no niche namespacing. Only
-- the competitive layer is per-niche: user_niche_stats is the
-- per-(profile, niche) source of truth for rp/verified; the
-- legacy profiles.rp/verified stay as a denormalized cache of
-- the primary niche so the existing core keeps working.
-- ============================================================

-- ------------------------------------------------------------
-- ENUM: the eight EmprendeHub niches
-- ------------------------------------------------------------
create type niche_type as enum (
  'ecommerce',
  'saas',
  'contenido',
  'trading',
  'inmobiliario',
  'servicios',
  'amazon',
  'dropshipping'
);

-- ------------------------------------------------------------
-- PROFILES — business identity (niche is per-row in stats)
-- ------------------------------------------------------------
alter table profiles add column primary_niche  niche_type;
alter table profiles add column business_name  text;
alter table profiles add column business_url   text;

-- ------------------------------------------------------------
-- POSTS — niche is a filterable TAG on the single shared feed,
-- never a separate feed. metrics drives the per-niche stat strip.
-- ------------------------------------------------------------
alter table posts add column niche          niche_type;
alter table posts add column metrics        jsonb;
alter table posts add column proof_type     text
  check (proof_type in ('screenshot','video','verified','none'));
alter table posts add column business_stage text
  check (business_stage in ('idea','prerevenue','early','scaling','established'));

create index idx_posts_niche_created on posts (niche, created_at desc);

-- ------------------------------------------------------------
-- USER_NICHE_STATS — one row per (profile, niche). The per-niche
-- ladder: rp/tier/verified/win live HERE; metrics jsonb feeds the
-- profile niche cards (labels come from the niche module in TS).
-- ------------------------------------------------------------
create table user_niche_stats (
  profile_id   uuid not null references profiles (id) on delete cascade,
  niche        niche_type not null,
  rp           integer not null default 1000,
  verified     boolean not null default false,
  win          numeric,
  season_delta numeric,
  metrics      jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  primary key (profile_id, niche)
);

create index idx_user_niche_stats_ladder on user_niche_stats (niche, rp desc);

create trigger trg_user_niche_stats_updated_at
  before update on user_niche_stats
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- VERIFICATION — per (profile, niche). Source-level connection
-- data is sensitive: owner-only via RLS, leaderboards read the
-- public user_niche_stats instead.
-- ------------------------------------------------------------
create table verified_metrics (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profiles (id) on delete cascade,
  niche          niche_type not null,
  source         text not null, -- 'stripe' | 'shopify' | 'broker' | 'csv' | 'docs' | 'ads' | ...
  payload        jsonb not null default '{}'::jsonb,
  verified       boolean not null default false,
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  unique (profile_id, niche, source)
);

create table metric_snapshots (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  niche      niche_type not null,
  day        date not null,
  value      numeric,
  payload    jsonb not null default '{}'::jsonb,
  unique (profile_id, niche, day)
);

create index idx_metric_snapshots_series on metric_snapshots (profile_id, niche, day);

-- ------------------------------------------------------------
-- BOOKMARKS / STREAKS / REPORTS — platform basics
-- ------------------------------------------------------------
create table bookmarks (
  profile_id uuid not null references profiles (id) on delete cascade,
  post_id    uuid not null references posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, post_id)
);

create table user_streaks (
  profile_id         uuid primary key references profiles (id) on delete cascade,
  current_streak     integer not null default 0,
  longest_streak     integer not null default 0,
  last_activity_date date
);

create table reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post','user','message','course')),
  target_id   uuid not null,
  reason      text,
  status      text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at  timestamptz not null default now()
);

create index idx_reports_status on reports (status, created_at desc);

-- ------------------------------------------------------------
-- QUIZZES — XP-earning questions attached to lessons
-- ------------------------------------------------------------
create table quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null references lessons (id) on delete cascade,
  position      integer not null default 1,
  prompt        text not null,
  options       jsonb not null, -- array of strings
  correct_index integer not null,
  xp            integer not null default 10
);

create index idx_quiz_questions_lesson on quiz_questions (lesson_id, position);

create table quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles (id) on delete cascade,
  question_id  uuid not null references quiz_questions (id) on delete cascade,
  answer_index integer not null,
  correct      boolean not null,
  created_at   timestamptz not null default now()
);

create index idx_quiz_attempts_profile on quiz_attempts (profile_id, created_at desc);

-- ------------------------------------------------------------
-- MARKETPLACE — courses sold by instructors (profiles)
-- ------------------------------------------------------------
create table courses (
  id             uuid primary key default gen_random_uuid(),
  instructor_id  uuid not null references profiles (id) on delete cascade,
  slug           citext unique not null,
  title          text not null,
  tagline        text,
  description    text,
  niche          niche_type not null,
  level          text not null default 'Principiante'
    check (level in ('Principiante','Intermedio','Avanzado')),
  format         text not null default 'video'
    check (format in ('video','texto','mixto','cohort')),
  price          numeric not null default 0 check (price >= 0),
  original_price numeric check (original_price > 0),
  duration_hours numeric,
  language       char(2) not null default 'es',
  certificate    boolean not null default false,
  what_you_learn text[] not null default '{}',
  requirements   text[] not null default '{}',
  tags           text[] not null default '{}',
  status         text not null default 'borrador'
    check (status in ('borrador','revision','publicado','archivado')),
  payout_rate    numeric not null default 0.7 check (payout_rate between 0 and 1),
  students_count integer not null default 0,
  rating         numeric not null default 0,
  reviews_count  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_courses_niche_status on courses (niche, status);
create index idx_courses_instructor   on courses (instructor_id);

create trigger trg_courses_updated_at
  before update on courses
  for each row execute function set_updated_at();

create table course_modules (
  id        uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  n         integer not null,
  title     text not null,
  unique (course_id, n)
);

create table course_lessons (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references course_modules (id) on delete cascade,
  n            integer not null,
  title        text not null,
  duration_min integer,
  format       text not null default 'video'
    check (format in ('video','texto','quiz','ejercicio')),
  free_preview boolean not null default false,
  content_url  text,
  unique (module_id, n)
);

create table course_enrollments (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profiles (id) on delete cascade,
  course_id      uuid not null references courses (id) on delete cascade,
  price_paid     numeric not null default 0,
  progress_pct   numeric not null default 0 check (progress_pct between 0 and 100),
  last_lesson_id uuid references course_lessons (id) on delete set null,
  completed      boolean not null default false,
  completed_at   timestamptz,
  enrolled_at    timestamptz not null default now(),
  unique (profile_id, course_id)
);

create index idx_course_enrollments_course on course_enrollments (course_id);

create table course_reviews (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid not null references courses (id) on delete cascade,
  author_id         uuid not null references profiles (id) on delete cascade,
  rating            integer not null check (rating between 1 and 5),
  body              text,
  verified_purchase boolean not null default true,
  helpful_count     integer not null default 0,
  created_at        timestamptz not null default now(),
  unique (course_id, author_id)
);

create index idx_course_reviews_course on course_reviews (course_id, created_at desc);

create table course_payouts (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses (id) on delete cascade,
  instructor_id uuid not null references profiles (id) on delete cascade,
  enrollment_id uuid not null references course_enrollments (id) on delete cascade,
  amount        numeric not null check (amount >= 0),
  status        text not null default 'pending' check (status in ('pending','paid')),
  created_at    timestamptz not null default now()
);

create index idx_course_payouts_instructor on course_payouts (instructor_id, status);

-- ------------------------------------------------------------
-- TRIGGERS — marketplace aggregate maintenance
-- ------------------------------------------------------------

-- students_count + instructor payout row on every enrollment.
create or replace function on_course_enrollment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course courses%rowtype;
begin
  select * into v_course from courses where id = new.course_id;

  update courses
     set students_count = students_count + 1
   where id = new.course_id;

  if new.price_paid > 0 then
    insert into course_payouts (course_id, instructor_id, enrollment_id, amount)
    values (new.course_id, v_course.instructor_id, new.id,
            round(new.price_paid * v_course.payout_rate, 2));
  end if;

  return new;
end;
$$;

create trigger trg_course_enrollment
  after insert on course_enrollments
  for each row execute function on_course_enrollment();

-- rating / reviews_count recompute on review changes.
create or replace function refresh_course_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course uuid;
begin
  v_course := coalesce(new.course_id, old.course_id);
  update courses c
     set rating        = coalesce((select round(avg(r.rating)::numeric, 2)
                                     from course_reviews r where r.course_id = v_course), 0),
         reviews_count = (select count(*) from course_reviews r where r.course_id = v_course)
   where c.id = v_course;
  return coalesce(new, old);
end;
$$;

create trigger trg_course_reviews_refresh
  after insert or update or delete on course_reviews
  for each row execute function refresh_course_rating();

-- ------------------------------------------------------------
-- RPC: enroll_free_course — self-service enrollment for free
-- courses only. Paid enrollments are created exclusively by the
-- Stripe webhook (service role), never from the client.
-- ------------------------------------------------------------
create or replace function enroll_free_course(p_course uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid;
  v_price numeric;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select price into v_price from courses
   where id = p_course and status = 'publicado';
  if v_price is null then
    raise exception 'course_not_found';
  end if;
  if v_price > 0 then
    raise exception 'course_not_free';
  end if;

  insert into course_enrollments (profile_id, course_id, price_paid)
  values (v_uid, p_course, 0)
  on conflict (profile_id, course_id) do nothing;

  return true;
end;
$$;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table user_niche_stats   enable row level security;
alter table verified_metrics   enable row level security;
alter table metric_snapshots   enable row level security;
alter table bookmarks          enable row level security;
alter table user_streaks       enable row level security;
alter table reports            enable row level security;
alter table quiz_questions     enable row level security;
alter table quiz_attempts      enable row level security;
alter table courses            enable row level security;
alter table course_modules     enable row level security;
alter table course_lessons     enable row level security;
alter table course_enrollments enable row level security;
alter table course_reviews     enable row level security;
alter table course_payouts     enable row level security;

-- user_niche_stats — public read (ladders), owner-only write.
create policy uns_select_all on user_niche_stats
  for select using (true);
create policy uns_insert_own on user_niche_stats
  for insert with check (auth.uid() = profile_id);
create policy uns_update_own on user_niche_stats
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- verified_metrics / metric_snapshots — owner only (connection
-- data is sensitive; public credibility reads user_niche_stats).
create policy vm_all_own on verified_metrics
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy ms_all_own on metric_snapshots
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- bookmarks / streaks — owner only.
create policy bookmarks_all_own on bookmarks
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy streaks_all_own on user_streaks
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- reports — reporters create and see their own; the moderation
-- queue is read with the service role (never the anon client).
create policy reports_insert_own on reports
  for insert with check (auth.uid() = reporter_id);
create policy reports_select_own on reports
  for select using (auth.uid() = reporter_id);

-- quizzes — questions are public catalog; attempts owner-only.
create policy quizq_select_all on quiz_questions
  for select using (true);
create policy quiza_insert_own on quiz_attempts
  for insert with check (auth.uid() = profile_id);
create policy quiza_select_own on quiz_attempts
  for select using (auth.uid() = profile_id);

-- courses — published are public; instructors manage their own.
create policy courses_select_published on courses
  for select using (status = 'publicado' or auth.uid() = instructor_id);
create policy courses_insert_own on courses
  for insert with check (auth.uid() = instructor_id);
create policy courses_update_own on courses
  for update using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);
create policy courses_delete_own on courses
  for delete using (auth.uid() = instructor_id);

-- modules/lessons — readable when the parent course is visible;
-- writable by the course instructor. (Lesson VIDEO assets live in
-- Storage behind enrollment-scoped policies; rows here are the
-- public curriculum metadata.)
create policy cmod_select_visible on course_modules
  for select using (exists (
    select 1 from courses c
     where c.id = course_id
       and (c.status = 'publicado' or c.instructor_id = auth.uid())
  ));
create policy cmod_write_own on course_modules
  for all using (exists (
    select 1 from courses c where c.id = course_id and c.instructor_id = auth.uid()
  )) with check (exists (
    select 1 from courses c where c.id = course_id and c.instructor_id = auth.uid()
  ));

create policy cles_select_visible on course_lessons
  for select using (exists (
    select 1 from course_modules m
    join courses c on c.id = m.course_id
   where m.id = module_id
     and (c.status = 'publicado' or c.instructor_id = auth.uid())
  ));
create policy cles_write_own on course_lessons
  for all using (exists (
    select 1 from course_modules m
    join courses c on c.id = m.course_id
   where m.id = module_id and c.instructor_id = auth.uid()
  )) with check (exists (
    select 1 from course_modules m
    join courses c on c.id = m.course_id
   where m.id = module_id and c.instructor_id = auth.uid()
  ));

-- enrollments — students see their own; instructors see their
-- courses' enrollments. INSERTS only via enroll_free_course RPC
-- or the Stripe webhook (service role) — no direct client insert.
create policy enroll_select_own on course_enrollments
  for select using (
    auth.uid() = profile_id
    or exists (select 1 from courses c where c.id = course_id and c.instructor_id = auth.uid())
  );
create policy enroll_update_own on course_enrollments
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- reviews — public read; only enrolled students write their own.
create policy crev_select_all on course_reviews
  for select using (true);
create policy crev_insert_enrolled on course_reviews
  for insert with check (
    auth.uid() = author_id
    and exists (select 1 from course_enrollments e
                 where e.course_id = course_reviews.course_id
                   and e.profile_id = auth.uid())
  );
create policy crev_update_own on course_reviews
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy crev_delete_own on course_reviews
  for delete using (auth.uid() = author_id);

-- payouts — instructor read-only; written by triggers/webhook.
create policy payouts_select_own on course_payouts
  for select using (auth.uid() = instructor_id);

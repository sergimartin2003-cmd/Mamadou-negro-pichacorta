-- ============================================================
-- TradeHub — Production schema (Supabase / Postgres 15)
-- 0001_schema.sql — extensions, enums, tables, indexes,
--                   functions, triggers, views
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type market_type           as enum ('crypto','forex','futures','stocks');
create type trade_dir             as enum ('long','short');
create type trade_result          as enum ('win','loss','open');
create type competition_kind      as enum ('seasonal','battle','friends');
create type competition_status    as enum ('upcoming','live','finished');
create type lesson_state          as enum ('locked','current','done');
create type notif_type            as enum ('rank','like','comp','comment','follow','tier','system');
create type plan_tier             as enum ('free','pro','elite');
create type tier_key              as enum ('bronze','silver','gold','platinum','diamond','master','elite');
create type user_role             as enum ('user','mod','admin');
create type channel_kind          as enum ('text','voice');
create type connection_provider   as enum ('tradingview','broker','propfirm','exchange','csv');
create type connection_status     as enum ('pending','connected','error');

-- ------------------------------------------------------------
-- CORE: profiles + stats
-- ------------------------------------------------------------
create table profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  handle           citext unique not null,
  display_name     text,
  bio              text,
  country          char(2),
  flag             text,
  market           market_type,
  verified         boolean not null default false,
  avatar_from      text,
  avatar_to        text,
  role             user_role not null default 'user',
  rp               integer not null default 1000,
  followers_count  integer not null default 0,
  following_count  integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table trader_stats (
  profile_id     uuid primary key references profiles (id) on delete cascade,
  win_rate       numeric,
  total_pnl_pct  numeric,
  trades_count   integer not null default 0,
  max_drawdown   numeric,
  consistency    integer,
  win_streak     integer,
  sharpe         numeric,
  profit_factor  numeric,
  avg_rr         numeric,
  updated_at     timestamptz not null default now()
);

create table broker_connections (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profiles (id) on delete cascade,
  provider       connection_provider not null,
  status         connection_status not null default 'pending',
  label          text,
  last_synced_at timestamptz,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SEASONS
-- ------------------------------------------------------------
create table seasons (
  id         uuid primary key default gen_random_uuid(),
  number     integer,
  name       text,
  starts_at  timestamptz,
  ends_at    timestamptz,
  status     competition_status,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- POSTS / SOCIAL
-- ------------------------------------------------------------
create table posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references profiles (id) on delete cascade,
  market         market_type,
  dir            trade_dir,
  symbol         text,
  title          text,
  body           text,
  rr             numeric,
  pnl            numeric,
  result         trade_result,
  chart_label    text,
  upvotes        integer not null default 0,
  downvotes      integer not null default 0,
  comments_count integer not null default 0,
  created_at     timestamptz not null default now()
);

create table post_tags (
  post_id uuid not null references posts (id) on delete cascade,
  tag     citext not null,
  primary key (post_id, tag)
);

create table post_votes (
  post_id    uuid not null references posts (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  author_id  uuid not null references profiles (id) on delete cascade,
  parent_id  uuid references comments (id) on delete cascade,
  body       text,
  created_at timestamptz not null default now()
);

create table follows (
  follower_id  uuid not null references profiles (id) on delete cascade,
  following_id uuid not null references profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ------------------------------------------------------------
-- COMMUNITIES / CHANNELS / CHAT
-- ------------------------------------------------------------
create table communities (
  id             uuid primary key default gen_random_uuid(),
  slug           citext unique not null,
  name           text,
  market         market_type,
  icon           text,
  color          text,
  description    text,
  members_count  integer not null default 0,
  is_premium     boolean not null default false,
  owner_id       uuid references profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);

create table community_members (
  community_id uuid not null references communities (id) on delete cascade,
  profile_id   uuid not null references profiles (id) on delete cascade,
  role         user_role not null default 'user',
  created_at   timestamptz not null default now(),
  primary key (community_id, profile_id)
);

create table channels (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities (id) on delete cascade,
  name         citext not null,
  kind         channel_kind not null default 'text',
  position     integer,
  created_at   timestamptz not null default now()
);

create table channel_messages (
  id          uuid primary key default gen_random_uuid(),
  channel_id  uuid not null references channels (id) on delete cascade,
  author_id   uuid not null references profiles (id) on delete cascade,
  body        text,
  chart_label text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- DIRECT MESSAGES
-- ------------------------------------------------------------
create table dm_threads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table dm_participants (
  thread_id  uuid not null references dm_threads (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  primary key (thread_id, profile_id)
);

create table dm_messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references dm_threads (id) on delete cascade,
  author_id  uuid not null references profiles (id) on delete cascade,
  body       text,
  file_name  text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- COMPETITIONS
-- ------------------------------------------------------------
create table competitions (
  id                 uuid primary key default gen_random_uuid(),
  name               text,
  kind               competition_kind not null,
  market             market_type,
  metric             text,
  rule               text,
  prize              text,
  participants_count integer not null default 0,
  season_id          uuid references seasons (id) on delete set null,
  starts_at          timestamptz,
  ends_at            timestamptz,
  status             competition_status,
  created_at         timestamptz not null default now()
);

create table competition_entries (
  competition_id uuid not null references competitions (id) on delete cascade,
  profile_id     uuid not null references profiles (id) on delete cascade,
  score          numeric not null default 0,
  rank           integer,
  joined_at      timestamptz not null default now(),
  primary key (competition_id, profile_id)
);

-- ------------------------------------------------------------
-- LEARNING
-- ------------------------------------------------------------
create table learning_paths (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  market        market_type,
  color         text,
  icon          text,
  modules_count integer,
  created_at    timestamptz not null default now()
);

create table lessons (
  id        uuid primary key default gen_random_uuid(),
  path_id   uuid not null references learning_paths (id) on delete cascade,
  position  integer,
  name      text,
  minutes   integer,
  body      text,
  xp        integer not null default 0
);

create table lesson_progress (
  profile_id   uuid not null references profiles (id) on delete cascade,
  lesson_id    uuid not null references lessons (id) on delete cascade,
  state        lesson_state not null default 'locked',
  completed_at timestamptz,
  primary key (profile_id, lesson_id)
);

-- ------------------------------------------------------------
-- ACHIEVEMENTS / XP
-- ------------------------------------------------------------
create table achievements (
  id          uuid primary key default gen_random_uuid(),
  key         citext unique not null,
  name        text,
  description text,
  icon        text,
  tier        tier_key
);

create table profile_achievements (
  profile_id     uuid not null references profiles (id) on delete cascade,
  achievement_id uuid not null references achievements (id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);

create table xp_events (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  amount     integer,
  reason     text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- NOTIFICATIONS / BILLING
-- ------------------------------------------------------------
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  actor_id   uuid references profiles (id) on delete set null,
  type       notif_type not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create table subscriptions (
  profile_id           uuid primary key references profiles (id) on delete cascade,
  stripe_customer_id   text,
  stripe_subscription_id text,
  plan                 plan_tier not null default 'free',
  status               text,
  current_period_end   timestamptz
);

-- ------------------------------------------------------------
-- INDEXES (feeds, leaderboards, FK hot paths)
-- ------------------------------------------------------------
create index idx_posts_created_at      on posts (created_at desc);
create index idx_posts_author          on posts (author_id);
create index idx_post_tags_tag         on post_tags (tag);
create index idx_post_votes_profile    on post_votes (profile_id);
create index idx_comments_post         on comments (post_id);
create index idx_comments_author       on comments (author_id);
create index idx_follows_following     on follows (following_id);
create index idx_community_members_pro on community_members (profile_id);
create index idx_channels_community    on channels (community_id);
create index idx_channel_msgs_chan_ts  on channel_messages (channel_id, created_at);
create index idx_dm_participants_pro   on dm_participants (profile_id);
create index idx_dm_messages_thread_ts on dm_messages (thread_id, created_at);
create index idx_comp_entries_rank     on competition_entries (competition_id, rank);
create index idx_comp_entries_profile  on competition_entries (profile_id);
create index idx_lessons_path          on lessons (path_id);
create index idx_lesson_progress_pro   on lesson_progress (profile_id);
create index idx_profile_ach_profile   on profile_achievements (profile_id);
create index idx_xp_events_profile     on xp_events (profile_id, created_at desc);
create index idx_profiles_rp           on profiles (rp desc);
create index idx_notifications_pro_ts  on notifications (profile_id, created_at desc);

-- ------------------------------------------------------------
-- FUNCTION: tier_for_rp — tier ladder thresholds
-- ------------------------------------------------------------
create or replace function tier_for_rp(rp integer)
returns tier_key
language sql
immutable
as $$
  select case
    when rp >= 8000 then 'elite'::tier_key
    when rp >= 6200 then 'master'::tier_key
    when rp >= 4600 then 'diamond'::tier_key
    when rp >= 3200 then 'platinum'::tier_key
    when rp >= 2000 then 'gold'::tier_key
    when rp >= 1000 then 'silver'::tier_key
    else 'bronze'::tier_key
  end;
$$;

-- ------------------------------------------------------------
-- TRIGGER: updated_at maintenance
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_trader_stats_updated_at
  before update on trader_stats
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- VIEW: leaderboard_global
-- ------------------------------------------------------------
create view leaderboard_global as
select
  p.id,
  p.handle,
  p.display_name,
  p.country,
  p.flag,
  p.market,
  p.verified,
  p.avatar_from,
  p.avatar_to,
  p.rp,
  tier_for_rp(p.rp) as tier,
  p.followers_count,
  s.win_rate,
  s.total_pnl_pct,
  s.trades_count,
  s.max_drawdown,
  s.consistency,
  s.win_streak,
  s.sharpe,
  s.profit_factor,
  s.avg_rr,
  row_number() over (order by p.rp desc) as global_rank
from profiles p
left join trader_stats s on s.profile_id = p.id
order by p.rp desc;

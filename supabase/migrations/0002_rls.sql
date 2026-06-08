-- ============================================================
-- TradeHub — Row Level Security
-- 0002_rls.sql — enable RLS on every table + policies.
-- Principle: public READ on social/catalog data;
--            WRITE strictly scoped to the owning auth.uid().
-- ============================================================

-- ------------------------------------------------------------
-- Enable RLS on every table
-- ------------------------------------------------------------
alter table profiles             enable row level security;
alter table trader_stats         enable row level security;
alter table broker_connections   enable row level security;
alter table seasons              enable row level security;
alter table posts                enable row level security;
alter table post_tags            enable row level security;
alter table post_votes           enable row level security;
alter table comments             enable row level security;
alter table follows              enable row level security;
alter table communities          enable row level security;
alter table community_members    enable row level security;
alter table channels             enable row level security;
alter table channel_messages     enable row level security;
alter table dm_threads           enable row level security;
alter table dm_participants      enable row level security;
alter table dm_messages          enable row level security;
alter table competitions         enable row level security;
alter table competition_entries  enable row level security;
alter table learning_paths       enable row level security;
alter table lessons              enable row level security;
alter table lesson_progress      enable row level security;
alter table achievements         enable row level security;
alter table profile_achievements enable row level security;
alter table xp_events            enable row level security;
alter table notifications        enable row level security;
alter table subscriptions        enable row level security;

-- ------------------------------------------------------------
-- PROFILES — public read, owner-only update
-- ------------------------------------------------------------
create policy profiles_select_all on profiles
  for select using (true);

create policy profiles_update_own on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ------------------------------------------------------------
-- TRADER_STATS — public read (leaderboards), owner-only write
-- ------------------------------------------------------------
create policy trader_stats_select_all on trader_stats
  for select using (true);

create policy trader_stats_insert_own on trader_stats
  for insert with check (auth.uid() = profile_id);

create policy trader_stats_update_own on trader_stats
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- BROKER_CONNECTIONS — owner only (all actions)
-- ------------------------------------------------------------
create policy broker_connections_select_own on broker_connections
  for select using (auth.uid() = profile_id);

create policy broker_connections_insert_own on broker_connections
  for insert with check (auth.uid() = profile_id);

create policy broker_connections_update_own on broker_connections
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy broker_connections_delete_own on broker_connections
  for delete using (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- SEASONS — public read
-- ------------------------------------------------------------
create policy seasons_select_all on seasons
  for select using (true);

-- ------------------------------------------------------------
-- POSTS — public read, author-only write
-- ------------------------------------------------------------
create policy posts_select_all on posts
  for select using (true);

create policy posts_insert_author on posts
  for insert with check (auth.uid() = author_id);

create policy posts_update_author on posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy posts_delete_author on posts
  for delete using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- POST_TAGS — public read, write only by the post author
-- ------------------------------------------------------------
create policy post_tags_select_all on post_tags
  for select using (true);

create policy post_tags_insert_author on post_tags
  for insert with check (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  );

create policy post_tags_delete_author on post_tags
  for delete using (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- ------------------------------------------------------------
-- POST_VOTES — public read, owner-only write
-- ------------------------------------------------------------
create policy post_votes_select_all on post_votes
  for select using (true);

create policy post_votes_insert_own on post_votes
  for insert with check (auth.uid() = profile_id);

create policy post_votes_update_own on post_votes
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy post_votes_delete_own on post_votes
  for delete using (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- COMMENTS — public read, author-only write
-- ------------------------------------------------------------
create policy comments_select_all on comments
  for select using (true);

create policy comments_insert_author on comments
  for insert with check (auth.uid() = author_id);

create policy comments_update_author on comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy comments_delete_author on comments
  for delete using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- FOLLOWS — public read, owner (follower) only write
-- ------------------------------------------------------------
create policy follows_select_all on follows
  for select using (true);

create policy follows_insert_own on follows
  for insert with check (auth.uid() = follower_id);

create policy follows_delete_own on follows
  for delete using (auth.uid() = follower_id);

-- ------------------------------------------------------------
-- COMMUNITIES — public read
-- ------------------------------------------------------------
create policy communities_select_all on communities
  for select using (true);

-- ------------------------------------------------------------
-- COMMUNITY_MEMBERS — public read, owner-only join/leave
-- ------------------------------------------------------------
create policy community_members_select_all on community_members
  for select using (true);

create policy community_members_insert_own on community_members
  for insert with check (auth.uid() = profile_id);

create policy community_members_delete_own on community_members
  for delete using (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- CHANNELS — public read
-- ------------------------------------------------------------
create policy channels_select_all on channels
  for select using (true);

-- ------------------------------------------------------------
-- CHANNEL_MESSAGES — read by community members, insert by member
-- ------------------------------------------------------------
create policy channel_messages_select_member on channel_messages
  for select using (
    exists (
      select 1
      from channels ch
      join community_members cm on cm.community_id = ch.community_id
      where ch.id = channel_id and cm.profile_id = auth.uid()
    )
  );

create policy channel_messages_insert_member on channel_messages
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1
      from channels ch
      join community_members cm on cm.community_id = ch.community_id
      where ch.id = channel_id and cm.profile_id = auth.uid()
    )
  );

create policy channel_messages_delete_author on channel_messages
  for delete using (author_id = auth.uid());

-- ------------------------------------------------------------
-- DM membership helper.
-- A self-referential policy on dm_participants recurses infinitely
-- (the policy queries the same table it guards). This SECURITY DEFINER
-- function reads dm_participants with RLS bypassed, so every DM policy
-- can ask "is this uid in the thread?" without recursion.
-- ------------------------------------------------------------
create or replace function is_dm_member(p_thread uuid, p_profile uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from dm_participants
    where thread_id = p_thread and profile_id = p_profile
  );
$$;

-- ------------------------------------------------------------
-- DM_THREADS — only participants
-- ------------------------------------------------------------
create policy dm_threads_select_participant on dm_threads
  for select using (is_dm_member(id, auth.uid()));

create policy dm_threads_insert_auth on dm_threads
  for insert with check (auth.uid() is not null);

-- ------------------------------------------------------------
-- DM_PARTICIPANTS — only participants of the thread
-- ------------------------------------------------------------
create policy dm_participants_select_participant on dm_participants
  for select using (is_dm_member(thread_id, auth.uid()));

create policy dm_participants_insert_self on dm_participants
  for insert with check (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- DM_MESSAGES — only thread participants; author must be self
-- ------------------------------------------------------------
create policy dm_messages_select_participant on dm_messages
  for select using (is_dm_member(thread_id, auth.uid()));

create policy dm_messages_insert_participant on dm_messages
  for insert with check (
    author_id = auth.uid()
    and is_dm_member(thread_id, auth.uid())
  );

-- ------------------------------------------------------------
-- COMPETITIONS — public read
-- ------------------------------------------------------------
create policy competitions_select_all on competitions
  for select using (true);

-- ------------------------------------------------------------
-- COMPETITION_ENTRIES — public read (brackets), owner-only write
-- ------------------------------------------------------------
create policy competition_entries_select_all on competition_entries
  for select using (true);

create policy competition_entries_insert_own on competition_entries
  for insert with check (auth.uid() = profile_id);

create policy competition_entries_delete_own on competition_entries
  for delete using (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- LEARNING_PATHS / LESSONS — public read (catalog)
-- ------------------------------------------------------------
create policy learning_paths_select_all on learning_paths
  for select using (true);

create policy lessons_select_all on lessons
  for select using (true);

-- ------------------------------------------------------------
-- LESSON_PROGRESS — owner only
-- ------------------------------------------------------------
create policy lesson_progress_select_own on lesson_progress
  for select using (auth.uid() = profile_id);

create policy lesson_progress_insert_own on lesson_progress
  for insert with check (auth.uid() = profile_id);

create policy lesson_progress_update_own on lesson_progress
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- ACHIEVEMENTS — public read (catalog)
-- ------------------------------------------------------------
create policy achievements_select_all on achievements
  for select using (true);

-- ------------------------------------------------------------
-- PROFILE_ACHIEVEMENTS — public read, owner-only write
-- ------------------------------------------------------------
create policy profile_achievements_select_all on profile_achievements
  for select using (true);

create policy profile_achievements_insert_own on profile_achievements
  for insert with check (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- XP_EVENTS — owner only
-- ------------------------------------------------------------
create policy xp_events_select_own on xp_events
  for select using (auth.uid() = profile_id);

create policy xp_events_insert_own on xp_events
  for insert with check (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- NOTIFICATIONS — owner only
-- ------------------------------------------------------------
create policy notifications_select_own on notifications
  for select using (auth.uid() = profile_id);

create policy notifications_update_own on notifications
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy notifications_delete_own on notifications
  for delete using (auth.uid() = profile_id);

-- ------------------------------------------------------------
-- SUBSCRIPTIONS — owner only (writes happen via service role)
-- ------------------------------------------------------------
create policy subscriptions_select_own on subscriptions
  for select using (auth.uid() = profile_id);

create policy subscriptions_update_own on subscriptions
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

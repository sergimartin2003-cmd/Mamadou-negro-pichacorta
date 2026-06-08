-- ============================================================
-- TradeHub — Triggers & RPCs
-- 0003_triggers_rpcs.sql
-- All SECURITY DEFINER functions pin search_path = public and
-- validate auth.uid().
-- ============================================================

-- ------------------------------------------------------------
-- handle_new_user — provision profile + stats + subscription
-- when a new auth.users row is created.
-- ------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handle citext;
begin
  v_handle := coalesce(
    nullif(new.raw_user_meta_data ->> 'handle', ''),
    'trader_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    v_handle,
    coalesce(new.raw_user_meta_data ->> 'display_name', v_handle)
  );

  insert into public.trader_stats (profile_id) values (new.id);
  insert into public.subscriptions (profile_id, plan) values (new.id, 'free');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------------------------------
-- cast_vote — upsert a vote and maintain post tallies.
-- ------------------------------------------------------------
create or replace function cast_vote(p_post uuid, p_value smallint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;
  if p_value not in (-1, 1) then
    raise exception 'vote value must be -1 or 1';
  end if;

  insert into post_votes (post_id, profile_id, value)
  values (p_post, v_uid, p_value)
  on conflict (post_id, profile_id)
  do update set value = excluded.value;

  update posts
  set
    upvotes   = (select count(*) from post_votes where post_id = p_post and value = 1),
    downvotes = (select count(*) from post_votes where post_id = p_post and value = -1)
  where id = p_post;
end;
$$;

-- ------------------------------------------------------------
-- toggle_follow — follow/unfollow target, maintain counts.
-- Returns true when now following, false when unfollowed.
-- ------------------------------------------------------------
create or replace function toggle_follow(p_target uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_exists boolean;
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;
  if v_uid = p_target then
    raise exception 'cannot follow self';
  end if;

  select exists (
    select 1 from follows where follower_id = v_uid and following_id = p_target
  ) into v_exists;

  if v_exists then
    delete from follows where follower_id = v_uid and following_id = p_target;
    update profiles set following_count = greatest(following_count - 1, 0) where id = v_uid;
    update profiles set followers_count = greatest(followers_count - 1, 0) where id = p_target;
    return false;
  else
    insert into follows (follower_id, following_id) values (v_uid, p_target);
    update profiles set following_count = following_count + 1 where id = v_uid;
    update profiles set followers_count = followers_count + 1 where id = p_target;
    return true;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- join_competition — enter a competition, bump participants.
-- ------------------------------------------------------------
create or replace function join_competition(p_comp uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inserted boolean := false;
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;

  insert into competition_entries (competition_id, profile_id)
  values (p_comp, v_uid)
  on conflict (competition_id, profile_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted then
    update competitions
    set participants_count = participants_count + 1
    where id = p_comp;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- award_xp — record an xp event for the caller.
-- ------------------------------------------------------------
create or replace function award_xp(p_amount integer, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;

  insert into xp_events (profile_id, amount, reason)
  values (v_uid, p_amount, p_reason);
end;
$$;

-- ------------------------------------------------------------
-- comments_count maintenance on comments insert/delete.
-- ------------------------------------------------------------
create or replace function bump_comments_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_comments_count_ins
  after insert on comments
  for each row execute function bump_comments_count();

create trigger trg_comments_count_del
  after delete on comments
  for each row execute function bump_comments_count();

-- ------------------------------------------------------------
-- members_count maintenance on community_members insert/delete.
-- ------------------------------------------------------------
create or replace function bump_members_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update communities set members_count = members_count + 1 where id = new.community_id;
    return new;
  elsif tg_op = 'DELETE' then
    update communities set members_count = greatest(members_count - 1, 0) where id = old.community_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_members_count_ins
  after insert on community_members
  for each row execute function bump_members_count();

create trigger trg_members_count_del
  after delete on community_members
  for each row execute function bump_members_count();

-- ============================================================
-- TradeHub — RPC & security fixes
-- 0004_rpcs_fixes.sql
-- Adds create_competition, caps award_xp, and a Stripe event
-- idempotency table. All SECURITY DEFINER functions pin
-- search_path = public and assert auth.uid().
-- ============================================================

-- ------------------------------------------------------------
-- create_competition — create a competition owned by the caller
-- and enter them as the first participant. Ownership is derived
-- from auth.uid(); nothing about the creator comes from the client.
-- ------------------------------------------------------------
create or replace function create_competition(
  p_name          text,
  p_kind          competition_kind,
  p_market        market_type,
  p_metric        text,
  p_rule          text,
  p_prize         text,
  p_duration_days integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;
  if p_duration_days < 1 then
    raise exception 'duration must be at least 1 day';
  end if;

  insert into competitions (
    name, kind, market, metric, rule, prize,
    participants_count, starts_at, ends_at, status
  )
  values (
    p_name, p_kind, p_market, p_metric, p_rule, p_prize,
    1, now(), now() + (p_duration_days * interval '1 day'), 'live'
  )
  returning id into v_id;

  insert into competition_entries (competition_id, profile_id)
  values (v_id, v_uid);

  return v_id;
end;
$$;

-- ------------------------------------------------------------
-- award_xp — record an xp event for the caller, clamped to a
-- safe range so authed users cannot mint unlimited XP.
-- ------------------------------------------------------------
create or replace function award_xp(p_amount integer, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_amount integer := least(greatest(coalesce(p_amount, 0), 1), 500);
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;

  insert into xp_events (profile_id, amount, reason)
  values (v_uid, v_amount, p_reason);
end;
$$;

-- ------------------------------------------------------------
-- stripe_events — webhook idempotency ledger. The webhook handler
-- inserts event.id and skips events it has already processed.
-- ------------------------------------------------------------
create table if not exists stripe_events (
  id         text primary key,
  created_at timestamptz not null default now()
);

alter table stripe_events enable row level security;

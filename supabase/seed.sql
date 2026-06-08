-- ============================================================
-- TradeHub — Development seed
-- supabase/seed.sql
--
-- APPROACH (read me):
--   profiles.id has an FK to auth.users(id). To make this seed
--   runnable STANDALONE, we first insert minimal rows into
--   auth.users using the SAME fixed uuids, then the profiles.
--   Only the service role (or the SQL editor / `supabase db push`,
--   which run as a superuser-equivalent) may write auth.users.
--   Run this AFTER 0001/0002/0003 with the service role.
--
--   In PRODUCTION you never seed users this way: real profiles are
--   created automatically by handle_new_user() on signup. These
--   rows exist only to populate a dev project with demo content.
--
--   Fixed uuids let posts/follows/dms reference traders reliably.
--   Re-running is safe: every statement is ON CONFLICT idempotent.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- auth.users — minimal rows so the profiles FK resolves.
-- (email + instance_id + a confirmed timestamp is enough.)
-- ------------------------------------------------------------
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-4000-a000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','kaito_fx@seed.tradehub.dev',   now(), now(), now()),
  ('00000000-0000-4000-a000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','lenatrades@seed.tradehub.dev', now(), now(), now()),
  ('00000000-0000-4000-a000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','mreed_es@seed.tradehub.dev',   now(), now(), now()),
  ('00000000-0000-4000-a000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sofiacharts@seed.tradehub.dev',now(), now(), now()),
  ('00000000-0000-4000-a000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','dcole@seed.tradehub.dev',      now(), now(), now()),
  ('00000000-0000-4000-a000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','aisha_b@seed.tradehub.dev',    now(), now(), now()),
  ('00000000-0000-4000-a000-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated','theonk@seed.tradehub.dev',     now(), now(), now()),
  ('00000000-0000-4000-a000-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated','priya_a@seed.tradehub.dev',    now(), now(), now()),
  ('00000000-0000-4000-a000-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owenp@seed.tradehub.dev',      now(), now(), now()),
  ('00000000-0000-4000-a000-000000000010','00000000-0000-0000-0000-000000000000','authenticated','authenticated','camir@seed.tradehub.dev',      now(), now(), now()),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-0000-0000-000000000000','authenticated','authenticated','alexr@seed.tradehub.dev',      now(), now(), now())
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- profiles — 10 traders + "me" (Alex Rhodes).
-- avatar_from/avatar_to mirror the AV[] gradient palette.
-- ------------------------------------------------------------
insert into profiles (id, handle, display_name, bio, country, flag, market, verified, avatar_from, avatar_to, rp, followers_count, following_count) values
  ('00000000-0000-4000-a000-000000000001','kaito_fx',    'Kaito Mercer',   'Liquidity & order-flow. Risk first, always. London session specialist.', 'JP','🇯🇵','forex',   true,  '#9B5CFF','#5B7CFF', 8420, 42100, 212),
  ('00000000-0000-4000-a000-000000000002','lenatrades',  'Lena Volkov',    'BTC/ETH swing. Macro-driven. 5y full-time.',                              'DE','🇩🇪','crypto',  true,  '#FF6B9D','#C84BD8', 7990, 38800, 140),
  ('00000000-0000-4000-a000-000000000003','mreed_es',    'Marcus Reed',    'ES & NQ scalper. 100+ trades/week. Process > outcome.',                   'US','🇺🇸','futures', true,  '#56A8FF','#4361EE', 7640, 51200, 88),
  ('00000000-0000-4000-a000-000000000004','sofiacharts', 'Sofia Marín',    'Momentum + earnings. Small caps. Journaling addict.',                     'ES','🇪🇸','stocks',  true,  '#46D6C8','#2A9D8F', 6880, 29400, 301),
  ('00000000-0000-4000-a000-000000000005','dcole',       'Dmitri Cole',    'Altseason hunter. High conviction, sized down.',                          'CA','🇨🇦','crypto',  false, '#B06CFF','#7C4DFF', 6210, 18700, 455),
  ('00000000-0000-4000-a000-000000000006','aisha_b',     'Aisha Bello',    'Supply/demand. Few trades, high RR. Patience pays.',                      'NG','🇳🇬','forex',   true,  '#F2B33D','#E0792B', 5740, 22300, 120),
  ('00000000-0000-4000-a000-000000000007','theonk',      'Theo Nakamura',  'Gold & oil. Mechanical system trader.',                                   'AU','🇦🇺','futures', false, '#33C9DC','#2D7DD2', 5210, 14100, 233),
  ('00000000-0000-4000-a000-000000000008','priya_a',     'Priya Anand',    'Swing + options income. Risk-defined only.',                              'IN','🇮🇳','stocks',  true,  '#FFD166','#F4A23D', 4830, 26800, 189),
  ('00000000-0000-4000-a000-000000000009','owenp',       'Owen Pierce',    'Perps. Learning to size. Sharing the journey.',                           'GB','🇬🇧','crypto',  false, '#FF5C5C','#C0392B', 4120, 9200,  512),
  ('00000000-0000-4000-a000-000000000010','camir',       'Camila Rocha',   'NY session. Building consistency one week at a time.',                    'BR','🇧🇷','forex',   false, '#16C784','#0E8F62', 3560, 7600,  144),
  ('00000000-0000-4000-a000-0000000000a0','alexr',       'You · Alex Rhodes','Crypto swing + occasional ES scalps. Here to compound and learn in public.','US','🇺🇸','crypto',  true,  '#9B5CFF','#16C784', 4980, 12400, 340)
-- DO UPDATE (not DO NOTHING): handle_new_user() fires on the auth.users
-- inserts above and pre-creates stub profiles with a default handle/rp.
-- These demo values must overwrite those stubs.
on conflict (id) do update set
  handle          = excluded.handle,
  display_name    = excluded.display_name,
  bio             = excluded.bio,
  country         = excluded.country,
  flag            = excluded.flag,
  market          = excluded.market,
  verified        = excluded.verified,
  avatar_from     = excluded.avatar_from,
  avatar_to       = excluded.avatar_to,
  rp              = excluded.rp,
  followers_count = excluded.followers_count,
  following_count = excluded.following_count;

-- ------------------------------------------------------------
-- trader_stats — win/pnl/trades/dd/consistency/streak from data.jsx
-- ------------------------------------------------------------
insert into trader_stats (profile_id, win_rate, total_pnl_pct, trades_count, max_drawdown, consistency, win_streak) values
  ('00000000-0000-4000-a000-000000000001', 71, 284.6, 1820, 8.2,  94, 12),
  ('00000000-0000-4000-a000-000000000002', 64, 412.0, 2410, 14.1, 88, 7),
  ('00000000-0000-4000-a000-000000000003', 58, 198.3, 3120, 11.0, 91, 4),
  ('00000000-0000-4000-a000-000000000004', 67, 156.4, 940,  6.4,  90, 9),
  ('00000000-0000-4000-a000-000000000005', 61, 223.8, 1510, 17.3, 79, 2),
  ('00000000-0000-4000-a000-000000000006', 69, 134.2, 780,  5.1,  93, 15),
  ('00000000-0000-4000-a000-000000000007', 55, 88.9,  2010, 13.7, 82, 1),
  ('00000000-0000-4000-a000-000000000008', 63, 112.5, 1340, 9.8,  86, 6),
  ('00000000-0000-4000-a000-000000000009', 59, 64.3,  990,  15.2, 77, 3),
  ('00000000-0000-4000-a000-000000000010', 62, 71.8,  610,  7.9,  84, 5),
  ('00000000-0000-4000-a000-0000000000a0', 62, 128.4, 1185, 9.1,  87, 8)
on conflict (profile_id) do update set
  win_rate      = excluded.win_rate,
  total_pnl_pct = excluded.total_pnl_pct,
  trades_count  = excluded.trades_count,
  max_drawdown  = excluded.max_drawdown,
  consistency   = excluded.consistency,
  win_streak    = excluded.win_streak;

-- ------------------------------------------------------------
-- subscriptions — every seeded user starts on the free plan.
-- ------------------------------------------------------------
insert into subscriptions (profile_id, plan, status) values
  ('00000000-0000-4000-a000-000000000001','free','active'),
  ('00000000-0000-4000-a000-000000000002','free','active'),
  ('00000000-0000-4000-a000-000000000003','free','active'),
  ('00000000-0000-4000-a000-000000000004','free','active'),
  ('00000000-0000-4000-a000-000000000005','free','active'),
  ('00000000-0000-4000-a000-000000000006','free','active'),
  ('00000000-0000-4000-a000-000000000007','free','active'),
  ('00000000-0000-4000-a000-000000000008','free','active'),
  ('00000000-0000-4000-a000-000000000009','free','active'),
  ('00000000-0000-4000-a000-000000000010','free','active'),
  ('00000000-0000-4000-a000-0000000000a0','pro', 'active')
on conflict (profile_id) do update set
  plan   = excluded.plan,
  status = excluded.status;

-- ------------------------------------------------------------
-- posts — the 5 feed posts. result enum maps win/loss/open.
-- ------------------------------------------------------------
insert into posts (id, author_id, market, dir, symbol, title, body, rr, pnl, result, chart_label, upvotes, downvotes, comments_count) values
  ('00000000-0000-4000-b000-000000000001','00000000-0000-4000-a000-000000000003','futures','long','ES',
     'NQ reclaim of the overnight low — textbook A+ continuation',
     'Waited for the sweep of ONL, reclaim, then market structure shift on the 2m. Risk was 6 ticks, took partials at +1R and +2.4R, trailed the runner. This is the only setup I trade in the first hour.',
     3.2, 2.41, 'win', 'NQ 2m · reclaim + MSS', 842, 14, 96),
  ('00000000-0000-4000-b000-000000000002','00000000-0000-4000-a000-000000000002','crypto','long','BTC',
     'BTC weekly close above range — I’m adding, not chasing',
     'Macro thesis intact. Scaled first tranche at range high retest with stop below the weekly open. Not financial advice — this is my plan and my invalidation.',
     4.0, 6.20, 'open', 'BTC 1W · range breakout', 1320, 58, 210),
  ('00000000-0000-4000-b000-000000000003','00000000-0000-4000-a000-000000000006','forex','short','GBPUSD',
     'GU into weekly supply — patience finally paid',
     '15 sessions of waiting. Refined entry on the 15m off the H4 zone. 1.8% risk, RR locked at +5.2R. Few trades, high conviction.',
     5.2, 9.40, 'win', 'GBPUSD 15m · supply rejection', 601, 9, 54),
  ('00000000-0000-4000-b000-000000000004','00000000-0000-4000-a000-000000000005','crypto','long','SOL',
     'SOL got me — took the L, here’s the post-mortem',
     'Entered too early before confirmation, ego-averaged, blew through my stop region. Down 2.1R. Posting the loss because accountability is the whole point of TradeHub.',
     -2.1, -3.80, 'loss', 'SOL 1h · failed breakout', 489, 6, 71),
  ('00000000-0000-4000-b000-000000000005','00000000-0000-4000-a000-000000000004','stocks','long','NVDA',
     'NVDA post-earnings drift — momentum playbook',
     'Gap-and-go held VWAP all session. Added on the first pullback to the rising 9EMA. Scaled out into the close.',
     2.6, 1.56, 'win', 'NVDA 5m · VWAP hold', 712, 21, 88)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- post_tags — tag arrays from each post.
-- ------------------------------------------------------------
insert into post_tags (post_id, tag) values
  ('00000000-0000-4000-b000-000000000001','NQ'),
  ('00000000-0000-4000-b000-000000000001','scalping'),
  ('00000000-0000-4000-b000-000000000001','ICT'),
  ('00000000-0000-4000-b000-000000000002','BTC'),
  ('00000000-0000-4000-b000-000000000002','swing'),
  ('00000000-0000-4000-b000-000000000002','macro'),
  ('00000000-0000-4000-b000-000000000003','GBPUSD'),
  ('00000000-0000-4000-b000-000000000003','SD'),
  ('00000000-0000-4000-b000-000000000003','swing'),
  ('00000000-0000-4000-b000-000000000004','SOL'),
  ('00000000-0000-4000-b000-000000000004','mistake'),
  ('00000000-0000-4000-b000-000000000004','journal'),
  ('00000000-0000-4000-b000-000000000005','NVDA'),
  ('00000000-0000-4000-b000-000000000005','momentum'),
  ('00000000-0000-4000-b000-000000000005','earnings')
on conflict (post_id, tag) do nothing;

-- ------------------------------------------------------------
-- follows — "me" follows the people who appear in DMs/notifs.
-- counts are pre-baked above; this is graph data, not a tally.
-- ------------------------------------------------------------
insert into follows (follower_id, following_id) values
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000002'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000003'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000004'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000006'),
  ('00000000-0000-4000-a000-000000000006','00000000-0000-4000-a000-0000000000a0')
on conflict (follower_id, following_id) do nothing;

-- ------------------------------------------------------------
-- communities — 5 communities. market 'All' -> null (cross-market).
-- slug derived from the name. members_count pre-baked from data.jsx.
-- ------------------------------------------------------------
insert into communities (id, slug, name, market, icon, color, description, members_count, is_premium) values
  ('00000000-0000-4000-c000-000000000001','order-flow-lab','Order Flow Lab','futures','⊞','#56A8FF','Tape reading, footprint & auction theory.', 24100, false),
  ('00000000-0000-4000-c000-000000000002','crypto-macro',  'Crypto Macro',  'crypto', '◎','#16C784','On-chain, macro & narrative-driven swing.', 51800, false),
  ('00000000-0000-4000-c000-000000000003','smart-money-fx','Smart Money FX','forex',  '◈','#9B5CFF','Liquidity, order blocks & session timing.', 33200, false),
  ('00000000-0000-4000-c000-000000000004','risk-first',    'Risk First',    null,     '◇','#F2B33D','Position sizing, psychology & journaling.', 18900, false),
  ('00000000-0000-4000-c000-000000000005','small-cap-floor','Small Cap Floor','stocks','△','#FF6B9D','Momentum, gappers & earnings runners.', 12400, false)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- channels — Discord-style text channels under Order Flow Lab.
-- ------------------------------------------------------------
insert into channels (id, community_id, name, kind, position) values
  ('00000000-0000-4000-d000-000000000001','00000000-0000-4000-c000-000000000001','general',   'text', 0),
  ('00000000-0000-4000-d000-000000000002','00000000-0000-4000-c000-000000000001','analysis',  'text', 1),
  ('00000000-0000-4000-d000-000000000003','00000000-0000-4000-c000-000000000001','setups',    'text', 2),
  ('00000000-0000-4000-d000-000000000004','00000000-0000-4000-c000-000000000001','psychology','text', 3),
  ('00000000-0000-4000-d000-000000000005','00000000-0000-4000-c000-000000000001','news',      'text', 4),
  ('00000000-0000-4000-d000-000000000006','00000000-0000-4000-c000-000000000001','journals',  'text', 5)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- community_members — populate the Order Flow Lab roster so
-- channel-message RLS resolves for these users in dev.
-- ------------------------------------------------------------
insert into community_members (community_id, profile_id, role) values
  ('00000000-0000-4000-c000-000000000001','00000000-0000-4000-a000-000000000003','admin'),
  ('00000000-0000-4000-c000-000000000001','00000000-0000-4000-a000-000000000007','user'),
  ('00000000-0000-4000-c000-000000000001','00000000-0000-4000-a000-000000000006','user'),
  ('00000000-0000-4000-c000-000000000001','00000000-0000-4000-a000-0000000000a0','user')
on conflict (community_id, profile_id) do nothing;

-- ------------------------------------------------------------
-- channel_messages — the #setups conversation (chatMsgs).
-- ------------------------------------------------------------
insert into channel_messages (channel_id, author_id, body, chart_label) values
  ('00000000-0000-4000-d000-000000000003','00000000-0000-4000-a000-000000000003','ES holding the overnight low to the tick. Watching for a reclaim + MSS before I touch it.', null),
  ('00000000-0000-4000-d000-000000000003','00000000-0000-4000-a000-000000000007','Same. Not chasing the first push, want the retest.', null),
  ('00000000-0000-4000-d000-000000000003','00000000-0000-4000-a000-000000000003','There it is — reclaim confirmed. Risk is 6 ticks.', 'ES 2m · reclaim'),
  ('00000000-0000-4000-d000-000000000003','00000000-0000-4000-a000-000000000006','Clean. What’s your first target?', null),
  ('00000000-0000-4000-d000-000000000003','00000000-0000-4000-a000-000000000003','+1R partial at the VWAP, runner to the prior day high.', null),
  ('00000000-0000-4000-d000-000000000003','00000000-0000-4000-a000-0000000000a0','Took a smaller size version of this. +1.2R locked, trailing the rest. 🙏', null);

-- ------------------------------------------------------------
-- direct messages — thread between "me" and Marcus Reed (dmThread).
-- ------------------------------------------------------------
insert into dm_threads (id) values
  ('00000000-0000-4000-e000-000000000001')
on conflict (id) do nothing;

insert into dm_participants (thread_id, profile_id) values
  ('00000000-0000-4000-e000-000000000001','00000000-0000-4000-a000-0000000000a0'),
  ('00000000-0000-4000-e000-000000000001','00000000-0000-4000-a000-000000000003')
on conflict (thread_id, profile_id) do nothing;

insert into dm_messages (thread_id, author_id, body, file_name) values
  ('00000000-0000-4000-e000-000000000001','00000000-0000-4000-a000-000000000003','Yo — that NQ reclaim play, you trading it live this morning?', null),
  ('00000000-0000-4000-e000-000000000001','00000000-0000-4000-a000-0000000000a0','Yeah, smaller size while I rebuild confidence after last week.', null),
  ('00000000-0000-4000-e000-000000000001','00000000-0000-4000-a000-000000000003','Smart. Sent you the ES template I use for the journal. Same logic.', null),
  ('00000000-0000-4000-e000-000000000001','00000000-0000-4000-a000-000000000003','Sent you the ES template 👍', 'ES-journal-template.csv'),
  ('00000000-0000-4000-e000-000000000001','00000000-0000-4000-a000-0000000000a0','Legend, thank you 🙏', null);

-- ------------------------------------------------------------
-- competitions — kind maps Seasonal->seasonal, 48h Battle->battle,
-- Friends->friends. market 'All' -> null. status from daysLeft.
-- ------------------------------------------------------------
insert into competitions (id, name, kind, market, metric, rule, prize, participants_count, starts_at, ends_at, status) values
  ('00000000-0000-4000-f000-000000000001','May Crypto League','seasonal','crypto','Risk-adjusted return','Max 3% risk/trade · verified only','Elite badge + $5k', 4820, now() - interval '24 days', now() + interval '6 days',  'live'),
  ('00000000-0000-4000-f000-000000000002','Scalper’s Sprint',  'battle',  'futures','Net R multiple','Intraday only · min 10 trades','Season RP x2', 312,  now() - interval '1 day',   now() + interval '1 day',  'live'),
  ('00000000-0000-4000-f000-000000000003','Consistency Cup',   'friends', null,    'Lowest drawdown','Invite-only · 4 of 8 invited','Bragging rights', 8,    now() - interval '3 days',   now() + interval '11 days', 'live'),
  ('00000000-0000-4000-f000-000000000004','FX Open — June',    'seasonal','forex',  'Profit factor','Registration open','Diamond promo path', 2910, now() + interval '2 days',   now() + interval '23 days', 'upcoming')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- competition_entries — "me" joined comps 1 & 3 (joined:true).
-- myRank from data.jsx (142 in the league, 2 in the cup).
-- ------------------------------------------------------------
insert into competition_entries (competition_id, profile_id, score, rank) values
  ('00000000-0000-4000-f000-000000000001','00000000-0000-4000-a000-0000000000a0', 0, 142),
  ('00000000-0000-4000-f000-000000000003','00000000-0000-4000-a000-0000000000a0', 0, 2)
on conflict (competition_id, profile_id) do nothing;

-- ------------------------------------------------------------
-- learning_paths — 4 paths. market 'All' -> null.
-- ------------------------------------------------------------
insert into learning_paths (id, name, market, color, icon, modules_count) values
  ('00000000-0000-4000-9000-000000000001','Crypto Foundations','crypto','#16C784','◎', 12),
  ('00000000-0000-4000-9000-000000000002','Forex & Sessions',  'forex', '#9B5CFF','◈', 14),
  ('00000000-0000-4000-9000-000000000003','Risk Management',   null,    '#F2B33D','◇', 10),
  ('00000000-0000-4000-9000-000000000004','Reading Price Action',null,  '#56A8FF','⊞', 16)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- lessons — the Risk Management lesson list (lessons array).
-- xp is illustrative per-lesson reward.
-- ------------------------------------------------------------
insert into lessons (id, path_id, position, name, minutes, xp) values
  ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-9000-000000000003',1,'What is risk-of-ruin?',                        6,  100),
  ('00000000-0000-4000-8000-000000000002','00000000-0000-4000-9000-000000000003',2,'Fixed-fractional sizing',                      8,  120),
  ('00000000-0000-4000-8000-000000000003','00000000-0000-4000-9000-000000000003',3,'The 1% rule in practice',                      5,  100),
  ('00000000-0000-4000-8000-000000000004','00000000-0000-4000-9000-000000000003',4,'Reward-to-risk & expectancy',                  10, 160),
  ('00000000-0000-4000-8000-000000000005','00000000-0000-4000-9000-000000000003',5,'Managing losing streaks',                      7,  140),
  ('00000000-0000-4000-8000-000000000006','00000000-0000-4000-9000-000000000003',6,'Position sizing across correlated pairs',      12, 200)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- lesson_progress — "me" state per lesson (done/current/locked).
-- ------------------------------------------------------------
insert into lesson_progress (profile_id, lesson_id, state, completed_at) values
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-8000-000000000001','done',    now() - interval '6 days'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-8000-000000000002','done',    now() - interval '4 days'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-8000-000000000003','done',    now() - interval '2 days'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-8000-000000000004','current', null),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-8000-000000000005','locked',  null),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-8000-000000000006','locked',  null)
on conflict (profile_id, lesson_id) do nothing;

-- ------------------------------------------------------------
-- achievements — 6 catalog entries (key slugified from name).
-- ------------------------------------------------------------
insert into achievements (id, key, name, description, icon, tier) values
  ('00000000-0000-4000-7000-000000000001','first-blood',     'First Blood',     'Logged your first verified trade',        '◆','bronze'),
  ('00000000-0000-4000-7000-000000000002','iron-discipline', 'Iron Discipline', '30 trades within risk limits',            '◈','silver'),
  ('00000000-0000-4000-7000-000000000003','green-week',      'Green Week',      '7 profitable days in a row',              '▲','gold'),
  ('00000000-0000-4000-7000-000000000004','drawdown-master', 'Drawdown Master', 'Recovered from a -15% drawdown',          '◇','platinum'),
  ('00000000-0000-4000-7000-000000000005','top-100',         'Top 100',         'Reached global top 100 in a season',      '★','diamond'),
  ('00000000-0000-4000-7000-000000000006','untouchable',     'Untouchable',     '90%+ consistency for a full season',      '❖','elite')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- profile_achievements — "me" unlocked the first four (got:true).
-- ------------------------------------------------------------
insert into profile_achievements (profile_id, achievement_id) values
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-7000-000000000001'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-7000-000000000002'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-7000-000000000003'),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-7000-000000000004')
on conflict (profile_id, achievement_id) do nothing;

-- ------------------------------------------------------------
-- notifications — the 6 notifications for "me". actor_id = who.
-- ------------------------------------------------------------
insert into notifications (profile_id, actor_id, type, body, read) values
  ('00000000-0000-4000-a000-0000000000a0', null,                                  'rank',   'You climbed to **#1,284** globally (+38 RP).', false),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000001','like',   '**Kaito Mercer** and 211 others upvoted your BTC swing post.', false),
  ('00000000-0000-4000-a000-0000000000a0', null,                                  'comp',   '**Consistency Cup** — you moved up to **#2**. Lowest drawdown in the bracket.', false),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000004','comment','**Sofia Marín** replied: “Clean management on the runner.”', true),
  ('00000000-0000-4000-a000-0000000000a0','00000000-0000-4000-a000-000000000006','follow', '**Aisha Bello** started following you.', true),
  ('00000000-0000-4000-a000-0000000000a0', null,                                  'tier',   'Season reset in **6 days**. Lock in Diamond before placements.', true);

commit;

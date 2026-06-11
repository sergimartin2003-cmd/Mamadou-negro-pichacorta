-- ============================================================
-- EmprendeHub — niche columns on content/competitive tables
-- 0006_niche_columns.sql
--
-- Makes the schema ready for niche-tagged content. The competitive
-- ladder of record stays user_niche_stats (0005); these columns let
-- competitions, learning paths and communities be filtered per niche
-- once content is added. Additive and safe.
-- ============================================================

alter table competitions   add column niche niche_type;
alter table learning_paths add column niche niche_type;
alter table communities    add column niche niche_type;

create index idx_competitions_niche   on competitions (niche);
create index idx_learning_paths_niche on learning_paths (niche);
create index idx_communities_niche    on communities (niche);

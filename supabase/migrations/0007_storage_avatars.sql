-- ============================================================
-- EmprendeHub — avatar storage
-- 0007_storage_avatars.sql
--
-- Adds the uploaded-avatar column and the public `avatars` bucket
-- with owner-scoped write policies (files live under <uid>/...).
-- ============================================================

alter table profiles add column avatar_url text;

-- Public-read bucket; writes are scoped to the owner's folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public bucket URLs work without a SELECT policy. Remove the broad one so clients cannot list every file.
-- Owners can still see and manage files in their own folder.
drop policy if exists "media public read" on storage.objects;
create policy "media owner read" on storage.objects for select to authenticated
  using (bucket_id = 'project-media' and (storage.foldername(name))[1] = auth.uid()::text);

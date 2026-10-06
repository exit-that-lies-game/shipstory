-- basic rate limits: per-user caps per hour, enforced by triggers
create or replace function public.rate_limit() returns trigger language plpgsql security definer set search_path = public as $$
declare lim int := tg_argv[0]::int; col text := tg_argv[1]; cnt int;
begin
  execute format('select count(*) from public.%I where %I = $1 and created_at > now() - interval ''1 hour''', tg_table_name, col)
    into cnt using (to_jsonb(new)->>col)::uuid;
  if cnt >= lim then raise exception 'Rate limit reached, try again later' using errcode = 'P0001'; end if;
  return new;
end $$;
create trigger projects_rl before insert on public.projects for each row execute function public.rate_limit(5, 'owner_id');
create trigger comments_rl before insert on public.comments for each row execute function public.rate_limit(30, 'author_id');
create trigger reports_rl before insert on public.reports for each row execute function public.rate_limit(10, 'reporter_id');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-media', 'project-media', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
create policy "media public read" on storage.objects for select using (bucket_id = 'project-media');
create policy "media own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'project-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Conservative free-tier budget: each reservation covers one file up to 5 MiB.
-- Reservations are not automatically released by deleting/replacing content.
begin;
create table public.media_slots (
  path text primary key,
  user_id uuid not null,
  created_at timestamptz not null default now()
);
alter table public.media_slots enable row level security;
revoke all on public.media_slots from public, anon, authenticated;
create policy "own media reservations" on public.media_slots for select to authenticated using(user_id=auth.uid());
grant select on public.media_slots to authenticated;
-- Preserve existing media; never alter storage metadata directly.
insert into public.media_slots(path,user_id)
select name,(storage.foldername(name))[1]::uuid from storage.objects
where bucket_id='project-media' and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$';
create or replace function public.reserve_media_slots(amount integer) returns text[]
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); own_count integer; total_count integer; paths text[]:=array[]::text[]; p text; i integer;
begin
  if uid is null then raise exception 'Sign in to upload'; end if;
  if amount is null or amount<1 or amount>7 then raise exception 'Choose 1 to 7 images'; end if;
  -- One shared lock bounds simultaneous uploads across users as well as per user.
  perform pg_advisory_xact_lock(73088192);
  select count(*),count(*) filter(where user_id=uid) into total_count,own_count from public.media_slots;
  if own_count+amount>20 then raise exception 'Your media allowance is full (20 images, up to 100 MiB).'; end if;
  if total_count+amount>160 then raise exception 'Media storage is full. Try again after space is reviewed.'; end if;
  for i in 1..amount loop
    p:=uid::text||'/'||gen_random_uuid()::text;
    insert into public.media_slots(path,user_id) values(p,uid);
    paths:=array_append(paths,p);
  end loop;
  return paths;
end $$;
revoke all on function public.reserve_media_slots(integer) from public,anon;
grant execute on function public.reserve_media_slots(integer) to authenticated;
drop policy "media own upload" on storage.objects;
create policy "media reserved upload" on storage.objects for insert to authenticated
with check(bucket_id='project-media' and (storage.foldername(name))[1]=auth.uid()::text
  and exists(select 1 from public.media_slots s where s.path=name and s.user_id=auth.uid()));
commit;

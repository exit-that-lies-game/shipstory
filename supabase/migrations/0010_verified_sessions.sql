begin;
create table public.verified_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid primary key,
  expires_at timestamptz not null
);
alter table public.verified_sessions enable row level security;
revoke all on public.verified_sessions from public,anon,authenticated;
create function public.grant_verified_session(uid uuid,sid uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  -- Service role is the only caller; verify the session belongs to the requested user.
  if not exists(select 1 from auth.sessions where id=sid and user_id=uid) then raise exception 'Invalid session'; end if;
  delete from public.verified_sessions where expires_at<now();
  insert into public.verified_sessions values(uid,sid,now()+interval '1 hour')
    on conflict(session_id) do update set expires_at=excluded.expires_at;
end $$;
revoke all on function public.grant_verified_session(uuid,uuid) from public,anon,authenticated;
grant execute on function public.grant_verified_session(uuid,uuid) to service_role;
create function public.has_verified_session() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.verified_sessions where user_id=auth.uid()
    and session_id::text=auth.jwt()->>'session_id' and expires_at>now());
$$;
revoke all on function public.has_verified_session() from public,anon;
grant execute on function public.has_verified_session() to authenticated;
-- Restrictive policies AND with all existing owner/visibility/limit policies.
create policy "verified project creation" on public.projects as restrictive for insert to authenticated with check(public.has_verified_session());
create policy "verified comment creation" on public.comments as restrictive for insert to authenticated with check(public.has_verified_session());
create policy "verified upload" on storage.objects as restrictive for insert to authenticated with check(bucket_id<>'project-media' or public.has_verified_session());
create policy "verified reservations" on public.media_slots as restrictive for select to authenticated using(public.has_verified_session());
-- Reservation writes run as a definer, so gate that RPC explicitly too.
create or replace function public.reserve_media_slots(amount integer) returns text[]
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); own_count integer; total_count integer; paths text[]:=array[]::text[]; p text; i integer;
begin
  if uid is null then raise exception 'Sign in to upload'; end if;
  if not public.has_verified_session() then raise exception 'Complete the security check before uploading.'; end if;
  if amount is null or amount<1 or amount>7 then raise exception 'Choose 1 to 7 images'; end if;
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
commit;

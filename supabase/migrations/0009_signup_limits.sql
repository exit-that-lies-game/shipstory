begin;
create table public.signup_events (
  id uuid primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.signup_events enable row level security;
revoke all on public.signup_events from public,anon,authenticated;
grant select,insert,delete on public.signup_events to supabase_auth_admin;
create policy "auth hook signup accounting" on public.signup_events to supabase_auth_admin using(true) with check(true);
-- Invoker permissions are limited to the table above; no SECURITY DEFINER.
create or replace function public.check_signup_limits(event jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare ip text:=event->'metadata'->>'ip_address'; ip_key text; ip_hits integer; total_hits integer;
begin
  if ip is null or length(ip)<3 then
    return jsonb_build_object('error',jsonb_build_object('http_code',429,'message','Signup could not be checked. Please try again later.'));
  end if;
  ip_key:=encode(sha256(convert_to(ip,'UTF8')),'hex');
  perform pg_advisory_xact_lock(73088193);
  delete from public.signup_events where created_at<now()-interval '2 days';
  select count(*) filter(where ip_hash=ip_key and created_at>now()-interval '1 hour'),count(*)
    into ip_hits,total_hits from public.signup_events where created_at>now()-interval '1 day';
  if ip_hits>=5 or total_hits>=50 then
    return jsonb_build_object('error',jsonb_build_object('http_code',429,'message','Too many new accounts. Please try again later.'));
  end if;
  insert into public.signup_events(id,ip_hash) values((event->'user'->>'id')::uuid,ip_key);
  return '{}'::jsonb;
end $$;
revoke all on function public.check_signup_limits(jsonb) from public,anon,authenticated;
grant execute on function public.check_signup_limits(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
commit;

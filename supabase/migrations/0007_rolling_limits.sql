begin;
create table public.rate_events(id bigint generated always as identity primary key,user_id uuid not null references auth.users(id) on delete cascade,kind text not null,created_at timestamptz not null default now());
create index rate_events_window on public.rate_events(user_id,kind,created_at);
alter table public.rate_events enable row level security;
revoke all on public.rate_events from public,anon,authenticated;
create or replace function public.rate_limit() returns trigger language plpgsql security definer set search_path=public as $$
declare lim int:=tg_argv[0]::int; uid uuid:=(to_jsonb(new)->>tg_argv[1])::uuid; hits int;
begin
perform pg_advisory_xact_lock(hashtextextended(uid::text||':'||tg_table_name,0));
select count(*) into hits from public.rate_events where user_id=uid and kind=tg_table_name and created_at>now()-interval '1 hour';
if hits>=lim then raise exception 'Rate limit reached, try again later'; end if;
insert into public.rate_events(user_id,kind) values(uid,tg_table_name);
return new;
end $$;
insert into public.rate_events(user_id,kind,created_at) select owner_id,'projects',created_at from public.projects where created_at>now()-interval '1 hour';
insert into public.rate_events(user_id,kind,created_at) select author_id,'comments',created_at from public.comments where created_at>now()-interval '1 hour';
insert into public.rate_events(user_id,kind,created_at) select reporter_id,'reports',created_at from public.reports where created_at>now()-interval '1 hour';
drop table public.rate_windows;
commit;

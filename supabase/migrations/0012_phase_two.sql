begin;
create table public.project_updates(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.projects(id) on delete cascade,author_id uuid not null references public.profiles(id) on delete cascade,title text not null check(char_length(title) between 1 and 100),body text not null check(char_length(body) between 1 and 2000),created_at timestamptz not null default now());
alter table public.project_updates enable row level security;
revoke all on public.project_updates from public,anon,authenticated;
create index project_updates_recent on public.project_updates(project_id,created_at desc);
grant select on public.project_updates to anon,authenticated;
grant insert(project_id,author_id,title,body) on public.project_updates to authenticated;
create policy "visible updates" on public.project_updates for select using(exists(select 1 from public.projects p where p.id=project_id and p.status='published' and not p.moderated_hidden));
create policy "owner updates" on public.project_updates for insert to authenticated with check(author_id=auth.uid() and public.can_contribute() and public.has_verified_session() and exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid() and p.status='published' and not p.moderated_hidden));
create trigger updates_rate before insert on public.project_updates for each row execute function public.rate_limit('10','author_id');
create table public.notifications(id uuid primary key default gen_random_uuid(),recipient_id uuid not null references public.profiles(id) on delete cascade,actor_id uuid not null references public.profiles(id) on delete cascade,project_id uuid references public.projects(id) on delete cascade,kind text not null check(kind in ('follow','comment','update')),read_at timestamptz,created_at timestamptz not null default now());
alter table public.notifications enable row level security;
revoke all on public.notifications from public,anon,authenticated;
create index notifications_recent on public.notifications(recipient_id,created_at desc);
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
create policy "own notifications" on public.notifications for select to authenticated using(recipient_id=auth.uid() and (project_id is null or exists(select 1 from public.projects p where p.id=project_id and not p.moderated_hidden)));
create policy "mark own read" on public.notifications for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
create function public.notify_activity() returns trigger language plpgsql security definer set search_path='' as $$
declare owner uuid;
begin
 if tg_table_name='follows' then
  if new.follower_id<>new.followee_id then insert into public.notifications(recipient_id,actor_id,kind) values(new.followee_id,new.follower_id,'follow');end if;
 elsif tg_table_name='comments' then
  select owner_id into owner from public.projects where id=new.project_id;
  if owner<>new.author_id then insert into public.notifications(recipient_id,actor_id,project_id,kind) values(owner,new.author_id,new.project_id,'comment');end if;
 elsif tg_table_name='project_updates' then
  insert into public.notifications(recipient_id,actor_id,project_id,kind) select follower_id,new.author_id,new.project_id,'update' from public.follows where followee_id=new.author_id and follower_id<>new.author_id;
 end if; return new;
end$$;
revoke all on function public.notify_activity() from public,anon,authenticated;
create trigger notify_follows after insert on public.follows for each row execute function public.notify_activity();
create trigger notify_comments after insert on public.comments for each row execute function public.notify_activity();
create trigger notify_updates after insert on public.project_updates for each row execute function public.notify_activity();
create table public.project_click_days(project_id uuid not null references public.projects(id) on delete cascade,day date not null default current_date,clicks bigint not null default 0,primary key(project_id,day));
alter table public.project_click_days enable row level security;
revoke all on public.project_click_days from public,anon,authenticated;
create function public.record_project_try(target uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then return;end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':project_try',0));
 if (select count(*) from public.rate_events where user_id=auth.uid() and kind='project_try' and created_at>now()-interval '1 hour')>=60 then return;end if;
 if not exists(select 1 from public.projects where id=target and status='published' and not moderated_hidden) then return;end if;
 insert into public.rate_events(user_id,kind) values(auth.uid(),'project_try');
 insert into public.project_click_days(project_id,day,clicks) values(target,current_date,1) on conflict(project_id,day) do update set clicks=public.project_click_days.clicks+1;
end$$;
revoke all on function public.record_project_try(uuid) from public;
grant execute on function public.record_project_try(uuid) to authenticated;
create function public.builder_analytics() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(x),'[]'::jsonb) from (select p.id,p.slug,p.title,p.like_count,p.save_count,p.comment_count,(select count(*) from public.project_updates u where u.project_id=p.id) updates,coalesce((select sum(clicks) from public.project_click_days d where d.project_id=p.id and day>=current_date-6),0) tries_7d from public.projects p where p.owner_id=auth.uid() and not p.moderated_hidden order by p.created_at desc)x);
end$$;
revoke all on function public.builder_analytics() from public,anon;
grant execute on function public.builder_analytics() to authenticated;
commit;

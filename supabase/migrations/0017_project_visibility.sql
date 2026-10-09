begin;
-- Project visibility: public (default, everyone), followers (people who follow the owner), private (only people the owner picks).
alter table public.projects add column visibility text not null default 'public' check (visibility in ('public','followers','private'));

create table public.project_access(
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key(project_id,user_id)
);
alter table public.project_access enable row level security;
revoke all on public.project_access from public,anon,authenticated;
grant select,insert,delete on public.project_access to authenticated;
create index project_access_user on public.project_access(user_id);

-- Security definer so project and access policies cannot recurse into each other.
create function public.can_see_project(pid uuid,owner uuid,vis text) returns boolean language sql stable security definer set search_path='' as $$
 select vis='public' or owner=auth.uid()
  or (vis='followers' and exists(select 1 from public.follows f where f.follower_id=auth.uid() and f.followee_id=owner))
  or exists(select 1 from public.project_access a where a.project_id=pid and a.user_id=auth.uid())
$$;
revoke all on function public.can_see_project(uuid,uuid,text) from public;
grant execute on function public.can_see_project(uuid,uuid,text) to anon,authenticated;

drop policy "published readable" on public.projects;
create policy "published readable" on public.projects for select using (owner_id=auth.uid() or (status='published' and public.can_see_project(id,owner_id,visibility)));

create policy "access owner or self read" on public.project_access for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));
create policy "access owner grant" on public.project_access for insert to authenticated with check(user_id<>auth.uid() and exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));
create policy "access owner revoke" on public.project_access for delete to authenticated using(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));
create function public.limit_project_access() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (select count(*) from public.project_access where project_id=new.project_id)>=50 then raise exception 'Access list is full (50 people)' using errcode='54000';end if;
 return new;
end$$;
revoke all on function public.limit_project_access() from public,anon,authenticated;
create trigger project_access_limit before insert on public.project_access for each row execute function public.limit_project_access();

-- Everything attached to a project follows the project's visibility (the subselect runs under projects RLS).
drop policy "visible updates" on public.project_updates;
create policy "visible updates" on public.project_updates for select using(exists(select 1 from public.projects p where p.id=project_id and p.status='published' and not p.moderated_hidden));
drop policy "comments read" on public.comments;
create policy "comments read" on public.comments for select using(exists(select 1 from public.projects p where p.id=project_id));
drop policy "reactions read" on public.reactions;
create policy "reactions read" on public.reactions for select using(exists(select 1 from public.projects p where p.id=project_id));
drop policy "clikes read" on public.comment_likes;
create policy "clikes read" on public.comment_likes for select using(exists(select 1 from public.comments c where c.id=comment_id));

-- Update notifications go only to people who can see the project.
create or replace function public.notify_activity() returns trigger language plpgsql security definer set search_path='' as $$
declare owner uuid; vis text;
begin
 if tg_table_name='follows' then
  if new.follower_id<>new.followee_id then insert into public.notifications(recipient_id,actor_id,kind) values(new.followee_id,new.follower_id,'follow');end if;
 elsif tg_table_name='comments' then
  select owner_id into owner from public.projects where id=new.project_id;
  if owner<>new.author_id then insert into public.notifications(recipient_id,actor_id,project_id,kind) values(owner,new.author_id,new.project_id,'comment');end if;
 elsif tg_table_name='project_updates' then
  select visibility into vis from public.projects where id=new.project_id;
  if vis='private' then
   insert into public.notifications(recipient_id,actor_id,project_id,kind) select user_id,new.author_id,new.project_id,'update' from public.project_access where project_id=new.project_id and user_id<>new.author_id;
  else
   insert into public.notifications(recipient_id,actor_id,project_id,kind) select follower_id,new.author_id,new.project_id,'update' from public.follows where followee_id=new.author_id and follower_id<>new.author_id;
  end if;
 end if; return new;
end$$;

-- "Try" taps only count for people who can see the project.
create or replace function public.record_project_try(target uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then return;end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':project_try',0));
 if (select count(*) from public.rate_events where user_id=auth.uid() and kind='project_try' and created_at>now()-interval '1 hour')>=60 then return;end if;
 if not exists(select 1 from public.projects where id=target and status='published' and not moderated_hidden and public.can_see_project(id,owner_id,visibility)) then return;end if;
 insert into public.rate_events(user_id,kind) values(auth.uid(),'project_try');
 insert into public.project_click_days(project_id,day,clicks) values(target,current_date,1) on conflict(project_id,day) do update set clicks=public.project_click_days.clicks+1;
end$$;

-- Lets the app show "This project is private" instead of a blank 404. Returns only the lock type and owner handle, never project content.
create function public.project_gate(project_slug text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('visibility',p.visibility,'owner_id',p.owner_id,'owner_handle',o.handle) from public.projects p join public.profiles o on o.id=p.owner_id
 where p.slug=project_slug and p.status='published' and not p.moderated_hidden and p.visibility<>'public' and not public.can_see_project(p.id,p.owner_id,p.visibility)
$$;
revoke all on function public.project_gate(text) from public;
grant execute on function public.project_gate(text) to anon,authenticated;
commit;

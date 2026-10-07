begin;
create table public.admin_members(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from public,anon,authenticated;
insert into public.admin_members select id from auth.users where id='0307901a-dfe7-49aa-a524-bacc8c316de5' and lower(email)='contact.invgen@gmail.com' and email_confirmed_at is not null;
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.admin_members where user_id=auth.uid());$$;
revoke all on function public.is_admin() from public,anon;
grant execute on function public.is_admin() to anon,authenticated;
create table public.moderation_actions(id uuid primary key default gen_random_uuid(),admin_id uuid not null references auth.users(id),target_kind text not null,target_id uuid not null,action text not null,created_at timestamptz not null default now());
alter table public.moderation_actions enable row level security;
revoke all on public.moderation_actions from public,anon,authenticated;
alter table public.comments add column moderated_hidden boolean not null default false;
alter table public.reports add column review_status text not null default 'open' check(review_status in ('open','resolved','dismissed'));
alter table public.projects add column moderated_hidden boolean not null default false;
create policy "moderated projects unavailable" on public.projects as restrictive for select using(not moderated_hidden);
create policy "moderated comments unavailable" on public.comments as restrictive for select using(not moderated_hidden);
create policy "moderated projects immutable by owner" on public.projects as restrictive for update using(not moderated_hidden) with check(not moderated_hidden);
alter table public.profiles add column admin_verified boolean not null default false,add column posting_blocked boolean not null default false;
create function public.can_contribute() returns boolean language sql stable security definer set search_path='' as $$select not exists(select 1 from public.profiles where id=auth.uid() and posting_blocked);$$;
revoke all on function public.can_contribute() from public;
grant execute on function public.can_contribute() to anon,authenticated;
create policy "unblocked project insert" on public.projects as restrictive for insert to authenticated with check(public.can_contribute());
create policy "unblocked project update" on public.projects as restrictive for update to authenticated using(public.can_contribute()) with check(public.can_contribute());
create policy "unblocked comment insert" on public.comments as restrictive for insert to authenticated with check(public.can_contribute());
create policy "unblocked media upload" on storage.objects as restrictive for insert to authenticated with check(bucket_id<>'project-media' or public.can_contribute());
create table public.announcements(id uuid primary key default gen_random_uuid(),title text not null check(char_length(title) between 1 and 100),body text not null check(char_length(body)<=500),state text not null default 'draft' check(state in ('draft','published')),created_at timestamptz not null default now());
alter table public.announcements enable row level security;
revoke all on public.announcements from public,anon,authenticated;
grant select on public.announcements to anon,authenticated;
create policy "published announcement read" on public.announcements for select using(state='published');
create function public.admin_save_announcement(heading text,message text) returns void language plpgsql security definer set search_path='' as $$declare nid uuid;begin
if not public.is_admin() then raise exception 'Admin access required' using errcode='42501';end if;
insert into public.announcements(title,body) values(trim(heading),trim(message)) returning id into nid;
insert into public.moderation_actions(admin_id,target_kind,target_id,action) values(auth.uid(),'announcement',nid,'draft');end$$;
revoke all on function public.admin_save_announcement(text,text) from public,anon;
grant execute on function public.admin_save_announcement(text,text) to authenticated;

create or replace function public.reserve_media_slots(amount integer) returns text[]
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); own_count integer; total_count integer; paths text[]:=array[]::text[]; p text; i integer;
begin
  if not public.can_contribute() then raise exception 'Posting is blocked for this account';end if;
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

create function public.admin_overview() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501';end if;
 return jsonb_build_object(
 'counts',(select jsonb_build_object('builders',(select count(*) from public.profiles),'projects',(select count(*) from public.projects),'reports',(select count(*) from public.reports where review_status='open'),'reserved_slots',(select count(*) from public.media_slots))),
 'projects',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select p.id,p.slug,p.title,p.tagline,p.status,p.moderated_hidden,p.created_at,b.handle as owner from public.projects p join public.profiles b on b.id=p.owner_id order by p.created_at desc limit 100)x),
 'builders',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select b.id,b.handle,b.display_name,b.admin_verified,b.posting_blocked,b.created_at,(select count(*) from public.projects p where p.owner_id=b.id) as projects,(select count(*) from public.media_slots m where m.user_id=b.id) as reserved_slots from public.profiles b order by b.created_at desc limit 100)x),
 'reports',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select r.id,r.reason,r.details,r.review_status,r.created_at,r.project_id,r.comment_id,b.handle as reporter,coalesce(p.title,cp.title) as project_title,coalesce(p.slug,cp.slug) as slug,c.body as comment_body from public.reports r join public.profiles b on b.id=r.reporter_id left join public.projects p on p.id=r.project_id left join public.comments c on c.id=r.comment_id left join public.projects cp on cp.id=c.project_id order by (r.review_status='open') desc,r.created_at desc limit 100)x),
 'announcements',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select * from public.announcements order by created_at desc limit 100)x),
 'categories',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select tag,count(*) as projects from public.projects p cross join unnest(p.tags) tag group by tag order by count(*) desc)x),
 'activity',(select jsonb_agg(x) from(select day::date as day,(select count(*) from public.projects p where p.created_at::date=day::date) as projects,(select count(*) from public.profiles b where b.created_at::date=day::date) as builders from generate_series(current_date-6,current_date,interval '1 day') day)x),
 'admins',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select p.handle from public.admin_members a join public.profiles p on p.id=a.user_id)x),
 'actions',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select target_kind,target_id,action,created_at from public.moderation_actions order by created_at desc limit 20)x));
end$$;
create function public.admin_moderate(kind text,target uuid,decision text) returns void language plpgsql security definer set search_path='' as $$
declare affected int;
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501';end if;
 if kind='project' and decision in ('hide','restore') then update public.projects set moderated_hidden=(decision='hide') where id=target;
 elsif kind='comment' and decision in ('hide','restore') then update public.comments set moderated_hidden=(decision='hide') where id=target;
 elsif kind='builder' and decision in ('block','unblock','verify','unverify') then
 if exists(select 1 from public.admin_members where user_id=target) then raise exception 'Owner admin cannot be changed here';end if;
 if decision in ('block','unblock') then update public.profiles set posting_blocked=(decision='block') where id=target;
 else update public.profiles set admin_verified=(decision='verify') where id=target;end if;
 elsif kind='announcement' and decision in ('publish','unpublish') then update public.announcements set state=case when decision='publish' then 'published' else 'draft' end where id=target;
 elsif kind='report' and decision in ('open','resolved','dismissed') then update public.reports set review_status=decision where id=target;
 else raise exception 'Invalid action';end if;
 get diagnostics affected=row_count;if affected<>1 then raise exception 'Item not found';end if;
 insert into public.moderation_actions(admin_id,target_kind,target_id,action) values(auth.uid(),kind,target,decision);
end$$;
revoke all on function public.admin_overview(),public.admin_moderate(text,uuid,text) from public,anon;
grant execute on function public.admin_overview(),public.admin_moderate(text,uuid,text) to authenticated;
commit;

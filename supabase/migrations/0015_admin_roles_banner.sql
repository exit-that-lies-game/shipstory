begin;
-- Roles: owner (everything incl. access), admin (moderation, users, content), moderator (reports and hide/restore only).
alter table public.admin_members add column if not exists role text not null default 'admin' check (role in ('owner','admin','moderator')),
  add column if not exists added_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();
update public.admin_members set role='owner' where user_id='0307901a-dfe7-49aa-a524-bacc8c316de5';
create unique index if not exists one_owner on public.admin_members((role)) where role='owner';

create table if not exists public.admin_invites(email text primary key check (email=lower(email) and char_length(email) between 5 and 254), role text not null check (role in ('admin','moderator')), invited_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now());
alter table public.admin_invites enable row level security;
revoke all on public.admin_invites from public,anon,authenticated;

create or replace function public.admin_role() returns text language sql stable security definer set search_path='' as $$select role from public.admin_members where user_id=auth.uid();$$;
revoke all on function public.admin_role() from public,anon;
grant execute on function public.admin_role() to authenticated;

-- A signed-in user whose verified OAuth email matches a pending invite becomes a member. No other path grants access.
create or replace function public.claim_admin_invite() returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); u record; inv record;
begin
 if uid is null then return null;end if;
 select id,lower(email) as email,email_confirmed_at,raw_app_meta_data->>'provider' as provider into u from auth.users where id=uid;
 if u.id is null or u.email is null or u.email_confirmed_at is null or u.provider not in ('google','github') then return null;end if;
 select * into inv from public.admin_invites where email=u.email;
 if inv.email is null then return null;end if;
 insert into public.admin_members(user_id,role,added_by) values(uid,inv.role,inv.invited_by) on conflict (user_id) do nothing;
 delete from public.admin_invites where email=inv.email;
 insert into public.moderation_actions(admin_id,target_kind,target_id,action,reason) values(coalesce(inv.invited_by,uid),'access',uid,'accept invite','role '||inv.role);
 return inv.role;
end$$;
revoke all on function public.claim_admin_invite() from public,anon;
grant execute on function public.claim_admin_invite() to authenticated;

create function public.admin_access_list() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if coalesce(public.admin_role(),'')<>'owner' then raise exception 'Owner access required' using errcode='42501';end if;
 return jsonb_build_object(
  'members',(select coalesce(jsonb_agg(x order by x.created_at),'[]'::jsonb) from (select a.user_id,a.role,a.created_at,p.handle,u.email from public.admin_members a join public.profiles p on p.id=a.user_id join auth.users u on u.id=a.user_id)x),
  'invites',(select coalesce(jsonb_agg(x order by x.created_at),'[]'::jsonb) from (select email,role,created_at from public.admin_invites)x));
end$$;

create function public.admin_grant_access(person_email text,new_role text) returns text language plpgsql security definer set search_path='' as $$
declare em text:=lower(trim(coalesce(person_email,''))); uid uuid;
begin
 if coalesce(public.admin_role(),'')<>'owner' then raise exception 'Owner access required' using errcode='42501';end if;
 if new_role not in ('admin','moderator') then raise exception 'Invalid role';end if;
 if em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(em)>254 then raise exception 'Enter a valid email';end if;
 select id into uid from auth.users where lower(email)=em and email_confirmed_at is not null and raw_app_meta_data->>'provider' in ('google','github') limit 1;
 if uid is not null then
  if exists(select 1 from public.admin_members where user_id=uid and role='owner') then raise exception 'The owner role cannot be changed';end if;
  insert into public.admin_members(user_id,role,added_by) values(uid,new_role,auth.uid()) on conflict (user_id) do update set role=excluded.role;
  insert into public.moderation_actions(admin_id,target_kind,target_id,action,reason) values(auth.uid(),'access',uid,'grant','role '||new_role);
  return 'granted';
 end if;
 insert into public.admin_invites(email,role,invited_by) values(em,new_role,auth.uid()) on conflict (email) do update set role=excluded.role,invited_by=excluded.invited_by;
 insert into public.moderation_actions(admin_id,target_kind,target_id,action,reason) values(auth.uid(),'access',gen_random_uuid(),'invite','role '||new_role||' (pending sign-in)');
 return 'invited';
end$$;

create function public.admin_revoke_access(member uuid default null,invite_email text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if coalesce(public.admin_role(),'')<>'owner' then raise exception 'Owner access required' using errcode='42501';end if;
 if member is not null then
  if member=auth.uid() then raise exception 'You cannot remove your own access';end if;
  if exists(select 1 from public.admin_members where user_id=member and role='owner') then raise exception 'The owner cannot be removed';end if;
  delete from public.admin_members where user_id=member;
  if not found then raise exception 'Not found';end if;
  insert into public.moderation_actions(admin_id,target_kind,target_id,action,reason) values(auth.uid(),'access',member,'revoke','admin access removed');
 elsif invite_email is not null then
  delete from public.admin_invites where email=lower(trim(invite_email));
  if not found then raise exception 'Not found';end if;
  insert into public.moderation_actions(admin_id,target_kind,target_id,action,reason) values(auth.uid(),'access',gen_random_uuid(),'revoke','pending invite cancelled');
 else raise exception 'Nothing to revoke';end if;
end$$;
revoke all on function public.admin_access_list(),public.admin_grant_access(text,text),public.admin_revoke_access(uuid,text) from public,anon;
grant execute on function public.admin_access_list(),public.admin_grant_access(text,text),public.admin_revoke_access(uuid,text) to authenticated;

-- Banner image and link on announcements (feed top only).
alter table public.announcements add column if not exists image_url text check (image_url is null or (image_url ~ '^https://' and char_length(image_url)<=500)),
  add column if not exists link_url text check (link_url is null or (link_url ~ '^(/|https://)' and char_length(link_url)<=300));
drop function if exists public.admin_save_announcement(text,text);
create function public.admin_save_announcement(heading text,message text,image text default null,link text default null) returns void language plpgsql security definer set search_path='' as $$declare nid uuid;begin
 if coalesce(public.admin_role(),'') not in ('owner','admin') then raise exception 'Admin access required' using errcode='42501';end if;
 insert into public.announcements(title,body,image_url,link_url) values(trim(heading),trim(message),nullif(trim(coalesce(image,'')),''),nullif(trim(coalesce(link,'')),'')) returning id into nid;
 insert into public.moderation_actions(admin_id,target_kind,target_id,action) values(auth.uid(),'announcement',nid,'draft');end$$;
revoke all on function public.admin_save_announcement(text,text,text,text) from public,anon;
grant execute on function public.admin_save_announcement(text,text,text,text) to authenticated;

-- Role limits in the shared moderation function: moderators may only handle reports and hide/restore content.
create or replace function public.admin_moderate(kind text,target uuid,decision text,reason text default null) returns void language plpgsql security definer set search_path='' as $$
declare affected int:=1; n int; why text:=nullif(trim(coalesce(reason,'')),''); myrole text:=public.admin_role();
begin
 if myrole is null then raise exception 'Admin access required' using errcode='42501';end if;
 if myrole='moderator' and not (kind in ('project','comment','report') and decision in ('hide','restore','open','resolved','dismissed')) then raise exception 'Your role cannot do this' using errcode='42501';end if;
 if kind='project' and decision in ('hide','restore') then update public.projects set moderated_hidden=(decision='hide') where id=target;get diagnostics affected=row_count;
 elsif kind='comment' and decision in ('hide','restore') then update public.comments set moderated_hidden=(decision='hide') where id=target;get diagnostics affected=row_count;
 elsif kind='builder' and decision in ('block','unblock','verify','unverify','suspend','unsuspend') then
  if exists(select 1 from public.admin_members where user_id=target) then raise exception 'Admins cannot be changed here';end if;
  if decision in ('suspend','block') and (why is null or char_length(why)<5) then raise exception 'A reason of at least 5 characters is required';end if;
  if decision in ('block','unblock') then update public.profiles set posting_blocked=(decision='block') where id=target;get diagnostics affected=row_count;
  elsif decision in ('suspend','unsuspend') then
   update public.profiles set suspended=(decision='suspend'),posting_blocked=(decision='suspend') where id=target;
   get diagnostics affected=row_count;
   if affected<>1 then raise exception 'Item not found';end if;
  else update public.profiles set admin_verified=(decision='verify') where id=target;get diagnostics affected=row_count;end if;
 elsif kind='announcement' and decision in ('publish','unpublish') then update public.announcements set state=case when decision='publish' then 'published' else 'draft' end where id=target;get diagnostics affected=row_count;
 elsif kind='report' and decision in ('open','resolved','dismissed') then update public.reports set review_status=decision where id=target;get diagnostics affected=row_count;
 else raise exception 'Invalid action';end if;
 if affected<>1 then raise exception 'Item not found';end if;
 insert into public.moderation_actions(admin_id,target_kind,target_id,action,reason) values(auth.uid(),kind,target,decision,why);
end$$;
commit;

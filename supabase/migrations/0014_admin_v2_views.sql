begin;
alter table public.moderation_actions add column if not exists reason text check (reason is null or char_length(reason) <= 300);
alter table public.profiles add column if not exists suspended boolean not null default false;

drop function if exists public.admin_moderate(text,uuid,text);
create function public.admin_moderate(kind text,target uuid,decision text,reason text default null) returns void language plpgsql security definer set search_path='' as $$
declare affected int:=1; n int; why text:=nullif(trim(coalesce(reason,'')),'');
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501';end if;
 if kind='project' and decision in ('hide','restore') then update public.projects set moderated_hidden=(decision='hide') where id=target;get diagnostics affected=row_count;
 elsif kind='comment' and decision in ('hide','restore') then update public.comments set moderated_hidden=(decision='hide') where id=target;get diagnostics affected=row_count;
 elsif kind='builder' and decision in ('block','unblock','verify','unverify','suspend','unsuspend') then
  if exists(select 1 from public.admin_members where user_id=target) then raise exception 'Owner admin cannot be changed here';end if;
  if decision in ('suspend','block') and (why is null or char_length(why)<5) then raise exception 'A reason of at least 5 characters is required';end if;
  if decision in ('block','unblock') then update public.profiles set posting_blocked=(decision='block') where id=target;get diagnostics affected=row_count;
  elsif decision in ('suspend','unsuspend') then
   update public.profiles set suspended=(decision='suspend'),posting_blocked=(decision='suspend') where id=target;
   get diagnostics n=row_count;affected:=n;
   if n=1 then
    update auth.users set banned_until=case when decision='suspend' then now()+interval '100 years' else null end where id=target;
    if decision='suspend' then delete from auth.sessions where user_id=target;end if;
   end if;
   if affected<>1 then raise exception 'Item not found';end if;
  else update public.profiles set admin_verified=(decision='verify') where id=target;get diagnostics affected=row_count;end if;
 elsif kind='announcement' and decision in ('publish','unpublish') then update public.announcements set state=case when decision='publish' then 'published' else 'draft' end where id=target;get diagnostics affected=row_count;
 elsif kind='report' and decision in ('open','resolved','dismissed') then update public.reports set review_status=decision where id=target;get diagnostics affected=row_count;
 else raise exception 'Invalid action';end if;
 if affected<>1 then raise exception 'Item not found';end if;
 insert into public.moderation_actions(admin_id,target_kind,target_id,action,reason) values(auth.uid(),kind,target,decision,why);
end$$;
revoke all on function public.admin_moderate(text,uuid,text,text) from public,anon;
grant execute on function public.admin_moderate(text,uuid,text,text) to authenticated;

create function public.admin_project_detail(pid uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501';end if;
 select jsonb_build_object(
  'project',(select to_jsonb(x) from (select p.id,p.slug,p.title,p.tagline,p.description,p.live_url,p.repo_url,p.tags,p.cover_url,p.screenshots,p.status,p.moderated_hidden,p.like_count,p.save_count,p.comment_count,p.created_at,p.updated_at,o.id as owner_id,o.handle as owner from public.projects p join public.profiles o on o.id=p.owner_id where p.id=pid)x),
  'updates',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select title,body,created_at from public.project_updates where project_id=pid order by created_at desc limit 20)x),
  'reports',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select r.id,r.reason,r.details,r.review_status,r.created_at,b.handle as reporter from public.reports r join public.profiles b on b.id=r.reporter_id where r.project_id=pid order by r.created_at desc limit 20)x),
  'history',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select action,reason,created_at from public.moderation_actions where target_kind='project' and target_id=pid order by created_at desc limit 20)x)
 ) into r;
 if r->'project' is null or r->>'project'='null' then raise exception 'Item not found';end if;
 return r;
end$$;

create function public.admin_user_detail(uid uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501';end if;
 select jsonb_build_object(
  'user',(select to_jsonb(x) from (select b.id,b.handle,b.display_name,b.bio,b.avatar_url,b.created_at,b.admin_verified,b.posting_blocked,b.suspended,
     (select coalesce(u.raw_app_meta_data->>'provider','unknown') from auth.users u where u.id=b.id) as provider,
     (select u.last_sign_in_at from auth.users u where u.id=b.id) as last_sign_in_at,
     (select count(*) from public.comments c where c.author_id=b.id) as comments,
     (select count(*) from public.media_slots m where m.user_id=b.id) as reserved_slots,
     exists(select 1 from public.admin_members a where a.user_id=b.id) as is_owner
     from public.profiles b where b.id=uid)x),
  'projects',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select id,slug,title,status,moderated_hidden,like_count,created_at from public.projects where owner_id=uid order by created_at desc limit 50)x),
  'reports_against',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select r.id,r.reason,r.details,r.review_status,r.created_at,rb.handle as reporter,coalesce(p.title,'comment') as target from public.reports r join public.profiles rb on rb.id=r.reporter_id left join public.projects p on p.id=r.project_id left join public.comments c on c.id=r.comment_id where p.owner_id=uid or c.author_id=uid order by r.created_at desc limit 20)x),
  'reports_filed',(select count(*) from public.reports where reporter_id=uid),
  'activity',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select * from (select 'Created project '||title as what,created_at from public.projects where owner_id=uid union all select 'Posted update on '||p.title,u.created_at from public.project_updates u join public.projects p on p.id=u.project_id where u.author_id=uid union all select 'Commented on '||p.title,c.created_at from public.comments c join public.projects p on p.id=c.project_id where c.author_id=uid)a order by created_at desc limit 15)x),
  'history',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select action,reason,created_at from public.moderation_actions where target_kind='builder' and target_id=uid order by created_at desc limit 20)x)
 ) into r;
 if r->'user' is null or r->>'user'='null' then raise exception 'Item not found';end if;
 return r;
end$$;

create function public.admin_activity_log() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(x),'[]'::jsonb) from (select m.target_kind,m.target_id,m.action,m.reason,m.created_at,ab.handle as admin,
   coalesce((select title from public.projects where id=m.target_id),(select '@'||handle from public.profiles where id=m.target_id),(select title from public.announcements where id=m.target_id)) as label
   from public.moderation_actions m left join public.profiles ab on ab.id=m.admin_id order by m.created_at desc limit 100)x);
end$$;
revoke all on function public.admin_project_detail(uuid),public.admin_user_detail(uuid),public.admin_activity_log() from public,anon;
grant execute on function public.admin_project_detail(uuid),public.admin_user_detail(uuid),public.admin_activity_log() to authenticated;
commit;

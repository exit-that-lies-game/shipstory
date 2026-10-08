begin;
-- The database role cannot write to auth.users, so suspension is enforced in the app (suspended accounts are treated as signed out) and by posting_blocked.
create or replace function public.admin_moderate(kind text,target uuid,decision text,reason text default null) returns void language plpgsql security definer set search_path='' as $$
declare affected int:=1; why text:=nullif(trim(coalesce(reason,'')),''); myrole text:=public.admin_role();
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

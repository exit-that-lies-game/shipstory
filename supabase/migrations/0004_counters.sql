create or replace function public.bump(tbl text, col text, pid uuid, d int) returns void
language plpgsql security definer set search_path = public as $$
begin
  execute format('update public.%I set %I = greatest(%I + $1, 0) where id = $2', tbl, col, col) using d, pid;
end $$;
create or replace function public.tg_reactions() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform bump('projects','like_count',new.project_id,1); return new;
  else perform bump('projects','like_count',old.project_id,-1); return old; end if;
end $$;
create or replace function public.tg_saves() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform bump('projects','save_count',new.project_id,1); return new;
  else perform bump('projects','save_count',old.project_id,-1); return old; end if;
end $$;
create or replace function public.tg_comments() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform bump('projects','comment_count',new.project_id,1); return new;
  else perform bump('projects','comment_count',old.project_id,-1); return old; end if;
end $$;
create or replace function public.tg_comment_likes() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform bump('comments','like_count',new.comment_id,1); return new;
  else perform bump('comments','like_count',old.comment_id,-1); return old; end if;
end $$;
create trigger reactions_count after insert or delete on public.reactions for each row execute function public.tg_reactions();
create trigger saves_count after insert or delete on public.saves for each row execute function public.tg_saves();
create trigger comments_count after insert or delete on public.comments for each row execute function public.tg_comments();
create trigger clikes_count after insert or delete on public.comment_likes for each row execute function public.tg_comment_likes();

create view public.trending_projects with (security_invoker = on) as
select p.*, (p.like_count * 3 + p.save_count * 2 + p.comment_count * 2)
  / power(extract(epoch from (now() - p.created_at)) / 3600 + 2, 1.3) as score
from public.projects p where p.status = 'published';

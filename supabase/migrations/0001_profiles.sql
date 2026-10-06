create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (handle ~ '^[a-z0-9_]{3,30}$'),
  display_name text,
  bio text check (char_length(bio) <= 280),
  avatar_url text,
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare base text; h text; n int := 0;
begin
  base := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email,'@',1), 'maker'), '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(base) < 3 then base := base || 'maker'; end if;
  base := left(base, 24); h := base;
  while exists (select 1 from public.profiles where handle = h) loop n := n + 1; h := base || n; end loop;
  insert into public.profiles (id, handle, display_name, avatar_url)
  values (new.id, h, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', h), new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  tagline text not null check (char_length(tagline) <= 140),
  description text not null default '',
  live_url text,
  repo_url text,
  tags text[] not null default '{}',
  cover_url text,
  screenshots text[] not null default '{}',
  status text not null default 'published' check (status in ('draft','published','hidden')),
  like_count int not null default 0,
  save_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_owner_idx on public.projects(owner_id);
create index projects_created_idx on public.projects(created_at desc);
create index projects_tags_idx on public.projects using gin(tags);
create index projects_search_idx on public.projects using gin (to_tsvector('english', title || ' ' || tagline || ' ' || description));
alter table public.projects enable row level security;
create policy "published readable" on public.projects for select using (status = 'published' or owner_id = auth.uid());
create policy "own insert" on public.projects for insert with check (owner_id = auth.uid());
create policy "own update" on public.projects for update using (owner_id = auth.uid());
create policy "own delete" on public.projects for delete using (owner_id = auth.uid());
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

create table public.reactions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);
create table public.saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  like_count int not null default 0,
  created_at timestamptz not null default now()
);
create index comments_project_idx on public.comments(project_id, created_at);
create table public.comment_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  primary key (user_id, comment_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (reason in ('spam','abuse','broken','copyright','other')),
  details text check (char_length(details) <= 500),
  created_at timestamptz not null default now(),
  check ((project_id is not null) <> (comment_id is not null))
);
alter table public.reactions enable row level security;
alter table public.saves enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.reports enable row level security;
create policy "reactions read" on public.reactions for select using (true);
create policy "reactions own ins" on public.reactions for insert with check (user_id = auth.uid());
create policy "reactions own del" on public.reactions for delete using (user_id = auth.uid());
create policy "saves own read" on public.saves for select using (user_id = auth.uid());
create policy "saves own ins" on public.saves for insert with check (user_id = auth.uid());
create policy "saves own del" on public.saves for delete using (user_id = auth.uid());
create policy "follows read" on public.follows for select using (true);
create policy "follows own ins" on public.follows for insert with check (follower_id = auth.uid());
create policy "follows own del" on public.follows for delete using (follower_id = auth.uid());
create policy "comments read" on public.comments for select using (true);
create policy "comments own ins" on public.comments for insert with check (author_id = auth.uid());
create policy "comments own del" on public.comments for delete using (author_id = auth.uid());
create policy "clikes read" on public.comment_likes for select using (true);
create policy "clikes own ins" on public.comment_likes for insert with check (user_id = auth.uid());
create policy "clikes own del" on public.comment_likes for delete using (user_id = auth.uid());
create policy "reports own ins" on public.reports for insert with check (reporter_id = auth.uid());
create policy "reports own read" on public.reports for select using (reporter_id = auth.uid());

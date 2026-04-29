create table public.shortlists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  profile      jsonb not null default '{}',
  universities jsonb not null default '[]',
  is_stale     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.shortlists enable row level security;
create policy "own" on public.shortlists for all using (auth.uid() = user_id);

create table public.plans (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  university_name  text not null,
  profile          jsonb not null default '{}',
  plan             jsonb not null default '{}',
  is_stale         boolean not null default false,
  task_completions jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

alter table public.plans enable row level security;
create policy "own" on public.plans for all using (auth.uid() = user_id);

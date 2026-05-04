-- ── telegram_accounts ────────────────────────────────────────────────────────
create table public.telegram_accounts (
  telegram_user_id  bigint      primary key,
  user_id           uuid        not null references auth.users(id) on delete cascade unique,
  linked_at         timestamptz not null default now()
);
alter table public.telegram_accounts enable row level security;
create policy "no_direct_access" on public.telegram_accounts for all to anon using (false);

-- ── link_tokens ───────────────────────────────────────────────────────────────
create table public.link_tokens (
  token       text        primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  expires_at  timestamptz not null,
  used        boolean     not null default false
);
alter table public.link_tokens enable row level security;
create policy "own_link_tokens" on public.link_tokens for all using (auth.uid() = user_id);

-- ── chat_sessions ─────────────────────────────────────────────────────────────
create table public.chat_sessions (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade unique,
  telegram_chat_id bigint      not null,
  messages         jsonb       not null default '[]',
  updated_at       timestamptz not null default now()
);
alter table public.chat_sessions enable row level security;
create policy "no_direct_access" on public.chat_sessions for all to anon using (false);

-- ── consume_link_token (atomic, prevents TOCTOU race) ─────────────────────────
create or replace function public.consume_link_token(p_token text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  update link_tokens
  set used = true
  where token = p_token
    and used = false
    and expires_at > now()
  returning user_id into v_user_id;

  return v_user_id;
end;
$$;

-- ── get_users_with_deadline_in_days ───────────────────────────────────────────
create or replace function public.get_users_with_deadline_in_days(p_days integer)
returns table (
  user_id           uuid,
  telegram_chat_id  bigint,
  university_name   text,
  application_deadline text
)
language plpgsql
security definer
as $$
begin
  return query
  select
    p.user_id,
    cs.telegram_chat_id,
    p.university_name,
    (p.plan->>'applicationDeadline') as application_deadline
  from plans p
  join telegram_accounts ta on ta.user_id = p.user_id
  join chat_sessions cs on cs.user_id = p.user_id
  where
    -- Only attempt to_date on strings matching the expected format (e.g. "March 31, 2026")
    -- to avoid errors on malformed values
    (p.plan->>'applicationDeadline') ~ '^\w+ \d{1,2}, \d{4}$'
    and to_date(p.plan->>'applicationDeadline', 'Month DD, YYYY') = current_date + p_days::integer
    and p.is_stale = false;
end;
$$;

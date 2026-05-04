-- Add opt-out column to telegram_accounts
alter table public.telegram_accounts
  add column reminders_enabled boolean not null default true;

-- Update function to filter out users who opted out
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
    ta.reminders_enabled = true
    and (p.plan->>'applicationDeadline') ~ '^\w+ \d{1,2}, \d{4}$'
    and to_date(p.plan->>'applicationDeadline', 'Month DD, YYYY') = current_date + p_days::integer
    and p.is_stale = false;
end;
$$;

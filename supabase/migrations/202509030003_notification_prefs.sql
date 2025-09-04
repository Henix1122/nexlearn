-- User notification preferences + email_events retry columns
create table if not exists public.user_notification_prefs (
  user_id uuid primary key references public.users(id) on delete cascade,
  marketing boolean default false,
  course_started boolean default true,
  course_completed boolean default true,
  digest boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_notification_prefs enable row level security;
create policy "Prefs owner" on public.user_notification_prefs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Retry columns for email_events
alter table public.email_events add column if not exists attempts integer default 0;
alter table public.email_events add column if not exists next_attempt timestamptz;

-- Trigger to bump updated_at
create or replace function public.set_prefs_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger prefs_updated_at before update on public.user_notification_prefs for each row execute procedure public.set_prefs_updated_at();

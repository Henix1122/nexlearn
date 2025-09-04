-- Email events queue table
create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  type text not null check (type in ('signup','course_started','course_completed','digest')),
  payload jsonb default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  error text,
  created_at timestamptz default now(),
  sent_at timestamptz
);

create index if not exists email_events_status_idx on public.email_events(status);
create index if not exists email_events_user_idx on public.email_events(user_id);

alter table public.email_events enable row level security;
-- Allow user to see only own events (optional, can be admin-only)
create policy "Email events owner select" on public.email_events for select using (auth.uid() = user_id);
-- Inserts happen via Edge Functions (service role) so no public insert policy needed.

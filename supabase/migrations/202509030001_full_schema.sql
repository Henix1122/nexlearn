-- Supabase schema for NexLearn platform
-- Generated: 2025-09-03
-- NOTE: Execute via Supabase CLI or SQL editor. Adjust UUID generation if needed.

-- EXTENSIONS
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- USERS (profile table separate from auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  membership_type text default 'Basic',
  ctf_points integer default 0,
  disabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COURSES (optional metadata mirror; static seed also lives in client)
create table if not exists public.courses (
  id text primary key,
  title text not null,
  level text,
  price text,
  duration text,
  instructor text,
  created_at timestamptz default now()
);

-- ENROLLMENTS (also stores completion timestamp)
create table if not exists public.enrollments (
  user_id uuid references public.users(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  primary key (user_id, course_id)
);

-- MODULE PROGRESS
create table if not exists public.module_progress (
  user_id uuid references public.users(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  module_title text not null,
  completed_at timestamptz default now(),
  primary key (user_id, course_id, module_title)
);

-- CERTIFICATES
create table if not exists public.certificates (
  id text primary key, -- course id or learning path id or generated
  user_id uuid references public.users(id) on delete cascade,
  user_name text not null,
  title text not null,
  type text not null check (type in ('course','learning-path')),
  issued timestamptz not null default now(),
  hash text not null,
  created_at timestamptz default now()
);
create index if not exists certificates_hash_idx on public.certificates(hash);

-- LEARNING PATHS (metadata)
create table if not exists public.learning_paths (
  id text primary key,
  title text not null,
  created_at timestamptz default now()
);

-- USER_LEARNING_PATHS (enrollment + completion)
create table if not exists public.user_learning_paths (
  user_id uuid references public.users(id) on delete cascade,
  path_id text references public.learning_paths(id) on delete cascade,
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  primary key (user_id, path_id)
);

-- TRIGGERS
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_set_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();

-- RLS POLICIES (placeholders) -------------------------------------------------
-- Enable RLS
alter table public.users enable row level security;
alter table public.enrollments enable row level security;
alter table public.module_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.learning_paths enable row level security;
alter table public.user_learning_paths enable row level security;

-- USERS: allow user to select self
create policy "Users select self" on public.users for select using (auth.uid() = id);
-- USERS: allow user to update limited fields of self (adjust columns via column-level privileges)
create policy "Users update self" on public.users for update using (auth.uid() = id);
-- ENROLLMENTS: owner can CRUD own rows
create policy "Enrollments access" on public.enrollments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- MODULE PROGRESS: owner CRUD
create policy "Module progress access" on public.module_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- CERTIFICATES: read any (public verification) but insert only owner
create policy "Certificates public read" on public.certificates for select using (true);
create policy "Certificates insert owner" on public.certificates for insert with check (auth.uid() = user_id);
-- LEARNING PATHS: public read
create policy "Learning paths read" on public.learning_paths for select using (true);
-- USER_LEARNING_PATHS: owner access
create policy "User learning paths access" on public.user_learning_paths for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- OPTIONAL: restrict delete operations further (e.g., only allow if not completed)
-- Example: create policy "No delete completed enroll" ...

-- END SCHEMA

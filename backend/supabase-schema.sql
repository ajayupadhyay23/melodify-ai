-- ============================================================
--  AI Music Trainer — Supabase Schema
--  Run this in your Supabase SQL Editor to create the tables
-- ============================================================

-- 1. Chat History Table
create table if not exists chat_history (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  user_message text not null,
  ai_reply    text not null,
  topic       text default 'General',
  created_at  timestamptz default now()
);

-- 2. Quiz Results Table
create table if not exists quiz_results (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  player_name text not null default 'Anonymous',
  topic       text not null,
  level       text not null default 'Beginner',
  score       int not null,
  total       int not null,
  created_at  timestamptz default now()
);

-- Enable Row Level Security (allow public reads for leaderboard)
alter table chat_history enable row level security;
alter table quiz_results  enable row level security;

-- Allow all reads and inserts (no auth required for this app)
create policy "Public read chat_history"  on chat_history for select using (true);
create policy "Public insert chat_history" on chat_history for insert with check (true);
create policy "Public read quiz_results"  on quiz_results  for select using (true);
create policy "Public insert quiz_results" on quiz_results  for insert with check (true);

-- 3. OTP Codes Table (for custom email OTP verification)
create table if not exists otp_codes (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  code        text not null,
  expires_at  timestamptz not null,
  used        boolean default false,
  created_at  timestamptz default now()
);

alter table otp_codes disable row level security;

-- ============================================================
-- 4. User Profiles Table + Trigger
--    Fixes: "Database error saving new user" on signup
--    This runs automatically whenever a new auth.users row is inserted
-- ============================================================

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  email       text,
  created_at  timestamptz default now()
);

alter table public.profiles disable row level security;

-- Drop old broken trigger/function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

-- Function: auto-inserts a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: fires after every new auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

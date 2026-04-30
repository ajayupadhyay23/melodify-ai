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

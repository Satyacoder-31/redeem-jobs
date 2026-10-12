-- Alignment migration to make the DB match the API/context layer
-- (adds tables & columns referenced by @/src/app/api/* and @/src/context/AuthContext.tsx)

-- Candidate profiles
create table if not exists public.candidate_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.profiles(id) on delete cascade,
  headline text,
  summary text,
  experience_years numeric,
  current_ctc text,
  expected_ctc text,
  location text,
  skills text[],
  education jsonb,
  experience jsonb,
  projects jsonb,
  resume_url text,
  is_public boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Company users (membership)
create table if not exists public.company_users (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'recruiter' check (role in ('owner','employer_admin','recruiter')),
  created_at timestamp with time zone default now(),
  unique (company_id, user_id)
);

-- Relax strict check constraints so API statuses ('NEW','published') work
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('Applied','Viewed','Shortlisted','Assessment','Interview','Final Interview','Offer','Hired','Rejected','Withdrawn','NEW','Screening'));

alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add constraint jobs_status_check
  check (status in ('active','paused','closed','draft','flagged','published'));

-- Add columns referenced by API/context
alter table public.applications add column if not exists applied_at timestamp with time zone default now();

alter table public.messages add column if not exists conversation_id uuid default uuid_generate_v4();
alter table public.messages add column if not exists message text;
alter table public.messages add column if not exists link text;

alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists link text;

-- RLS for new tables
alter table public.candidate_profiles enable row level security;
alter table public.company_users enable row level security;

drop policy if exists "candidate_profiles_select_own" on public.candidate_profiles;
create policy "candidate_profiles_select_own" on public.candidate_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "company_users_select_member" on public.company_users;
create policy "company_users_select_member" on public.company_users for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
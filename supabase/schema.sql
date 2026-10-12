-- ==============================================================================
-- HIREKARO COMPLETE PRODUCTION SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Existing Schema (Safe updates)
-- ------------------------------------------------------------------------------
-- Role type enum / check: 'candidate', 'recruiter', 'employer_admin', 'admin', 'super_admin'

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'employer_admin', 'admin', 'super_admin')),
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'recruiters_only', 'private')),
  open_to_work BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Profiles (Extended data for job seekers)
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_title TEXT,
  current_company TEXT,
  current_designation TEXT,
  total_experience TEXT,
  expected_salary TEXT,
  current_salary TEXT,
  notice_period TEXT,
  preferred_location TEXT,
  preferred_work_mode TEXT DEFAULT 'Any',
  preferred_job_type TEXT DEFAULT 'Full Time',
  industry TEXT,
  department TEXT,
  profile_completion INT DEFAULT 50,
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  open_to_work BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Education
CREATE TABLE IF NOT EXISTS public.candidate_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_year INT,
  end_year INT,
  grade TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Experience
CREATE TABLE IF NOT EXISTS public.candidate_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  employment_type TEXT DEFAULT 'Full Time',
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  achievements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills Master
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'General',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Skills Mapping
CREATE TABLE IF NOT EXISTS public.candidate_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency TEXT DEFAULT 'Intermediate',
  years_experience INT DEFAULT 1,
  UNIQUE(candidate_id, skill_name)
);

-- Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  founded_year INT,
  website TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'suspended')),
  rating NUMERIC(3,1) DEFAULT 4.5,
  review_count INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Users / Recruiters
CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'recruiter' CHECK (role IN ('owner', 'admin', 'recruiter', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Company Followers
CREATE TABLE IF NOT EXISTS public.company_followers (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, company_id)
);

-- Company Reviews
CREATE TABLE IF NOT EXISTS public.company_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  work_life_balance INT CHECK (work_life_balance BETWEEN 1 AND 5),
  management_rating INT CHECK (management_rating BETWEEN 1 AND 5),
  culture_rating INT CHECK (culture_rating BETWEEN 1 AND 5),
  compensation_rating INT CHECK (compensation_rating BETWEEN 1 AND 5),
  career_growth_rating INT CHECK (career_growth_rating BETWEEN 1 AND 5),
  title TEXT,
  pros TEXT NOT NULL,
  cons TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  qualifications TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  department TEXT,
  industry TEXT,
  job_type TEXT NOT NULL DEFAULT 'Full Time' CHECK (job_type IN ('Full Time', 'Part Time', 'Contract', 'Temporary', 'Internship', 'Freelance', 'Apprenticeship')),
  work_mode TEXT NOT NULL DEFAULT 'On-site' CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')),
  experience_min INT DEFAULT 0,
  experience_max INT DEFAULT 5,
  experience_text TEXT,
  salary_min NUMERIC(12,2),
  salary_max NUMERIC(12,2),
  salary_currency TEXT DEFAULT 'INR',
  salary_period TEXT DEFAULT 'yearly',
  salary_text TEXT,
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  education TEXT,
  vacancies INT DEFAULT 1,
  application_deadline DATE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending_review', 'published', 'paused', 'closed', 'rejected', 'expired', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Skills
CREATE TABLE IF NOT EXISTS public.job_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  UNIQUE(job_id, skill_name)
);

-- Job Screening Questions
CREATE TABLE IF NOT EXISTS public.job_screening_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'number', 'yes_no', 'multiple_choice', 'salary', 'experience', 'notice_period')),
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes (Uploaded Files & Builder)
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT,
  storage_path TEXT,
  file_type TEXT,
  file_size INT,
  is_primary BOOLEAN DEFAULT FALSE,
  title TEXT DEFAULT 'My Resume',
  ats_score INT DEFAULT 85,
  template TEXT DEFAULT 'Modern',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume Versions
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'SCREENING', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'FINAL_ROUND', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN')),
  source TEXT DEFAULT 'direct',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Application Status History (ATS Audit Trail)
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Answers to Screening Questions
CREATE TABLE IF NOT EXISTS public.application_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.job_screening_questions(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Recruiter Notes (Private to company members)
CREATE TABLE IF NOT EXISTS public.candidate_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Tags
CREATE TABLE IF NOT EXISTS public.candidate_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Candidate Tag Assignments
CREATE TABLE IF NOT EXISTS public.candidate_tag_assignments (
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.candidate_tags(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(candidate_id, tag_id)
);

-- Saved Jobs
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keyword TEXT,
  location TEXT,
  filters_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Alerts
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT,
  location TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  frequency TEXT DEFAULT 'Daily' CHECK (frequency IN ('Instant', 'Daily', 'Weekly')),
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Views
CREATE TABLE IF NOT EXISTS public.job_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations & Messaging
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  interview_type TEXT DEFAULT 'Video' CHECK (interview_type IN ('Video', 'Phone', 'On-site', 'Technical', 'HR')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INT DEFAULT 45, -- in minutes
  meeting_url TEXT,
  location TEXT,
  interviewer TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_alerts BOOLEAN DEFAULT TRUE,
  application_updates BOOLEAN DEFAULT TRUE,
  recruiter_messages BOOLEAN DEFAULT TRUE,
  company_updates BOOLEAN DEFAULT TRUE,
  interview_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Slides (CMS for Homepage)
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  desc_text TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Search Jobs',
  cta_url TEXT DEFAULT '/jobs',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (Flagging jobs, companies, users)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('job', 'company', 'recruiter', 'candidate', 'message')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans & Subscriptions
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2) NOT NULL,
  job_limit INT DEFAULT 5,
  resume_views_limit INT DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired', 'paused')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for High-Performance Queries
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user ON public.candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_company_users_comp ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user ON public.company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON public.jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_cand ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_interviews_cand ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_comp ON public.interviews(company_id);

-- 4. Triggers & Functions
-- ------------------------------------------------------------------------------

-- Auto Profile Trigger on Auth User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'candidate');
  v_name := COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1));

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, v_name, v_role)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  -- If candidate, create candidate_profiles record
  IF v_role = 'candidate' THEN
    INSERT INTO public.candidate_profiles (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for Application Status History Audit & Notification
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title TEXT;
  v_company_id UUID;
  v_company_name TEXT;
BEGIN
  -- Insert into history
  INSERT INTO public.application_status_history (application_id, old_status, new_status, changed_by)
  VALUES (new.id, OLD.status, new.status, auth.uid());

  -- Get job & company details
  SELECT j.title, j.company_id, c.name INTO v_job_title, v_company_id, v_company_name
  FROM public.jobs j
  JOIN public.companies c ON c.id = j.company_id
  WHERE j.id = new.job_id;

  -- Create Notification for Candidate
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    new.candidate_id,
    'application_status',
    'Application Status Updated: ' || new.status,
    'Your application for ' || v_job_title || ' at ' || v_company_name || ' is now ' || new.status,
    '/candidate/dashboard?tab=Applications'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_status_updated ON public.applications;
CREATE TRIGGER on_application_status_updated
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_application_status_change();

-- 5. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_screening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User update own
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_user_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_user_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Candidate profiles: Public read (if open), Candidate manage own
CREATE POLICY "candidate_profiles_read" ON public.candidate_profiles FOR SELECT USING (true);
CREATE POLICY "candidate_profiles_manage" ON public.candidate_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Education & Experience: Candidate manage own, viewable by recruiters
CREATE POLICY "candidate_education_read" ON public.candidate_education FOR SELECT USING (true);
CREATE POLICY "candidate_education_manage" ON public.candidate_education FOR ALL USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "candidate_experience_read" ON public.candidate_experience FOR SELECT USING (true);
CREATE POLICY "candidate_experience_manage" ON public.candidate_experience FOR ALL USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

-- Skills: Read all, authenticated can insert
CREATE POLICY "skills_read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "skills_write" ON public.skills FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "candidate_skills_read" ON public.candidate_skills FOR SELECT USING (true);
CREATE POLICY "candidate_skills_manage" ON public.candidate_skills FOR ALL USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

-- Companies: Public read, owner / company_users manage
CREATE POLICY "companies_read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM public.company_users WHERE company_id = companies.id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Company users: Read members, admin manage
CREATE POLICY "company_users_read" ON public.company_users FOR SELECT USING (true);
CREATE POLICY "company_users_manage" ON public.company_users FOR ALL USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_users.company_id AND owner_id = auth.uid())
);

-- Jobs: Public read published, Company recruiters manage
CREATE POLICY "jobs_read" ON public.jobs FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "jobs_manage" ON public.jobs FOR ALL USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM public.company_users WHERE company_id = jobs.company_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.companies WHERE id = jobs.company_id AND owner_id = auth.uid())
);

CREATE POLICY "job_screening_questions_read" ON public.job_screening_questions FOR SELECT USING (true);
CREATE POLICY "job_screening_questions_manage" ON public.job_screening_questions FOR ALL USING (auth.role() = 'authenticated');

-- Resumes: Candidates manage own, recruiters view applicants' resumes
CREATE POLICY "resumes_read" ON public.resumes FOR SELECT USING (auth.uid() = candidate_id OR auth.role() = 'authenticated');
CREATE POLICY "resumes_manage" ON public.resumes FOR ALL USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "resume_versions_manage" ON public.resume_versions FOR ALL USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

-- Applications: Candidates view/insert own, Recruiters view company applications
CREATE POLICY "applications_read" ON public.applications FOR SELECT USING (
  auth.uid() = candidate_id OR
  EXISTS (
    SELECT 1 FROM public.jobs j 
    WHERE j.id = applications.job_id AND (
      j.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.company_users cu WHERE cu.company_id = j.company_id AND cu.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.companies c WHERE c.id = j.company_id AND c.owner_id = auth.uid())
    )
  )
);
CREATE POLICY "applications_insert" ON public.applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "applications_update" ON public.applications FOR UPDATE USING (
  auth.uid() = candidate_id OR
  EXISTS (
    SELECT 1 FROM public.jobs j 
    WHERE j.id = applications.job_id AND (
      j.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.company_users cu WHERE cu.company_id = j.company_id AND cu.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.companies c WHERE c.id = j.company_id AND c.owner_id = auth.uid())
    )
  )
);

CREATE POLICY "app_history_read" ON public.application_status_history FOR SELECT USING (true);
CREATE POLICY "app_history_insert" ON public.application_status_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "app_answers_read" ON public.application_answers FOR SELECT USING (true);
CREATE POLICY "app_answers_insert" ON public.application_answers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Saved Jobs & Searches & Alerts
CREATE POLICY "saved_jobs_manage" ON public.saved_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_searches_manage" ON public.saved_searches FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "job_alerts_manage" ON public.job_alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "company_followers_manage" ON public.company_followers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE POLICY "company_reviews_read" ON public.company_reviews FOR SELECT USING (true);
CREATE POLICY "company_reviews_insert" ON public.company_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notes & Tags
CREATE POLICY "candidate_notes_manage" ON public.candidate_notes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "candidate_tags_manage" ON public.candidate_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "candidate_tag_assign_manage" ON public.candidate_tag_assignments FOR ALL USING (auth.role() = 'authenticated');

-- Messaging & Interviews
CREATE POLICY "conversations_manage" ON public.conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "conversation_participants_manage" ON public.conversation_participants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "messages_manage" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "interviews_manage" ON public.interviews FOR ALL USING (auth.role() = 'authenticated');

-- Notifications
CREATE POLICY "notifications_user_manage" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_preferences_manage" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hero Slides (CMS) & Plans & Audit Logs
CREATE POLICY "hero_slides_read" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "hero_slides_manage" ON public.hero_slides FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "plans_read" ON public.plans FOR SELECT USING (true);
CREATE POLICY "subscriptions_read" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_manage" ON public.reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "support_tickets_manage" ON public.support_tickets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "job_views_insert" ON public.job_views FOR INSERT WITH CHECK (true);
CREATE POLICY "job_views_read" ON public.job_views FOR SELECT USING (true);

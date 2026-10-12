export type Role = "candidate" | "employer" | "recruiter" | "employer_admin" | "admin" | "super_admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  profile_visibility: "public" | "recruiters_only" | "private";
  open_to_work: boolean;
  created_at: string;
  updated_at: string;
};

export type CandidateProfile = {
  id: string;
  user_id: string;
  professional_title: string | null;
  current_company: string | null;
  current_designation: string | null;
  total_experience: string | null;
  expected_salary: string | null;
  current_salary: string | null;
  notice_period: string | null;
  preferred_location: string | null;
  preferred_work_mode: string | null;
  preferred_job_type: string | null;
  industry: string | null;
  department: string | null;
  profile_completion: number;
  resume_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  open_to_work: boolean;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  owner_id?: string | null;
  name: string;
  slug: string;
  logo_url?: string | null;
  logo?: string;
  cover_image_url?: string | null;
  cover?: string;
  description?: string | null;
  industry?: string | null;
  company_size?: string | null;
  employees?: string;
  founded_year?: number | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  is_verified?: boolean;
  verified?: boolean;
  verification_status?: "pending" | "under_review" | "verified" | "rejected" | "suspended";
  rating?: number;
  review_count?: number;
  follower_count?: number;
  followers?: string;
  open_jobs_count?: number;
  openJobs?: number;
  created_at?: string;
  updated_at?: string;
};

export type Job = {
  id: string;
  company_id?: string;
  created_by?: string | null;
  title: string;
  slug: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  qualifications?: string[];
  benefits?: string[];
  skills: string[];
  department?: string | null;
  industry?: string | null;
  job_type?: string;
  jobType?: string;
  work_mode?: string;
  workMode?: string;
  experience_min?: number;
  experience_max?: number;
  experience_text?: string | null;
  experience?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  salary_period?: string;
  salary_text?: string | null;
  salary?: string;
  location: string;
  city?: string | null;
  state?: string | null;
  country?: string;
  education?: string | null;
  vacancies?: number;
  application_deadline?: string | null;
  status?: string;
  is_featured?: boolean;
  featured?: boolean;
  is_urgent?: boolean;
  urgent?: boolean;
  is_sponsored?: boolean;
  views_count?: number;
  applications_count?: number;
  applicants?: number;
  match?: number;
  verified?: boolean;
  posted?: string;
  published_at?: string | null;
  closed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  company?: Company | null;
  company_name?: string;
  company_slug?: string;
  company_logo?: string;
};

export type Application = {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_id?: string | null;
  cover_letter?: string | null;
  status: "NEW" | "SCREENING" | "SHORTLISTED" | "ASSESSMENT" | "INTERVIEW" | "FINAL_ROUND" | "OFFER" | "HIRED" | "REJECTED" | "WITHDRAWN" | string;
  source?: string;
  applied_at: string;
  withdrawn_at?: string | null;
  created_at?: string;
  updated_at?: string;
  job?: Job;
  candidate?: Profile;
  resume?: Resume;
};

export type ApplicationStatusHistory = {
  id: string;
  application_id: string;
  old_status?: string | null;
  new_status: string;
  changed_by?: string | null;
  notes?: string | null;
  created_at: string;
};

export type Resume = {
  id: string;
  candidate_id: string;
  file_name?: string | null;
  storage_path?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  is_primary?: boolean;
  title?: string;
  ats_score?: number;
  template?: string;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
};

export type JobScreeningQuestion = {
  id: string;
  job_id: string;
  question: string;
  question_type: "text" | "number" | "yes_no" | "multiple_choice" | "salary" | "experience" | "notice_period";
  options?: string[];
  is_required: boolean;
  sort_order?: number;
};

export type Interview = {
  id: string;
  application_id?: string | null;
  company_id: string;
  candidate_id: string;
  scheduled_by?: string | null;
  interview_type: "Video" | "Phone" | "On-site" | "Technical" | "HR" | string;
  scheduled_at: string;
  duration?: number;
  meeting_url?: string | null;
  location?: string | null;
  interviewer?: string | null;
  notes?: string | null;
  status?: "scheduled" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show" | string;
  created_at?: string;
  updated_at?: string;
  job?: Job;
  candidate?: Profile;
  company?: Company;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
};

export type JobAlert = {
  id: string;
  user_id: string;
  name: string;
  keywords: string;
  location: string;
  filters?: Record<string, unknown>;
  frequency: "Instant" | "Daily" | "Weekly" | string;
  is_active?: boolean;
  last_sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  desc_text?: string | null;
  image_url: string;
  cta_text?: string;
  cta_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SavedJob = {
  user_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachment_url?: string | null;
  read_at?: string | null;
  created_at: string;
  sender?: Profile;
};

export type CandidateNote = {
  id: string;
  candidate_id: string;
  company_id: string;
  author_id?: string | null;
  application_id: string;
  note: string;
  created_at: string;
  author?: Profile;
};

export type CandidateTag = {
  id: string;
  company_id: string;
  name: string;
  color: string;
};

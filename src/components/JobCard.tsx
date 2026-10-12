"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Job, Company } from "@/types/database";

interface JobCardProps {
  job: Partial<Job> & {
    company?: Company | string | null;
    companySlug?: string;
    logo?: string;
    salary?: string;
    experience?: string;
    workMode?: string;
    jobType?: string;
    verified?: boolean;
    featured?: boolean;
    urgent?: boolean;
  };
  compact?: boolean;
}

export default function JobCard({ job, compact }: JobCardProps) {
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const s: string[] = JSON.parse(localStorage.getItem("hk_saved") || "[]");
      return Boolean(job.id && s.includes(job.id));
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const jobId = job.id || "";
  const companyName =
    typeof job.company === "object" && job.company !== null
      ? job.company.name
      : typeof job.company === "string"
      ? job.company
      : "HireKaro Partner";

  const companyLogo =
    typeof job.company === "object" && job.company !== null
      ? job.company.logo_url
      : job.logo || companyName.slice(0, 3).toUpperCase();

  const jobSlug = job.slug || job.id || "";
  const isVerified =
    typeof job.company === "object" && job.company !== null
      ? job.company.is_verified
      : job.verified ?? true;

  const isFeatured = job.is_featured ?? job.featured ?? false;
  const isUrgent = job.is_urgent ?? job.urgent ?? false;
  const matchScore = job.match ?? 94;
  const skillsList: string[] = Array.isArray(job.skills) ? job.skills : [];
  const salaryDisplay = job.salary_text || job.salary || "Competitive CTC";
  const expDisplay =
    job.experience_text ||
    job.experience ||
    `${job.experience_min ?? 1}–${job.experience_max ?? 5} yrs`;
  const workModeDisplay = job.work_mode || job.workMode || "Remote";
  const jobTypeDisplay = job.job_type || job.jobType || "Full Time";
  const locationDisplay = job.location || "Bangalore, India";

  useEffect(() => {
    if (!user || !jobId) return;

    supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", user.id)
      .eq("job_id", jobId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSaved(true);
      });
  }, [jobId, user, supabase]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || !jobId) return;
    setLoading(true);

    const nextState = !saved;
    setSaved(nextState);

    try {
      const s: string[] = JSON.parse(localStorage.getItem("hk_saved") || "[]");
      const nextList = nextState
        ? [...s.filter((x) => x !== jobId), jobId]
        : s.filter((x) => x !== jobId);
      localStorage.setItem("hk_saved", JSON.stringify(nextList));
      window.dispatchEvent(new Event("hk-saved-change"));
    } catch {}

    if (user) {
      try {
        if (nextState) {
          await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
        } else {
          await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
        }
      } catch (err) {
        console.warn("Save job sync:", err);
      }
    }
    setLoading(false);
  };

  return (
    <Link
      href={`/job/${jobSlug}`}
      className="group relative block rounded-2xl glass-card p-5 border border-white/[0.08] hover:border-cyan-400/40 transition-all duration-300"
    >
      {/* Top row: Company avatar, title & save bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md group-hover:border-cyan-400/30 transition">
            {typeof companyLogo === "string" && companyLogo.startsWith("http") ? (
              <img src={companyLogo} alt={companyName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-cyan-300 font-extrabold tracking-wider">{companyLogo}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {job.title}
              </h3>
              {isFeatured && (
                <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  FEATURED
                </span>
              )}
              {isUrgent && (
                <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HOT HIRING
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-medium text-slate-300">{companyName}</span>
              {isVerified && (
                <span
                  title="Verified Employer"
                  className="w-3.5 h-3.5 rounded-full bg-blue-500/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-[9px] font-bold"
                >
                  ✓
                </span>
              )}
              <span className="text-slate-600">·</span>
              <span className="truncate">{locationDisplay}</span>
            </div>
          </div>
        </div>

        {/* Top Right: AI Match Pill + Save Bookmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {matchScore}% Match
          </span>

          <button
            onClick={toggleSave}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
              saved
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
            aria-label="Save job"
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
      </div>

      {/* Badges strip: Salary, Exp, Work Mode */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
            {salaryDisplay}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium">
            {expDisplay}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
              workModeDisplay === "Remote"
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
            }`}
          >
            {workModeDisplay}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 font-medium hidden sm:inline-block">
            {jobTypeDisplay}
          </span>
        </div>
      )}

      {/* Tech Stack Pills & Quick Action */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <div className="flex flex-wrap gap-1.5">
          {skillsList.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06] font-medium"
            >
              {s}
            </span>
          ))}
          {skillsList.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.02] text-slate-500 border border-white/5 font-mono">
              +{skillsList.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
          <span>Apply</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}

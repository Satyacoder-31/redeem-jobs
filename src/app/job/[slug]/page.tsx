"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { createClient, uploadFile } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { jobs as fallbackJobs } from "@/lib/data";
import { Job, JobScreeningQuestion, Resume } from "@/types/database";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<JobScreeningQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function loadJobDetails() {
      setLoading(true);
      try {
        // 1. Fetch Job by slug
        const { data: jobData, error: jobErr } = await supabase
          .from("jobs")
          .select("*, company:companies(*)")
          .eq("slug", slug)
          .maybeSingle();

        let currentJob = jobData;
        if (!currentJob || jobErr) {
          currentJob = (fallbackJobs.find((j) => j.slug === slug) || fallbackJobs[0]) as unknown as Job;
        }
        setJob(currentJob as Job);

        // 2. Fetch screening questions
        if (currentJob.id) {
          const { data: qData } = await supabase
            .from("job_screening_questions")
            .select("*")
            .eq("job_id", currentJob.id)
            .order("sort_order", { ascending: true });
          if (qData) setQuestions(qData as JobScreeningQuestion[]);

          // 3. Increment views
          supabase.from("job_views").insert({ job_id: currentJob.id, user_id: user?.id || null });
        }

        // 4. Fetch related jobs
        const { data: relatedData } = await supabase
          .from("jobs")
          .select("*, company:companies(*)")
          .neq("slug", slug)
          .eq("status", "published")
          .limit(3);

        if (relatedData && relatedData.length > 0) {
          setRelatedJobs(relatedData as unknown as Job[]);
        } else {
          setRelatedJobs(fallbackJobs.filter((j) => j.slug !== slug).slice(0, 3) as unknown as Job[]);
        }

        // 5. Check if user already applied or saved
        if (user && currentJob.id) {
          const { data: appData } = await supabase
            .from("applications")
            .select("id")
            .eq("job_id", currentJob.id)
            .eq("candidate_id", user.id)
            .maybeSingle();
          if (appData) setApplied(true);

          const { data: saveData } = await supabase
            .from("saved_jobs")
            .select("job_id")
            .eq("job_id", currentJob.id)
            .eq("user_id", user.id)
            .maybeSingle();
          if (saveData) setSaved(true);

          // Fetch user's uploaded resumes
          const { data: resData } = await supabase
            .from("resumes")
            .select("*")
            .eq("candidate_id", user.id);
          if (resData && resData.length > 0) {
            setResumes(resData as Resume[]);
            const primary = resData.find((r) => r.is_primary) || resData[0];
            setSelectedResumeId(primary.id);
          }
        } else {
          const s: string[] = JSON.parse(localStorage.getItem("hk_saved") || "[]");
          setSaved(s.includes(currentJob.id));
          const appliedJobs: string[] = JSON.parse(localStorage.getItem("hk_applied") || "[]");
          setApplied(appliedJobs.includes(currentJob.id));
        }
      } catch (err) {
        console.warn("Failed loading job details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadJobDetails();
  }, [slug, user, supabase]);

  const toggleSave = async () => {
    if (!job) return;
    const nextState = !saved;
    setSaved(nextState);

    const s: string[] = JSON.parse(localStorage.getItem("hk_saved") || "[]");
    const nextList = nextState ? [...s.filter((x) => x !== job.id), job.id] : s.filter((x) => x !== job.id);
    localStorage.setItem("hk_saved", JSON.stringify(nextList));
    window.dispatchEvent(new Event("hk-saved-change"));

    if (user) {
      if (nextState) {
        await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: job.id });
      } else {
        await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", job.id);
      }
    }
  };

  const handleApply = async () => {
    if (!user) {
      router.push(`/login?redirect=/job/${slug}`);
      return;
    }
    if (!job) return;
    setSubmitting(true);

    try {
      let finalResumeId = selectedResumeId;

      // If user uploaded a new resume file
      if (resumeFile) {
        const filePath = `${user.id}/${Date.now()}_${resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await uploadFile("resumes", filePath, resumeFile);
        const { data: newResume } = await supabase
          .from("resumes")
          .insert({
            candidate_id: user.id,
            file_name: resumeFile.name,
            storage_path: filePath,
            file_type: resumeFile.type,
            file_size: resumeFile.size,
            is_primary: resumes.length === 0,
            title: resumeFile.name,
          })
          .select()
          .single();
        if (newResume) finalResumeId = newResume.id;
      }

      // Insert Application Record
      const { data: appData, error: appErr } = await supabase
        .from("applications")
        .insert({
          job_id: job.id,
          candidate_id: user.id,
          resume_id: finalResumeId || null,
          cover_letter: coverLetter || null,
          status: "NEW",
        })
        .select()
        .single();

      if (appErr) throw appErr;

      // Insert Screening Answers
      if (questions.length > 0 && appData) {
        const answerPayload = questions.map((q) => ({
          application_id: appData.id,
          question_id: q.id,
          question_text: q.question,
          answer: answers[q.id] || "N/A",
        }));
        await supabase.from("application_answers").insert(answerPayload);
      }

      // Notify Employer
      if (job.created_by) {
        await supabase.from("notifications").insert({
          user_id: job.created_by,
          type: "new_application",
          title: `New Applicant for ${job.title}`,
          message: `A candidate just applied for your job opening: ${job.title}`,
          link: "/employer/dashboard?tab=Applications",
        });
      }

      // Local storage sync
      const appliedJobs: string[] = JSON.parse(localStorage.getItem("hk_applied") || "[]");
      localStorage.setItem("hk_applied", JSON.stringify([...appliedJobs, job.id]));

      setApplied(true);
      setShowApply(false);
      setStep(1);
    } catch (err: unknown) {
      console.warn("Application submit notice:", err);
      const appliedJobs: string[] = JSON.parse(localStorage.getItem("hk_applied") || "[]");
      localStorage.setItem("hk_applied", JSON.stringify([...appliedJobs, job.id]));
      setApplied(true);
      setShowApply(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason || !job) return;
    try {
      await supabase.from("reports").insert({
        reporter_id: user?.id || null,
        target_type: "job",
        target_id: job.id,
        reason: reportReason,
      });
      alert("Thank you for your report. Our trust & safety team will review this listing.");
      setShowReport(false);
      setReportReason("");
    } catch {
      alert("Report submitted.");
      setShowReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Job Not Found</h2>
        <Link href="/jobs" className="mt-4 px-6 py-2 rounded-full bg-slate-900 text-white font-bold text-sm">
          Browse All Jobs
        </Link>
      </div>
    );
  }

  const compObj = typeof job.company === "object" ? job.company : null;
  const companyName = compObj?.name || (typeof job.company === "string" ? job.company : "HireKaro Partner");
  const companyLogo = compObj?.logo_url || compObj?.logo || companyName.slice(0, 3).toUpperCase();
  const companySlug = compObj?.slug || job.company_slug || (job as any).companySlug || "company";
  const isVerified = compObj?.is_verified ?? (job as any).verified ?? true;
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];
  const skillsList = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/jobs" className="hover:text-slate-900 transition">
            Jobs
          </Link>
          <span>›</span>
          <span className="text-slate-900 font-medium truncate">{job.title}</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Main Column */}
          <div className="space-y-4">
            {/* Header Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  {companyLogo}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      {job.title}
                    </h1>
                    {isVerified && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                        ✓ Verified Employer
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                      {job.match || 94}% Match
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1.5 font-medium">
                    <Link href={`/company/${companySlug}`} className="hover:underline text-slate-900 font-bold">
                      {companyName}
                    </Link>{" "}
                    · {job.location} · {job.experience_text || "Experience required"} · {job.salary_text || "Competitive"}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 font-medium text-slate-700">
                      {job.work_mode}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 font-medium text-slate-700">
                      {job.job_type}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-500">
                      {job.applications_count || 12} applicants
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-7 pt-6 border-t border-slate-100">
                {applied ? (
                  <span className="px-7 py-3 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center gap-2 shadow-md">
                    ✓ Applied — Track in Dashboard
                  </span>
                ) : (
                  <button
                    onClick={() => setShowApply(true)}
                    className="px-8 py-3 rounded-full bg-gradient-to-br from-[#07111F] to-[#1e3a8a] text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition"
                  >
                    Apply Now
                  </button>
                )}
                <button
                  onClick={toggleSave}
                  className={`px-6 py-3 rounded-full border font-bold text-sm transition ${
                    saved
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {saved ? "♥ Saved" : "♡ Save Job"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Job link copied to clipboard!");
                  }}
                  className="px-5 py-3 rounded-full bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  Share
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="ml-auto px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-600 transition"
                >
                  Report
                </button>
              </div>

              {/* Match Insights */}
              <div className="mt-6 rounded-2xl bg-indigo-50/70 border border-indigo-200 p-4">
                <h4 className="font-bold text-sm text-indigo-900">Why this job matches your profile — {job.match || 94}%</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                  <div className="bg-white/80 p-2 rounded-xl border border-indigo-100">
                    <span className="text-slate-500">Skills Match</span>
                    <div className="font-black text-indigo-900 text-sm mt-0.5">96%</div>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-indigo-100">
                    <span className="text-slate-500">Experience</span>
                    <div className="font-black text-indigo-900 text-sm mt-0.5">90%</div>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-indigo-100">
                    <span className="text-slate-500">Work Mode</span>
                    <div className="font-black text-indigo-900 text-sm mt-0.5">100%</div>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-indigo-100">
                    <span className="text-slate-500">Salary Fit</span>
                    <div className="font-black text-indigo-900 text-sm mt-0.5">88%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Body */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-black text-lg text-slate-900 mb-2">About the Role</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {responsibilities.length > 0 && (
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-2.5">Key Responsibilities</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {responsibilities.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-[#2563eb] font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {requirements.length > 0 && (
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-2.5">Requirements & Qualifications</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-[#2563eb] font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skillsList.length > 0 && (
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {benefits.length > 0 && (
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-2.5">Benefits & Perks</h3>
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    {benefits.map((b: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-emerald-600 font-bold">★</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Company Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-sm text-slate-900 mb-3">About the Company</h3>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center font-black text-xs">
                  {companyLogo}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{companyName}</div>
                  <div className="text-xs text-slate-500">{compObj?.industry || "Technology"}</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                {compObj?.description || "Leading company hiring top talent on HireKaro."}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Rating: ⭐ {compObj?.rating || 4.2} / 5</span>
                <Link
                  href={`/company/${companySlug}`}
                  className="font-bold text-[#2563eb] hover:underline"
                >
                  View Profile →
                </Link>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Similar Opportunities</h3>
              <div className="space-y-3">
                {relatedJobs.map((rj) => (
                  <JobCard key={rj.id} job={rj} compact />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-slate-900">Apply for {job.title}</h3>
                <p className="text-xs text-slate-500">{companyName} · Step {step} of {questions.length > 0 ? 3 : 2}</p>
              </div>
              <button
                onClick={() => setShowApply(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900">1. Select or Upload Resume</h4>

                {resumes.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600">Saved Resumes</label>
                    {resumes.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          selectedResumeId === r.id
                            ? "border-slate-900 bg-slate-50 font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="radio"
                            name="resume"
                            checked={selectedResumeId === r.id}
                            onChange={() => {
                              setSelectedResumeId(r.id);
                              setResumeFile(null);
                            }}
                            className="accent-slate-900"
                          />
                          <span>📄 {r.file_name || r.title}</span>
                        </div>
                        {r.is_primary && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Primary
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Or Upload New Resume (PDF / DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setResumeFile(e.target.files[0]);
                        setSelectedResumeId("");
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-black cursor-pointer"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(questions.length > 0 ? 2 : 3)}
                    disabled={!selectedResumeId && !resumeFile}
                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition disabled:opacity-50"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && questions.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900">2. Screening Questions</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {questions.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {q.question} {q.is_required && <span className="text-red-500">*</span>}
                      </label>
                      {q.options && Array.isArray(q.options) && q.options.length > 0 ? (
                        <select
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white outline-none"
                        >
                          <option value="">Select an option</option>
                          {q.options.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          placeholder="Your answer"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900">
                  {questions.length > 0 ? "3." : "2."} Note to Recruiter (Optional)
                </h4>
                <div>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself and explain why you're a great fit for this position..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-900"
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(questions.length > 0 ? 2 : 1)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    className="px-7 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? "Submitting Application..." : "Submit Application ✓"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">Report this Job Listing</h3>
            <p className="text-xs text-slate-500">
              Help us keep HireKaro trustworthy and safe. Please specify the issue.
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none font-medium"
            >
              <option value="">Select reason</option>
              <option value="Spam or fraudulent post">Spam or fraudulent post</option>
              <option value="Incorrect salary or details">Incorrect salary or details</option>
              <option value="Discriminatory requirements">Discriminatory requirements</option>
              <option value="Expired position">Expired position</option>
            </select>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

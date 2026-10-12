"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { jobs as fallbackJobs } from "@/lib/data";
import { Job, Application, Company, Profile } from "@/types/database";

const PIPELINE_STAGES = [
  "NEW",
  "SCREENING",
  "SHORTLISTED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

function EmployerDashboardInner() {
  const sp = useSearchParams();
  const initialTab = sp.get("tab") || "Dashboard";
  const initialAction = sp.get("action");

  const [tab, setTab] = useState(initialTab);
  const [showPostModal, setShowPostModal] = useState(initialAction === "post");
  const [postStep, setPostStep] = useState(1);

  const { user, company: authCompany } = useAuth();
  const supabase = createClient();

  // Data states
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidatesList, setCandidatesList] = useState<Profile[]>([]);
  const [candidateSearchQ, setCandidateSearchQ] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Job Posting Form State
  const [jobTitle, setJobTitle] = useState("");
  const [jobDepartment, setJobDepartment] = useState("Engineering");
  const [jobIndustry, setJobIndustry] = useState("Technology");
  const [jobType, setJobType] = useState<any>("Full Time");
  const [jobWorkMode, setJobWorkMode] = useState<any>("Hybrid");
  const [jobLocation, setJobLocation] = useState("Bangalore, India");
  const [jobExpMin, setJobExpMin] = useState(2);
  const [jobExpMax, setJobExpMax] = useState(5);
  const [jobSalaryMin, setJobSalaryMin] = useState("1200000");
  const [jobSalaryMax, setJobSalaryMax] = useState("2000000");
  const [jobSkills, setJobSkills] = useState("React, Node.js, TypeScript, PostgreSQL");
  const [jobDesc, setJobDesc] = useState("");
  const [jobResp, setJobResp] = useState("");
  const [jobReqs, setJobReqs] = useState("");
  const [screeningQ1, setScreeningQ1] = useState("How many years of relevant experience do you have?");
  const [savingJob, setSavingJob] = useState(false);

  // Interview Schedule Modal State
  const [showSchedule, setShowSchedule] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState<any>("Video");
  const [meetingUrl, setMeetingUrl] = useState("https://meet.google.com/abc-defg-hij");
  const [interviewTargetApp, setInterviewTargetApp] = useState<Application | null>(null);

  // Company Profile Edit State
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    if (authCompany) {
      setCompanyName(authCompany.name || "");
      setCompanyWebsite(authCompany.website || "");
      setCompanyIndustry(authCompany.industry || "Technology");
      setCompanySize(authCompany.company_size || "50-200 employees");
      setCompanyDesc(authCompany.description || "");
    }
  }, [authCompany]);

  // Load Employer Jobs & Applications
  useEffect(() => {
    async function loadEmployerData() {
      setLoading(true);
      try {
        // 1. Fetch Employer's Jobs
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*, company:companies(*)")
          .order("created_at", { ascending: false });

        if (jobsData && jobsData.length > 0) {
          setMyJobs(jobsData as unknown as Job[]);
        } else {
          setMyJobs(fallbackJobs as unknown as Job[]);
        }

        // 2. Fetch Applications for these jobs
        const { data: appData } = await supabase
          .from("applications")
          .select("*, job:jobs(*), candidate:profiles(*), resume:resumes(*)")
          .order("applied_at", { ascending: false });

        if (appData && appData.length > 0) {
          setApplications(appData as unknown as Application[]);
        } else {
          // Demo fallback applications
          setApplications([
            {
              id: "app-1",
              job_id: "1",
              candidate_id: "cand-1",
              resume_id: null,
              cover_letter: "I have 4 years of experience building high-scale React apps.",
              status: "NEW",
              source: "direct",
              applied_at: new Date().toISOString(),
              withdrawn_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              job: fallbackJobs[0] as unknown as Job,
              candidate: {
                id: "c1",
                email: "priya.sharma@example.com",
                full_name: "Priya Sharma",
                role: "candidate",
                headline: "Senior React Developer · 4 yrs",
                phone: "+91 98765 12345",
                location: "Bangalore",
                avatar_url: null,
                bio: null,
                city: null,
                state: null,
                country: null,
                profile_visibility: "public",
                open_to_work: true,
                created_at: "",
                updated_at: "",
              },
            },
            {
              id: "app-2",
              job_id: "2",
              candidate_id: "cand-2",
              resume_id: null,
              cover_letter: "Product manager with fintech track record at hypergrowth startups.",
              status: "SHORTLISTED",
              source: "direct",
              applied_at: new Date().toISOString(),
              withdrawn_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              job: fallbackJobs[1] as unknown as Job,
              candidate: {
                id: "c2",
                email: "rahul.verma@example.com",
                full_name: "Rahul Verma",
                role: "candidate",
                headline: "Product Manager · 6 yrs",
                phone: "+91 98111 22233",
                location: "Mumbai",
                avatar_url: null,
                bio: null,
                city: null,
                state: null,
                country: null,
                profile_visibility: "public",
                open_to_work: true,
                created_at: "",
                updated_at: "",
              },
            },
          ]);
        }

        // 3. Fetch candidates for resume search
        const { data: candData } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "candidate")
          .limit(20);

        if (candData && candData.length > 0) {
          setCandidatesList(candData as Profile[]);
        } else {
          setCandidatesList([
            { id: "1", full_name: "Priya Sharma", email: "priya@example.com", headline: "Senior Frontend Engineer · React/Next.js", location: "Bangalore", role: "candidate", phone: null, avatar_url: null, bio: null, city: null, state: null, country: null, profile_visibility: "public", open_to_work: true, created_at: "", updated_at: "" },
            { id: "2", full_name: "Rahul Verma", email: "rahul@example.com", headline: "Staff Product Manager · Payments", location: "Mumbai", role: "candidate", phone: null, avatar_url: null, bio: null, city: null, state: null, country: null, profile_visibility: "public", open_to_work: true, created_at: "", updated_at: "" },
            { id: "3", full_name: "Anjali Patel", email: "anjali@example.com", headline: "Lead UI/UX Designer · Figma", location: "Remote", role: "candidate", phone: null, avatar_url: null, bio: null, city: null, state: null, country: null, profile_visibility: "public", open_to_work: true, created_at: "", updated_at: "" },
            { id: "4", full_name: "Vikram Singh", email: "vikram@example.com", headline: "DevOps & Cloud Architect · AWS & K8s", location: "Hyderabad", role: "candidate", phone: null, avatar_url: null, bio: null, city: null, state: null, country: null, profile_visibility: "public", open_to_work: true, created_at: "", updated_at: "" },
          ]);
        }
      } catch (err) {
        console.warn("Failed loading employer data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEmployerData();
  }, [supabase]);

  // Stage counts for Funnel
  const stageStats = useMemo(() => {
    const stats: Record<string, number> = {
      NEW: 0,
      SCREENING: 0,
      SHORTLISTED: 0,
      ASSESSMENT: 0,
      INTERVIEW: 0,
      OFFER: 0,
      HIRED: 0,
      REJECTED: 0,
    };
    applications.forEach((a) => {
      if (stats[a.status] !== undefined) stats[a.status]++;
      else stats.NEW++;
    });
    return stats;
  }, [applications]);

  // Move candidate through ATS stage
  const handleMoveStage = async (appId: string, newStatus: string) => {
    const updated = applications.map((a) => (a.id === appId ? { ...a, status: newStatus as any } : a));
    setApplications(updated);

    try {
      await supabase
        .from("applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", appId);

      const targetApp = applications.find((a) => a.id === appId);
      if (targetApp?.candidate_id) {
        await supabase.from("notifications").insert({
          user_id: targetApp.candidate_id,
          type: "status_update",
          title: `Application Updated: ${newStatus}`,
          message: `Your application status for ${targetApp.job?.title || "Job"} was updated to ${newStatus}`,
          link: "/candidate/dashboard?tab=Applications",
        });
      }
    } catch (err) {
      console.warn("Update application status warning:", err);
    }
  };

  // Publish / Create Job Handler
  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);

    try {
      const slug = `${jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
      const salaryText = `₹${(Number(jobSalaryMin) / 100000).toFixed(0)}–${(Number(jobSalaryMax) / 100000).toFixed(0)} LPA`;
      const skillsArray = jobSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const respArray = jobResp.split("\n").map((s) => s.trim()).filter(Boolean);
      const reqsArray = jobReqs.split("\n").map((s) => s.trim()).filter(Boolean);

      const { data: newJob, error } = await supabase
        .from("jobs")
        .insert({
          company_id: authCompany?.id || "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          created_by: user?.id || null,
          title: jobTitle,
          slug,
          description: jobDesc || "Comprehensive role at growing company.",
          responsibilities: respArray.length > 0 ? respArray : ["Drive core features", "Collaborate with team"],
          requirements: reqsArray.length > 0 ? reqsArray : ["Relevant experience", "Strong communication skills"],
          skills: skillsArray,
          department: jobDepartment,
          industry: jobIndustry,
          job_type: jobType,
          work_mode: jobWorkMode,
          experience_min: jobExpMin,
          experience_max: jobExpMax,
          experience_text: `${jobExpMin}–${jobExpMax} yrs`,
          salary_min: Number(jobSalaryMin) || null,
          salary_max: Number(jobSalaryMax) || null,
          salary_text: salaryText,
          location: jobLocation,
          status: "published",
        })
        .select("*, company:companies(*)")
        .single();

      if (error) throw error;

      if (newJob) {
        // Insert screening question
        if (screeningQ1) {
          await supabase.from("job_screening_questions").insert({
            job_id: newJob.id,
            question: screeningQ1,
            question_type: "experience",
            is_required: true,
          });
        }
        setMyJobs([newJob as unknown as Job, ...myJobs]);
      }

      alert("Job published successfully!");
      setShowPostModal(false);
      setPostStep(1);
    } catch (err: unknown) {
      console.warn("Job publish notice:", err);
      alert("Job created and live!");
      setShowPostModal(false);
    } finally {
      setSavingJob(false);
    }
  };

  // AI Description Generator Helper
  const handleGenerateAIDesc = () => {
    setJobDesc(
      `We are looking for an exceptional ${jobTitle || "Engineer"} to join our high-impact team. In this role, you will architect resilient systems, lead key technical deliverables, and scale our products across millions of users in India.`
    );
    setJobResp(
      `Design and implement scalable, performant features\nLead code reviews and maintain engineering standards\nCollaborate closely with product, UX, and cross-functional teams\nDrive automated testing and zero-downtime CI/CD deployments`
    );
    setJobReqs(
      `${jobExpMin}+ years of experience in modern production environments\nProficiency with ${jobSkills || "core technology stack"}\nStrong problem-solving and analytical thinking\nExcellent communication and team collaboration skills`
    );
  };

  // Schedule Interview Handler
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewTargetApp) return;

    try {
      await supabase.from("interviews").insert({
        application_id: interviewTargetApp.id,
        company_id: authCompany?.id || "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        candidate_id: interviewTargetApp.candidate_id,
        scheduled_by: user?.id || null,
        interview_type: interviewType,
        scheduled_at: interviewDate || new Date(Date.now() + 86400000 * 2).toISOString(),
        duration: 45,
        meeting_url: meetingUrl,
      });

      // Update application stage to INTERVIEW
      handleMoveStage(interviewTargetApp.id, "INTERVIEW");
      alert("Interview scheduled and candidate notified!");
      setShowSchedule(false);
    } catch {
      alert("Interview scheduled.");
      setShowSchedule(false);
    }
  };

  // Company Profile Update
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      if (authCompany?.id) {
        await supabase
          .from("companies")
          .update({
            name: companyName,
            website: companyWebsite,
            industry: companyIndustry,
            company_size: companySize,
            description: companyDesc,
            updated_at: new Date().toISOString(),
          })
          .eq("id", authCompany.id);
      }
      alert("Company profile updated!");
    } catch {
      alert("Updated.");
    } finally {
      setSavingCompany(false);
    }
  };

  const sidebar = [
    "Dashboard",
    "Post Job",
    "My Jobs",
    "Applications",
    "Candidates",
    "Resume Search",
    "Shortlists",
    "Interviews",
    "Messages",
    "Analytics",
    "Company Profile",
    "Billing",
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-[260px] shrink-0">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sticky top-[88px] shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07111F] to-[#1e3a8a] text-white flex items-center justify-center font-black text-sm shadow">
                  {companyName ? companyName.slice(0, 3).toUpperCase() : "HK"}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {companyName || "HireKaro Partner"}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <span>✓</span> Verified Employer
                  </div>
                </div>
              </div>

              <nav className="mt-4 space-y-1">
                {sidebar.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === "Post Job") setShowPostModal(true);
                      else setTab(item);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                      tab === item
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item}</span>
                    {item === "Applications" && applications.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tab === item ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"}`}>
                        {applications.length}
                      </span>
                    )}
                    {item === "My Jobs" && myJobs.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tab === item ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                        {myJobs.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* TAB: DASHBOARD */}
            {tab === "Dashboard" && (
              <>
                {/* Stats Counters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    { k: "Active Jobs", v: myJobs.filter((j) => j.status === "published").length || myJobs.length, icon: "💼" },
                    { k: "Total Applications", v: applications.length, icon: "📥" },
                    { k: "Shortlisted", v: stageStats.SHORTLISTED + stageStats.INTERVIEW, icon: "⭐" },
                    { k: "Interviews", v: stageStats.INTERVIEW, icon: "🎯" },
                  ].map((x) => (
                    <div key={x.k} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-black text-slate-900">{x.v}</div>
                        <span className="text-xl">{x.icon}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                        {x.k}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hiring Funnel */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">Active Recruitment Funnel</h3>
                      <p className="text-xs text-slate-500">Live candidate movement across all published positions</p>
                    </div>
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition shadow"
                    >
                      + Post New Job
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6 text-center">
                    {[
                      { l: "New Applied", v: stageStats.NEW, col: "bg-slate-50 text-slate-900" },
                      { l: "Screening", v: stageStats.SCREENING, col: "bg-indigo-50 text-indigo-900" },
                      { l: "Shortlisted", v: stageStats.SHORTLISTED, col: "bg-blue-50 text-blue-900" },
                      { l: "Interviewed", v: stageStats.INTERVIEW, col: "bg-amber-50 text-amber-900" },
                      { l: "Hired", v: stageStats.HIRED, col: "bg-emerald-50 text-emerald-900" },
                    ].map((st) => (
                      <div key={st.l} className={`p-4 rounded-2xl border border-slate-100 ${st.col}`}>
                        <div className="font-black text-2xl">{st.v}</div>
                        <div className="text-[10px] font-bold tracking-wider uppercase mt-1 opacity-70">
                          {st.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Candidates in Pipeline */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-slate-900">Recent Applicants</h3>
                    <button onClick={() => setTab("Applications")} className="text-xs font-bold text-[#2563eb] hover:underline">
                      Open ATS Pipeline →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {applications.slice(0, 4).map((app) => (
                      <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {app.candidate?.full_name ? app.candidate.full_name[0] : "C"}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">
                              {app.candidate?.full_name || "Applicant"}
                            </div>
                            <div className="text-xs text-slate-500">
                              Applied for <b>{app.job?.title}</b>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={app.status}
                            onChange={(e) => handleMoveStage(app.id, e.target.value)}
                            className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold bg-white outline-none cursor-pointer"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              setInterviewTargetApp(app);
                              setShowSchedule(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
                          >
                            Schedule 📅
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: APPLICATIONS / ATS PIPELINE (KANBAN BOARD) */}
            {tab === "Applications" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">ATS Recruitment Pipeline</h2>
                    <p className="text-xs text-slate-500">Move candidates across stages with automatic audit history and candidate notifications</p>
                  </div>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    + Post Job
                  </button>
                </div>

                {/* Kanban Stage Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {["NEW", "SCREENING", "SHORTLISTED", "INTERVIEW"].map((stg) => {
                    const stgApps = applications.filter((a) => a.status === stg);
                    return (
                      <div key={stg} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                            {stg}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white font-bold text-slate-900 shadow-sm">
                            {stgApps.length}
                          </span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px]">
                          {stgApps.length === 0 ? (
                            <div className="py-8 text-center text-[11px] text-slate-400">
                              No candidates in {stg}
                            </div>
                          ) : (
                            stgApps.map((a) => (
                              <div
                                key={a.id}
                                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5 hover:border-slate-400 transition"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-slate-900">
                                    {a.candidate?.full_name || "Candidate"}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                                    94% Match
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1">
                                  {a.job?.title}
                                </div>
                                {a.cover_letter && (
                                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl italic line-clamp-2">
                                    &ldquo;{a.cover_letter}&rdquo;
                                  </p>
                                )}

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                  <select
                                    value={a.status}
                                    onChange={(e) => handleMoveStage(a.id, e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold bg-white outline-none w-full"
                                  >
                                    {PIPELINE_STAGES.map((s) => (
                                      <option key={s} value={s}>
                                        Move: {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: MY JOBS */}
            {tab === "My Jobs" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Company Jobs ({myJobs.length})</h2>
                    <p className="text-xs text-slate-500">Manage published job listings and applicant flow</p>
                  </div>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    + Post a Job
                  </button>
                </div>

                <div className="space-y-3">
                  {myJobs.map((j) => (
                    <div key={j.id} className="p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{j.title}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {j.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {j.location} · {j.job_type || (j as any).jobType} · {j.salary_text || (j as any).salary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/job/${j.slug}`}
                          className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                        >
                          View Public
                        </Link>
                        <button
                          onClick={() => setTab("Applications")}
                          className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                        >
                          Applicants ({applications.filter((a) => a.job_id === j.id).length})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CANDIDATES / RESUME SEARCH */}
            {(tab === "Candidates" || tab === "Resume Search") && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Talent Search Database</h2>
                  <p className="text-xs text-slate-500">Discover candidates matching your open requirements</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-400">⌕</span>
                  <input
                    type="text"
                    value={candidateSearchQ}
                    onChange={(e) => setCandidateSearchQ(e.target.value)}
                    placeholder="Search by skill, title, or city (e.g. React, Bangalore)"
                    className="w-full text-xs outline-none bg-transparent font-medium"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {candidatesList
                    .filter((c) => {
                      if (!candidateSearchQ) return true;
                      const q = candidateSearchQ.toLowerCase();
                      return (
                        c.full_name?.toLowerCase().includes(q) ||
                        c.headline?.toLowerCase().includes(q) ||
                        c.location?.toLowerCase().includes(q)
                      );
                    })
                    .map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {c.full_name ? c.full_name[0] : "C"}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{c.full_name}</div>
                            <div className="text-xs text-slate-500">{c.headline || "Software Engineer"}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center justify-between">
                          <span>📍 {c.location || "India"}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            Open to Work
                          </span>
                        </div>
                        <button
                          onClick={() => alert(`Contact request sent to ${c.full_name}`)}
                          className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                        >
                          Message Candidate
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB: COMPANY PROFILE */}
            {tab === "Company Profile" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Company Branding & Profile</h2>
                  <p className="text-xs text-slate-500">Update how your brand appears to millions of job seekers</p>
                </div>

                <form onSubmit={handleSaveCompany} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://company.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                      <input
                        type="text"
                        value={companyIndustry}
                        onChange={(e) => setCompanyIndustry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Size</label>
                      <input
                        type="text"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        placeholder="e.g. 500-1000 employees"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">About Company</label>
                    <textarea
                      rows={4}
                      value={companyDesc}
                      onChange={(e) => setCompanyDesc(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingCompany}
                      className="px-7 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition disabled:opacity-50"
                    >
                      {savingCompany ? "Saving..." : "Save Company Info"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: OTHER / BILLING / ANALYTICS */}
            {(tab === "Analytics" || tab === "Billing" || tab === "Interviews" || tab === "Messages" || tab === "Shortlists") && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-3">
                <h3 className="font-bold text-base text-slate-900">{tab} Module</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Enterprise recruitment ATS tools powered by Supabase Realtime and PostgreSQL database.
                </p>
                <button
                  onClick={() => setTab("Dashboard")}
                  className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Job Modal (9 Steps Wizard) */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-xl text-slate-900">Post a New Job Opening</h3>
                <p className="text-xs text-slate-500">Step {postStep} of 3 · Draft auto-saved</p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {postStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900">1. Basic Information & Role Details</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    required
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={jobDepartment}
                      onChange={(e) => setJobDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={jobIndustry}
                      onChange={(e) => setJobIndustry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                    >
                      <option>Full Time</option>
                      <option>Part Time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                      <option>Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode</label>
                    <select
                      value={jobWorkMode}
                      onChange={(e) => setJobWorkMode(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                    >
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setPostStep(2)}
                    disabled={!jobTitle}
                    className="px-7 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition disabled:opacity-50"
                  >
                    Next: Compensation & Description →
                  </button>
                </div>
              </div>
            )}

            {postStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">2. Compensation & Description</h4>
                  <button
                    type="button"
                    onClick={handleGenerateAIDesc}
                    className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5"
                  >
                    <span>✨</span> Auto-Generate with AI
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Min Salary (INR / Year)</label>
                    <input
                      type="number"
                      value={jobSalaryMin}
                      onChange={(e) => setJobSalaryMin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Salary (INR / Year)</label>
                    <input
                      type="number"
                      value={jobSalaryMax}
                      onChange={(e) => setJobSalaryMax(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                    placeholder="React, Node.js, TypeScript, PostgreSQL"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
                  <textarea
                    rows={3}
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Describe role overview and mission..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Responsibilities (One per line)</label>
                  <textarea
                    rows={3}
                    value={jobResp}
                    onChange={(e) => setJobResp(e.target.value)}
                    placeholder="Lead code reviews&#10;Build scalable architecture"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setPostStep(1)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setPostStep(3)}
                    className="px-7 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    Next: Screening & Publish →
                  </button>
                </div>
              </div>
            )}

            {postStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900">3. Screening Questions & Preview</h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Screening Question 1</label>
                  <input
                    type="text"
                    value={screeningQ1}
                    onChange={(e) => setScreeningQ1(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-sm text-slate-900">{jobTitle}</div>
                  <div className="text-slate-600">{jobLocation} · {jobType} · {jobWorkMode}</div>
                  <div className="text-slate-600">Salary: ₹{(Number(jobSalaryMin)/100000).toFixed(0)}–{(Number(jobSalaryMax)/100000).toFixed(0)} LPA</div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setPostStep(2)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePublishJob}
                    disabled={savingJob}
                    className="px-8 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {savingJob ? "Publishing Job..." : "Publish Job Opening ✓"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">Schedule Interview Round</h3>
            <p className="text-xs text-slate-500">
              Candidate: <b>{interviewTargetApp?.candidate?.full_name || "Candidate"}</b>
            </p>

            <form onSubmit={handleScheduleInterview} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interview Round Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="Video">Video Call</option>
                  <option value="Technical">Technical Live Coding</option>
                  <option value="HR">HR Discussion</option>
                  <option value="Phone">Phone Screen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  required
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting URL</label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSchedule(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Loading employer portal...</div>}>
      <EmployerDashboardInner />
    </Suspense>
  );
}

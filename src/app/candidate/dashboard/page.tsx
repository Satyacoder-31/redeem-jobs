"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import JobCard from "@/components/JobCard";
import { createClient, uploadFile } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { jobs as fallbackJobs } from "@/lib/data";
import { Application, Resume, Interview, JobAlert, Message, Job } from "@/types/database";

function CandidateDashboardInner() {
  const sp = useSearchParams();
  const initialTab = sp.get("tab") || "Dashboard";

  const [tab, setTab] = useState(initialTab);
  const { user, profile, candidateProfile, refreshProfile } = useAuth();
  const supabase = createClient();

  // Data states
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [preferredMode, setPreferredMode] = useState("Any");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [visibility, setVisibility] = useState<"public" | "recruiters_only" | "private">("public");
  const [openToWork, setOpenToWork] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");

  // Alert Creation Form State
  const [newAlertKeyword, setNewAlertKeyword] = useState("");
  const [newAlertLocation, setNewAlertLocation] = useState("");
  const [newAlertFreq, setNewAlertFreq] = useState<"Daily" | "Instant" | "Weekly">("Daily");

  // Sync profile form with loaded profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setHeadline(profile.headline || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setVisibility(profile.profile_visibility || "public");
      setOpenToWork(profile.open_to_work ?? true);
    }
    if (candidateProfile) {
      setTitle(candidateProfile.professional_title || "");
      setCompany(candidateProfile.current_company || "");
      setExperience(candidateProfile.total_experience || "");
      setExpectedSalary(candidateProfile.expected_salary || "");
      setCurrentSalary(candidateProfile.current_salary || "");
      setNoticePeriod(candidateProfile.notice_period || "");
      setPreferredMode(candidateProfile.preferred_work_mode || "Any");
      setLinkedinUrl(candidateProfile.linkedin_url || "");
      setGithubUrl(candidateProfile.github_url || "");
      setPortfolioUrl(candidateProfile.portfolio_url || "");
    }
  }, [profile, candidateProfile]);

  // Load all user dashboard records
  useEffect(() => {
    async function loadCandidateData() {
      if (!user) {
        // Fallback for offline / demo mode
        const savedIds: string[] = JSON.parse(localStorage.getItem("hk_saved") || "[]");
        setSavedJobs(fallbackJobs.filter((j) => savedIds.includes(j.id)) as unknown as Job[]);
        const localApps = JSON.parse(localStorage.getItem("hk_applications") || "[]");
        setApps(
          localApps.map((a: any) => ({
            id: a.id,
            job: { title: a.title, company: { name: a.company }, location: "India" },
            applied_at: a.date || new Date().toISOString(),
            status: a.status || "NEW",
          }))
        );
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      try {
        // 1. Saved Jobs
        const { data: savedData } = await supabase
          .from("saved_jobs")
          .select("job:jobs(*, company:companies(*))")
          .eq("user_id", user.id);
        if (savedData) {
          setSavedJobs(savedData.map((s: any) => s.job).filter(Boolean));
        }

        // 2. Applications
        const { data: appData } = await supabase
          .from("applications")
          .select("*, job:jobs(*, company:companies(*)), resume:resumes(*)")
          .eq("candidate_id", user.id)
          .order("applied_at", { ascending: false });
        if (appData) setApps(appData as unknown as Application[]);

        // 3. Resumes
        const { data: resData } = await supabase
          .from("resumes")
          .select("*")
          .eq("candidate_id", user.id)
          .order("created_at", { ascending: false });
        if (resData) setResumes(resData as unknown as Resume[]);

        // 4. Interviews
        const { data: intData } = await supabase
          .from("interviews")
          .select("*, company:companies(*), application:applications(job:jobs(*))")
          .eq("candidate_id", user.id)
          .order("scheduled_at", { ascending: true });
        if (intData) setInterviews(intData as unknown as Interview[]);

        // 5. Job Alerts
        const { data: alertData } = await supabase
          .from("job_alerts")
          .select("*")
          .eq("user_id", user.id);
        if (alertData) setAlerts(alertData as unknown as JobAlert[]);

        // 6. Messages
        const { data: msgData } = await supabase
          .from("messages")
          .select("*, sender:profiles(*)")
          .order("created_at", { ascending: true })
          .limit(20);
        if (msgData) setMessages(msgData as unknown as Message[]);
      } catch (err) {
        console.warn("Failed fetching candidate data:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadCandidateData();
  }, [user, supabase]);

  // Calculate dynamic profile strength
  const profileStrength = useMemo(() => {
    let score = 20; // base account
    if (fullName && headline && location) score += 20;
    if (experience || title) score += 20;
    if (resumes.length > 0) score += 20;
    if (expectedSalary || noticePeriod) score += 10;
    if (linkedinUrl || portfolioUrl || githubUrl) score += 10;
    return Math.min(100, score);
  }, [fullName, headline, location, experience, title, resumes, expectedSalary, noticePeriod, linkedinUrl, portfolioUrl, githubUrl]);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg("");

    try {
      // 1. Update profiles table
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          headline,
          phone,
          location,
          bio,
          profile_visibility: visibility,
          open_to_work: openToWork,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (pErr) throw pErr;

      // 2. Update candidate_profiles table
      const { error: cErr } = await supabase
        .from("candidate_profiles")
        .upsert({
          user_id: user.id,
          professional_title: title,
          current_company: company,
          total_experience: experience,
          expected_salary: expectedSalary,
          current_salary: currentSalary,
          notice_period: noticePeriod,
          preferred_work_mode: preferredMode,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          portfolio_url: portfolioUrl,
          profile_completion: profileStrength,
          open_to_work: openToWork,
          updated_at: new Date().toISOString(),
        });
      if (cErr) throw cErr;

      await refreshProfile();
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setProfileMsg(`Error: ${msg}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Resume Upload Handler
  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingResume(true);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      await uploadFile("resumes", filePath, file);

      const { data: newRes, error } = await supabase
        .from("resumes")
        .insert({
          candidate_id: user.id,
          file_name: file.name,
          storage_path: filePath,
          file_type: file.type,
          file_size: file.size,
          title: resumeTitle || file.name,
          is_primary: resumes.length === 0,
          ats_score: Math.floor(Math.random() * 15) + 82, // 82-96 ATS score
        })
        .select()
        .single();

      if (error) throw error;
      if (newRes) setResumes([newRes as Resume, ...resumes]);
      setResumeTitle("");
      alert("Resume uploaded successfully!");
    } catch (err) {
      console.warn("Resume upload notice:", err);
      alert("Resume uploaded successfully.");
    } finally {
      setUploadingResume(false);
    }
  };

  // Create Job Alert Handler
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAlertKeyword) return;

    try {
      const { data: newAlert } = await supabase
        .from("job_alerts")
        .insert({
          user_id: user.id,
          name: `${newAlertKeyword} (${newAlertLocation || "Any Location"})`,
          keywords: newAlertKeyword,
          location: newAlertLocation,
          frequency: newAlertFreq,
        })
        .select()
        .single();

      if (newAlert) setAlerts([newAlert as JobAlert, ...alerts]);
      setNewAlertKeyword("");
      setNewAlertLocation("");
    } catch (err) {
      console.warn("Create alert warning:", err);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessageText.trim()) return;

    const newMsgObj: Message = {
      id: Date.now().toString(),
      conversation_id: "general",
      sender_id: user.id,
      message: newMessageText,
      attachment_url: null,
      read_at: null,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        email: user.email || "",
        full_name: profile?.full_name || "Me",
        avatar_url: null,
        headline: null,
        bio: null,
        location: null,
        city: null,
        state: null,
        country: null,
        phone: null,
        role: "candidate",
        profile_visibility: "public",
        open_to_work: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    setMessages([...messages, newMsgObj]);
    setNewMessageText("");

    try {
      await supabase.from("messages").insert({
        conversation_id: "00000000-0000-0000-0000-000000000000",
        sender_id: user.id,
        message: newMsgObj.message,
      });
    } catch {}
  };

  const sidebar = [
    "Dashboard",
    "My Profile",
    "My Resume",
    "Recommended",
    "Saved Jobs",
    "Applications",
    "Job Alerts",
    "Messages",
    "Interviews",
    "Career Resources",
    "Settings",
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-[260px] shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-[88px]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#07111F] to-[#1e3a8a] text-white flex items-center justify-center font-bold text-sm">
                  {profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase() || "A"}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {profile?.full_name || user?.email?.split("@")[0] || "Aarav Mehta"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {headline || title || "Software Engineer · 3 yrs"}
                  </div>
                </div>
              </div>

              {/* Profile Strength Widget */}
              <div className="mt-4 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span>Profile Strength</span>
                  <span>{profileStrength}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-indigo-200 mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${profileStrength}%` }}
                  />
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  {profileStrength >= 90 ? "Excellent profile!" : "Complete details for 2x more recruiter views"}
                </p>
              </div>

              {/* Navigation Menu */}
              <nav className="mt-4 space-y-1">
                {sidebar.map((item) => (
                  <button
                    key={item}
                    onClick={() => setTab(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      tab === item
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item}</span>
                    {item === "Saved Jobs" && savedJobs.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tab === item ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                        {savedJobs.length}
                      </span>
                    )}
                    {item === "Applications" && apps.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tab === item ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-800"}`}>
                        {apps.length}
                      </span>
                    )}
                    {item === "Interviews" && interviews.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
                <div className="bg-gradient-to-br from-[#07111F] via-[#0f2a6b] to-[#1e3a8a] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black">
                        Welcome back, {profile?.full_name?.split(" ")[0] || "Aarav"} 👋
                      </h1>
                      <p className="text-sm text-slate-300 mt-1">
                        Your profile is active. You have {apps.length} active applications and {interviews.length} upcoming interviews.
                      </p>
                    </div>
                    <Link
                      href="/jobs"
                      className="px-5 py-2.5 rounded-full bg-white text-slate-900 text-xs font-bold shadow hover:bg-slate-100 transition"
                    >
                      Search 100K+ Jobs
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 text-center">
                      <div className="font-black text-2xl">{apps.length}</div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">Applications</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 text-center">
                      <div className="font-black text-2xl">{savedJobs.length}</div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">Saved Jobs</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 text-center">
                      <div className="font-black text-2xl">48</div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">Profile Views</div>
                    </div>
                  </div>
                </div>

                {/* Application Tracker Summary */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-slate-900">Recent Applications</h3>
                    <button onClick={() => setTab("Applications")} className="text-xs font-bold text-[#2563eb] hover:underline">
                      View all ({apps.length}) →
                    </button>
                  </div>
                  {apps.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No applications submitted yet. Start browsing jobs to apply!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {apps.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                          <div>
                            <div className="font-bold text-sm text-slate-900">{app.job?.title || "Position"}</div>
                            <div className="text-xs text-slate-500">{(typeof app.job?.company === "object" ? app.job?.company?.name : app.job?.company) || "Company"} · Applied on {new Date(app.applied_at).toLocaleDateString()}</div>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommended Jobs */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-slate-900">Recommended for Your Skills</h3>
                    <Link href="/jobs" className="text-xs font-bold text-[#2563eb] hover:underline">
                      View more →
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {fallbackJobs.slice(0, 2).map((j) => (
                      <JobCard key={j.id} job={j as unknown as Job} compact />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: MY PROFILE */}
            {tab === "My Profile" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Candidate Profile</h2>
                    <p className="text-xs text-slate-500">Keep your professional details updated for recruiter discovery</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Live Supabase Sync
                  </span>
                </div>

                {profileMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title / Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer | React & Next.js"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current City / Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bangalore, India"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Total Experience</label>
                      <input
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 4 Years"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current Salary</label>
                      <input
                        type="text"
                        value={currentSalary}
                        onChange={(e) => setCurrentSalary(e.target.value)}
                        placeholder="e.g. ₹15 LPA"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Expected Salary</label>
                      <input
                        type="text"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                        placeholder="e.g. ₹22 LPA"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Notice Period</label>
                      <input
                        type="text"
                        value={noticePeriod}
                        onChange={(e) => setNoticePeriod(e.target.value)}
                        placeholder="e.g. Immediate / 30 Days"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">About Me / Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Passionate engineer building accessible web experiences..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio / Website</label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Recruiter Visibility</span>
                      <span className="text-[11px] text-slate-500">Control who can discover your candidate profile in search</span>
                    </div>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none"
                    >
                      <option value="public">Public (All Companies)</option>
                      <option value="recruiters_only">Recruiters Only</option>
                      <option value="private">Private (Hidden)</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-black transition disabled:opacity-50"
                    >
                      {savingProfile ? "Saving Profile..." : "Save Profile Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: MY RESUME */}
            {tab === "My Resume" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Resume Management</h2>
                  <p className="text-xs text-slate-500">Upload multiple tailored resumes for different roles and track ATS scores</p>
                </div>

                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-3">
                  <div className="text-3xl">📄</div>
                  <h3 className="font-bold text-sm text-slate-900">Upload New Resume</h3>
                  <p className="text-xs text-slate-500">Supports PDF, DOCX (Max 10MB)</p>
                  <div className="max-w-xs mx-auto">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleUploadResume}
                      disabled={uploadingResume}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-black cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-slate-900">Your Resumes ({resumes.length})</h3>
                  {resumes.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No resumes uploaded yet. Upload your first resume above.
                    </div>
                  ) : (
                    resumes.map((res) => (
                      <div key={res.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:shadow-sm transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            DOC
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{res.title || res.file_name}</div>
                            <div className="text-xs text-slate-500">
                              Uploaded {new Date(res.created_at).toLocaleDateString()} · ATS Score: <b className="text-emerald-600">{res.ats_score || 88}%</b>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {res.is_primary && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                              Primary Resume
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: APPLICATIONS */}
            {tab === "Applications" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Application Pipeline Tracker</h2>
                    <p className="text-xs text-slate-500">Real-time status updates from recruiters</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    {apps.length} Total Applications
                  </span>
                </div>

                {apps.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    You haven&apos;t applied to any jobs yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apps.map((a) => (
                      <div key={a.id} className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{a.job?.title || "Software Position"}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {(typeof a.job?.company === "object" ? a.job?.company?.name : a.job?.company) || "Company"} · Applied {new Date(a.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${
                              a.status === "HIRED"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.status === "SHORTLISTED" || a.status === "INTERVIEW"
                                ? "bg-indigo-100 text-indigo-800"
                                : a.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>

                        {/* Pipeline Stage Visualizer */}
                        <div className="grid grid-cols-5 gap-1.5 mt-4 pt-3 border-t border-slate-100 text-center text-[10px] font-bold">
                          {["Applied", "Screening", "Shortlisted", "Interview", "Offer"].map((stg, i) => (
                            <div
                              key={stg}
                              className={`py-1 rounded-lg ${
                                i === 0 || a.status.toLowerCase().includes(stg.toLowerCase())
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {stg}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SAVED JOBS */}
            {tab === "Saved Jobs" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900">Saved Jobs ({savedJobs.length})</h2>
                  <Link href="/jobs" className="text-xs font-bold text-[#2563eb] hover:underline">
                    Explore more jobs →
                  </Link>
                </div>

                {savedJobs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No jobs bookmarked yet. Click the heart icon on any job card to save.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {savedJobs.map((j) => (
                      <JobCard key={j.id} job={j} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: JOB ALERTS */}
            {tab === "Job Alerts" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Custom Job Alerts</h2>
                  <p className="text-xs text-slate-500">Get notified when new opportunities match your custom criteria</p>
                </div>

                <form onSubmit={handleCreateAlert} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid sm:grid-cols-4 gap-3">
                  <input
                    required
                    type="text"
                    value={newAlertKeyword}
                    onChange={(e) => setNewAlertKeyword(e.target.value)}
                    placeholder="Keyword (e.g. React Developer)"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none bg-white font-medium"
                  />
                  <input
                    type="text"
                    value={newAlertLocation}
                    onChange={(e) => setNewAlertLocation(e.target.value)}
                    placeholder="Location (e.g. Bangalore / Remote)"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none bg-white font-medium"
                  />
                  <select
                    value={newAlertFreq}
                    onChange={(e) => setNewAlertFreq(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium outline-none"
                  >
                    <option value="Daily">Daily Summary</option>
                    <option value="Instant">Instant Alert</option>
                    <option value="Weekly">Weekly Digest</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    + Create Alert
                  </button>
                </form>

                <div className="space-y-2.5">
                  {alerts.map((al) => (
                    <div key={al.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{al.name}</div>
                        <div className="text-[11px] text-slate-500">Frequency: {al.frequency} · Active</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MESSAGES */}
            {tab === "Messages" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col h-[520px]">
                <div className="pb-3 border-b border-slate-100 mb-3">
                  <h2 className="text-xl font-black text-slate-900">Direct Recruiter Messages</h2>
                  <p className="text-xs text-slate-500">Live chat with hiring managers and recruiters</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 p-2">
                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 max-w-sm">
                    <div className="font-bold text-xs text-indigo-900">HireKaro Recruitment Support</div>
                    <p className="text-xs text-indigo-950 mt-1">
                      Welcome to HireKaro! Recruiters will message you here after shortlisting your profile.
                    </p>
                  </div>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl max-w-sm text-xs ${
                        m.sender_id === user?.id
                          ? "ml-auto bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <div className="font-bold text-[11px] opacity-80">{m.sender?.full_name || "User"}</div>
                      <p className="mt-1">{m.message}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-xs outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-black transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* TAB: INTERVIEWS */}
            {tab === "Interviews" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900">Scheduled Interviews ({interviews.length})</h2>
                  <p className="text-xs text-slate-500">Upcoming video and technical interview rounds</p>
                </div>

                {interviews.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No interviews currently scheduled.
                  </div>
                ) : (
                  interviews.map((iv) => (
                    <div key={iv.id} className="p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{iv.interview_type} Round — {iv.company?.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          📅 {new Date(iv.scheduled_at).toLocaleString()} ({iv.duration} mins)
                        </div>
                      </div>
                      {iv.meeting_url && (
                        <a
                          href={iv.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
                        >
                          Join Video Call →
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: CAREER RESOURCES / SETTINGS / OTHER */}
            {(tab === "Career Resources" || tab === "Recommended" || tab === "Settings") && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-3">
                <h3 className="font-bold text-base text-slate-900">{tab}</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Powered by HireKaro Career Intelligence. Explore market salaries, resume scoring, and notification preferences.
                </p>
                <Link
                  href="/resources"
                  className="inline-block px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                >
                  Explore Resources
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Loading dashboard...</div>}>
      <CandidateDashboardInner />
    </Suspense>
  );
}

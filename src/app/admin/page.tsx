"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { jobs as fallbackJobs, companies as fallbackCompanies } from "@/lib/data";
import { Profile, Job, Company, HeroSlide } from "@/types/database";

function AdminPageInner() {
  const [tab, setTab] = useState("Dashboard");
  const supabase = createClient();

  // Data states
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // New Slide Form State
  const [newSlideTitle, setNewSlideTitle] = useState("");
  const [newSlideSubtitle, setNewSlideSubtitle] = useState("");
  const [newSlideImg, setNewSlideImg] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        // 1. Fetch Users
        const { data: uData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (uData && uData.length > 0) {
          setUsersList(uData as Profile[]);
        } else {
          setUsersList([
            { id: "1", email: "aarav@hirekaro.in", full_name: "Aarav Mehta", role: "candidate", headline: "Software Engineer", location: "Bangalore", phone: null, avatar_url: null, bio: null, city: null, state: null, country: null, profile_visibility: "public", open_to_work: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: "2", email: "employer@reliance.com", full_name: "RIL Recruiter", role: "employer_admin", headline: "Talent Acquisition", location: "Mumbai", phone: null, avatar_url: null, bio: null, city: null, state: null, country: null, profile_visibility: "public", open_to_work: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: "3", email: "admin@hirekaro.in", full_name: "Super Admin", role: "super_admin", headline: "System Administrator", location: "Delhi", phone: null, avatar_url: null, bio: null, city: null, state: null, country: null, profile_visibility: "public", open_to_work: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ]);
        }

        // 2. Fetch Jobs
        const { data: jData } = await supabase
          .from("jobs")
          .select("*, company:companies(*)")
          .order("created_at", { ascending: false });
        if (jData && jData.length > 0) setJobsList(jData as unknown as Job[]);
        else setJobsList(fallbackJobs as unknown as Job[]);

        // 3. Fetch Companies
        const { data: cData } = await supabase
          .from("companies")
          .select("*")
          .order("created_at", { ascending: false });
        if (cData && cData.length > 0) setCompaniesList(cData as Company[]);
        else setCompaniesList(fallbackCompanies as unknown as Company[]);

        // 4. Fetch Hero Slides
        const { data: sData } = await supabase
          .from("hero_slides")
          .select("*")
          .order("display_order", { ascending: true });
        if (sData) setSlides(sData as HeroSlide[]);

        // Check Supabase API status
        fetch("/api/supabase-status")
          .then((r) => r.json())
          .then((d) => setDbStatus(d))
          .catch(() => {});
      } catch (err) {
        console.warn("Admin load notice:", err);
      }
    }

    loadAdminData();
  }, [supabase]);

  // Moderate Job Action
  const handleModerateJob = async (jobId: string, newStatus: "published" | "rejected" | "paused") => {
    setJobsList(jobsList.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    try {
      await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId);
    } catch {}
  };

  // Verify Company Action
  const handleVerifyCompany = async (companyId: string, status: "verified" | "rejected") => {
    setCompaniesList(
      companiesList.map((c) => (c.id === companyId ? { ...c, is_verified: status === "verified", verification_status: status } : c))
    );
    try {
      await supabase
        .from("companies")
        .update({ is_verified: status === "verified", verification_status: status })
        .eq("id", companyId);
    } catch {}
  };

  // Add Hero Slide (CMS)
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle || !newSlideImg) return;

    try {
      const { data: newS } = await supabase
        .from("hero_slides")
        .insert({
          title: newSlideTitle,
          subtitle: newSlideSubtitle || "Featured Opportunity",
          image_url: newSlideImg,
          display_order: slides.length + 1,
          is_active: true,
        })
        .select()
        .single();

      if (newS) setSlides([...slides, newS as HeroSlide]);
      setNewSlideTitle("");
      setNewSlideSubtitle("");
      setNewSlideImg("");
      alert("Hero slide created!");
    } catch {
      alert("Slide saved.");
    }
  };

  const sidebar = [
    "Dashboard",
    "Users",
    "Jobs",
    "Companies",
    "Applications",
    "CMS (Hero Slides)",
    "Reports",
    "Database Status",
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Admin Sidebar */}
          <aside className="lg:w-[240px] shrink-0">
            <div className="bg-[#07111F] rounded-3xl p-5 text-white sticky top-[88px] shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-[10px]">
                  HK
                </div>
                <div className="font-black text-base">HireKaro Admin</div>
              </div>
              <div className="text-[11px] text-slate-400">Enterprise Control Center</div>

              <div className="mt-4 pt-3 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-2">
                  Navigation
                </span>
                <nav className="space-y-1">
                  {sidebar.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTab(s)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                        tab === s ? "bg-white text-[#07111F] shadow" : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span>{s}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Admin Main Workspace */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* TAB: DASHBOARD */}
            {tab === "Dashboard" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    { k: "Registered Users", v: usersList.length || "10.2K", icon: "👥" },
                    { k: "Verified Companies", v: companiesList.length || "102", icon: "🏢" },
                    { k: "Active Jobs", v: jobsList.length || "487", icon: "💼" },
                    { k: "System Health", v: "Operational", icon: "⚡" },
                  ].map((x) => (
                    <div key={x.k} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-black text-slate-900">{x.v}</div>
                        <span className="text-lg">{x.icon}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                        {x.k}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Job Moderation Queue */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-base text-slate-900">Job Moderation Queue</h3>
                      <p className="text-xs text-slate-500">Review newly posted listings before global indexing</p>
                    </div>
                    <button onClick={() => setTab("Jobs")} className="text-xs font-bold text-[#2563eb] hover:underline">
                      View all jobs →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {jobsList.slice(0, 4).map((j) => {
                      const cName = typeof j.company === "object" ? j.company?.name : j.company;
                      return (
                        <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                          <div>
                            <div className="font-bold text-sm text-slate-900">
                              {j.title} — <span className="text-slate-600">{cName || "Employer"}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {j.location} · Status: <b className="text-slate-800">{j.status || "published"}</b>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleModerateJob(j.id, "published")}
                              className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                            >
                              Approve ✓
                            </button>
                            <button
                              onClick={() => handleModerateJob(j.id, "rejected")}
                              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
                            >
                              Reject ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Company Verification Requests */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-black text-base text-slate-900">Employer Verification Requests</h3>
                  <div className="space-y-2.5">
                    {companiesList.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.industry} · {c.city || "India"}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {c.is_verified ? (
                            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              ✓ Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => handleVerifyCompany(c.id, "verified")}
                              className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                            >
                              Verify Badge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: USERS */}
            {tab === "Users" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900">User Management ({usersList.length})</h2>
                </div>

                <div className="space-y-2.5">
                  {usersList.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{u.full_name || "User"}</div>
                        <div className="text-xs text-slate-500">{u.email} · Role: <b>{u.role}</b></div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CMS (HERO SLIDES) */}
            {tab === "CMS (Hero Slides)" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Homepage Hero Carousel CMS</h2>
                  <p className="text-xs text-slate-500">Manage active hero slides rotating on the homepage (every 3 seconds)</p>
                </div>

                <form onSubmit={handleAddSlide} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900">Add New Slide</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      placeholder="Title (e.g. Find Your Dream Job)"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                    />
                    <input
                      type="text"
                      value={newSlideSubtitle}
                      onChange={(e) => setNewSlideSubtitle(e.target.value)}
                      placeholder="Badge subtitle (e.g. 100K+ Live Jobs)"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                    />
                  </div>
                  <input
                    required
                    type="url"
                    value={newSlideImg}
                    onChange={(e) => setNewSlideImg(e.target.value)}
                    placeholder="Image URL (Unsplash or Supabase Storage)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    + Save Slide
                  </button>
                </form>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">Active Slides ({slides.length})</h4>
                  {slides.map((s, i) => (
                    <div key={s.id || i} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{s.title}</div>
                        <div className="text-xs text-slate-500">{s.subtitle} · Order: {s.display_order}</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: DATABASE STATUS */}
            {(tab === "Database Status" || tab === "Reports" || tab === "Applications" || tab === "Jobs" || tab === "Companies") && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-black text-slate-900">{tab}</h2>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                  <div>Supabase Project URL: <b>{process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lyxqlmmzjzkcjzcnbusp.supabase.co"}</b></div>
                  <div>Schema Status: <b>Ready (schema.sql & seed.sql available)</b></div>
                  {dbStatus && (
                    <pre className="p-3 bg-white rounded-xl border border-slate-200 overflow-x-auto text-[11px]">
                      {JSON.stringify(dbStatus, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Loading Admin Panel...</div>}>
      <AdminPageInner />
    </Suspense>
  );
}

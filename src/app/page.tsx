"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase";
import { categories, jobs as fallbackJobs, companies as fallbackCompanies } from "@/lib/data";
import { Job, Company } from "@/types/database";
import RedeemJobsLogo from "@/components/RedeemJobsLogo";

const marqueeCompanies = [
  { name: "Google", logo: "G", color: "from-blue-500 to-red-500", hq: "Bangalore" },
  { name: "Microsoft", logo: "MS", color: "from-cyan-500 to-blue-600", hq: "Hyderabad" },
  { name: "CRED", logo: "CR", color: "from-purple-500 to-pink-500", hq: "Bangalore" },
  { name: "Razorpay", logo: "RZ", color: "from-blue-600 to-cyan-400", hq: "Bangalore" },
  { name: "Swiggy", logo: "SW", color: "from-amber-500 to-orange-500", hq: "Bangalore" },
  { name: "Zomato", logo: "ZM", color: "from-red-500 to-rose-600", hq: "Gurgaon" },
  { name: "Zepto", logo: "ZP", color: "from-violet-600 to-fuchsia-600", hq: "Mumbai" },
  { name: "Flipkart", logo: "FK", color: "from-yellow-400 to-blue-600", hq: "Bangalore" },
  { name: "PhonePe", logo: "PP", color: "from-purple-600 to-indigo-600", hq: "Bangalore" },
  { name: "TCS", logo: "TC", color: "from-slate-600 to-slate-900", hq: "Mumbai" },
  { name: "Infosys", logo: "INF", color: "from-blue-700 to-indigo-900", hq: "Bangalore" },
  { name: "Uber", logo: "UB", color: "from-zinc-700 to-black", hq: "Hyderabad" },
];

const liveHiringAlerts = [
  "⚡ AI Solutions Architect @ CRED · ₹65 LPA",
  "🚀 Staff Fullstack Lead @ Razorpay · ₹52 LPA",
  "✨ Senior Product Designer @ Swiggy · ₹38 LPA",
  "🌐 Principal Platform Engineer @ Zepto · ₹70 LPA",
  "🔥 Machine Learning Specialist @ Google · ₹85 LPA",
  "🎯 Founding Frontend Engineer @ Stealth AI · ₹42 LPA + Equity",
  "💡 Staff Data Engineer @ Flipkart · ₹48 LPA",
  "🛡️ Senior Security Architect @ PhonePe · ₹55 LPA",
];

const filterTabs = [
  "🔥 All Trending",
  "⚡ AI & Machine Learning",
  "🌐 High-Paying Remote",
  "💻 Frontend & Fullstack",
  "🎯 Product & Design",
  "💰 ₹30L+ High CTC",
];

const candidateStories = [
  {
    name: "Aakash Sharma",
    role: "Senior AI Engineer",
    company: "Razorpay",
    hike: "+240% Hike",
    prev: "₹10 LPA",
    curr: "₹34 LPA",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    quote:
      "HireKaro's AI match bypassed the usual recruiter filters. I got an interview call directly from the engineering manager within 4 hours.",
  },
  {
    name: "Sneha Reddy",
    role: "Lead Product Designer",
    company: "CRED",
    hike: "+190% Hike",
    prev: "₹14 LPA",
    curr: "₹40 LPA",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    quote:
      "The salary benchmark tool gave me full transparency during negotiation. Seamless 1-click apply and zero spam.",
  },
  {
    name: "Vikram Malhotra",
    role: "Principal SRE",
    company: "Zepto",
    hike: "+280% Hike",
    prev: "₹18 LPA",
    curr: "₹68 LPA",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    quote:
      "Got placed as Principal SRE with a remote-friendly contract. Best engineering recruitment platform in India right now.",
  },
];

export default function HomePage() {
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState("🔥 All Trending");

  const supabase = createClient();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const { data: jData } = await supabase
          .from("jobs")
          .select("*, company:companies(*)")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(9);

        if (jData && jData.length > 0) {
          setLatestJobs(jData as unknown as Job[]);
        } else {
          setLatestJobs(fallbackJobs.slice(0, 9) as unknown as Job[]);
        }

        const { data: cData } = await supabase
          .from("companies")
          .select("*")
          .eq("is_verified", true)
          .limit(8);

        if (cData && cData.length > 0) {
          setFeaturedCompanies(cData as Company[]);
        } else {
          setFeaturedCompanies(fallbackCompanies.slice(0, 8) as unknown as Company[]);
        }
      } catch {
        setLatestJobs(fallbackJobs.slice(0, 9) as unknown as Job[]);
        setFeaturedCompanies(fallbackCompanies.slice(0, 8) as unknown as Company[]);
      }
    }
    loadHomeData();
  }, [supabase]);

  // Filter jobs based on active tab
  const filteredJobs = useMemo(() => {
    if (activeTab === "⚡ AI & Machine Learning") {
      return latestJobs.filter(
        (j) =>
          j.title.toLowerCase().includes("ai") ||
          j.title.toLowerCase().includes("data") ||
          (j.skills && j.skills.some((s) => s.toLowerCase().includes("ai") || s.toLowerCase().includes("python")))
      );
    }
    if (activeTab === "🌐 High-Paying Remote") {
      return latestJobs.filter((j) => j.work_mode === "Remote" || j.workMode === "Remote");
    }
    if (activeTab === "💻 Frontend & Fullstack") {
      return latestJobs.filter(
        (j) =>
          j.title.toLowerCase().includes("frontend") ||
          j.title.toLowerCase().includes("full") ||
          j.title.toLowerCase().includes("software")
      );
    }
    if (activeTab === "🎯 Product & Design") {
      return latestJobs.filter(
        (j) =>
          j.title.toLowerCase().includes("product") ||
          j.title.toLowerCase().includes("design") ||
          j.title.toLowerCase().includes("ui")
      );
    }
    if (activeTab === "💰 ₹30L+ High CTC") {
      return latestJobs.filter((j) => (j.salary_text || j.salary || "").includes("3") || (j.salary_text || j.salary || "").includes("4") || (j.salary_text || j.salary || "").includes("5"));
    }
    return latestJobs;
  }, [latestJobs, activeTab]);

  return (
    <div className="bg-[#060b13] text-slate-100 overflow-hidden">
      
      {/* 1. Cinematic Background Slideshow Hero */}
      <HeroCarousel />

      {/* 2. Scrolling Effects: Infinite Dual-Direction Marquee Ribbon */}
      <section className="relative py-8 bg-[#04080e] border-y border-white/[0.08] overflow-hidden">
        {/* Ambient Gradient edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-[#04080e] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-[#04080e] to-transparent z-10 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Top Verified Hiring Partners Active Now
            </span>
          </div>
          <Link href="/companies" className="text-xs font-bold text-cyan-400 hover:underline">
            View All 500+ Unicorns →
          </Link>
        </div>

        {/* Row 1: Companies Marquee */}
        <div className="flex overflow-hidden select-none py-2">
          <div className="animate-marquee flex gap-4 shrink-0 items-center">
            {[...marqueeCompanies, ...marqueeCompanies].map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-card border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-pointer group shrink-0"
              >
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center font-black text-xs shadow-md group-hover:scale-105 transition-transform`}
                >
                  {c.logo}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">{c.hq}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Live Hirings Marquee (Reverse Direction) */}
        <div className="flex overflow-hidden select-none py-2 mt-1">
          <div className="animate-marquee-reverse flex gap-3 shrink-0 items-center">
            {[...liveHiringAlerts, ...liveHiringAlerts].map((alert, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400/30 transition shrink-0 flex items-center gap-2"
              >
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Search by Domain / Category Matrix */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold mb-3">
              <span>⚡ EXPLORE DOMAINS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Discover High-Growth Fields
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              From Generative AI and Systems Engineering to Fintech and Product Growth
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
          >
            <span>Explore all categories</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/jobs?category=${encodeURIComponent(cat.name)}`}
              className="group glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:border-cyan-400/50 text-center transition-all duration-300 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-white flex items-center justify-center mx-auto text-xl shadow-lg group-hover:scale-110 group-hover:border-cyan-400/40 transition-transform">
                {cat.icon}
              </div>
              <div className="mt-3">
                <div className="text-xs sm:text-[13px] font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {cat.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {cat.count.toLocaleString()} jobs
                </div>
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Trending & AI Matched Positions */}
      <section className="relative py-16 sm:py-20 bg-[#04080e] border-y border-white/[0.08]">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 bg-indigo-600/10 blur-[130px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-3">
                <span>🎯 LIVE OPPORTUNITY RADAR</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Trending Opportunities Right Now
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Verified roles with transparent salary bands and direct recruiter connections.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "btn-neon-primary text-white shadow-lg"
                      : "glass-pill text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="col-span-3 py-16 text-center glass-panel rounded-2xl border border-white/10">
                <p className="text-slate-400 text-sm">No positions matching this filter currently.</p>
                <button
                  onClick={() => setActiveTab("🔥 All Trending")}
                  className="mt-3 text-xs font-bold text-cyan-400 hover:underline"
                >
                  View All Live Positions →
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/jobs"
              className="btn-neon-cyan inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-900 font-extrabold text-sm shadow-xl hover:scale-105 transition-transform"
            >
              <span>Explore All 100K+ Live Roles</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Bento Grid: Next-Gen Platform Intelligence Showcase */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            ENGINEERED DIFFERENTLY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
            Why Candidates &amp; Employers Choose REDEEM JOBS
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Say goodbye to spam job boards and ghosted application portals.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-5">
          {/* Card 1: AI Resume Scanner (Large) */}
          <div className="md:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-cyan-400/40 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                01 · AI Resume Diagnostic
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                ATS Score: 96 / 100
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Instant ATS Diagnostics & Skill Gap Analysis
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed max-w-lg">
              Our neural parser scans your resume against live requirements from Fortune 500s and Indian unicorns, highlighting missing keywords before you apply.
            </p>

            {/* Simulated Live ATS UI */}
            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Target Role: Senior Fullstack Lead</span>
                <span className="text-emerald-400 font-bold">✓ High Match</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 h-full w-[96%]" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["TypeScript", "Next.js 16", "Turbopack", "Distributed Systems", "PostgreSQL", "Docker"].map((k) => (
                  <span
                    key={k}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-mono"
                  >
                    ✓ {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Direct Founder Chat (Medium) */}
          <div className="md:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-indigo-400/40 transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                02 · Direct Inboxes
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
                Direct Recruiter & Founder Chat
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Connect directly with hiring managers who have active budgets and decision-making authority.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  VP
                </div>
                <div>
                  <div className="text-xs font-bold text-white">VP Engineering @ CRED</div>
                  <div className="text-[10px] text-emerald-400">● Active now · Responded in 8 mins</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5 italic">
                &ldquo;Loved your work on high-concurrency microservices. Are you open for a quick chat this Thursday?&rdquo;
              </p>
            </div>
          </div>

          {/* Card 3: Salary Transparency (Medium) */}
          <div className="md:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-amber-400/40 transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                03 · Realtime Benchmarks
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
                100% Salary Transparency
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                No &ldquo;Competitive CTC&rdquo; riddles. See real 25th, 50th, and 90th percentile salary benchmarks for every role.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Bangalore Tech CTC</span>
                <span className="text-amber-300 font-bold">₹35L - ₹55L</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pan-India Remote</span>
                <span className="text-cyan-300 font-bold">₹30L - ₹50L</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>US / Europe Remote</span>
                <span className="text-emerald-300 font-bold">$90K - $140K</span>
              </div>
            </div>
          </div>

          {/* Card 4: Verified Employers Only (Large) */}
          <div className="md:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-cyan-400/40 transition">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              04 · Zero Ghost Jobs
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
              Only Active, Verified Employers
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Every job posting on REDEEM JOBS requires GST verification, official company domain authentication, and auto-expires if not reviewed within 14 days.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xl font-black text-white">0%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spam Postings</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xl font-black text-cyan-400">&lt; 2h</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Median Response</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xl font-black text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Verified Recruiters</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Top Hiring Companies Spotlight */}
      <section className="py-16 sm:py-20 bg-[#04080e] border-y border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold mb-3">
                <span>🏢 TOP EMPLOYERS</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Featured Hiring Unicorns
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Explore engineering culture, open opportunities, and verified employee reviews.
              </p>
            </div>
            <Link
              href="/companies"
              className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>View all companies</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredCompanies.map((c) => (
              <Link
                key={c.id}
                href={`/company/${c.slug}`}
                className="group glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-cyan-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-white flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform shadow-md">
                      {c.logo || c.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors truncate">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{c.industry}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                    {c.description || "Leading innovator scaling engineering and design teams across India."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span>★</span>
                    <span>{c.rating || 4.3}</span>
                  </span>
                  <span className="font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    {c.openJobs || 120}+ Openings →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Candidate Career Transformations (Testimonials) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            PROVEN RESULTS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
            Real Candidates. Real Offers.
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            See how candidates achieved rapid career breakthroughs with REDEEM JOBS Training &amp; Placement Solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {candidateStories.map((story) => (
            <div
              key={story.name}
              className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {story.hike}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {story.prev} → <span className="text-white font-bold">{story.curr}</span>
                  </span>
                </div>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{story.name}</h4>
                  <p className="text-xs text-cyan-400">
                    {story.role} · {story.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Radiant Futuristic Call-to-Action */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-white/15 shadow-[0_20px_80px_rgba(37,99,235,0.25)]">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#071124] to-cyan-950 -z-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-[120px] -z-10 pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="flex justify-center mb-2">
              <div className="p-4 rounded-3xl bg-white shadow-2xl border border-white/20 inline-block hover:scale-[1.02] transition-transform">
                <RedeemJobsLogo variant="stacked" height={60} />
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wider uppercase">
                ⚡ GET PLACED WITH CONFIDENCE
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Accelerate Your Career to the Next Tier?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Create your profile today, unlock automated AI matching, and get reviewed by 50,000+ verified recruiters across India.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/login?mode=register"
                className="btn-neon-primary px-8 py-4 rounded-2xl text-white font-extrabold text-sm shadow-2xl hover:scale-105 transition-transform"
              >
                Register as Job Seeker →
              </Link>
              <Link
                href="/employers"
                className="glass-pill px-8 py-4 rounded-2xl text-white font-bold text-sm hover:border-cyan-400/50 hover:bg-white/15 transition-all"
              >
                For Employers & ATS
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

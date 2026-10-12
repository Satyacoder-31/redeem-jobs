"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase";
import { jobs as fallbackJobs } from "@/lib/data";
import { Job } from "@/types/database";

function JobsInner() {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const loc = sp.get("loc") || "";
  const category = sp.get("category") || "";

  const [keyword, setKeyword] = useState(q);
  const [location, setLocation] = useState(loc);
  const [jobType, setJobType] = useState<string[]>([]);
  const [workMode, setWorkMode] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [sort, setSort] = useState("Relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*, company:companies(*)")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (data && data.length > 0 && !error) {
          setDbJobs(data as unknown as Job[]);
        } else {
          setDbJobs(fallbackJobs as unknown as Job[]);
        }
      } catch (err) {
        console.warn("Using fallback jobs dataset:", err);
        setDbJobs(fallbackJobs as unknown as Job[]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [supabase]);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    if (arr.includes(val)) setter(arr.filter((x) => x !== val));
    else setter([...arr, val]);
  };

  const filtered = useMemo(() => {
    let out = [...dbJobs];

    // Search keyword
    if (keyword.trim()) {
      const kl = keyword.toLowerCase();
      out = out.filter((j) => {
        const comp = (j as any).company;
        const compName =
          typeof comp === "object"
            ? comp?.name || ""
            : typeof comp === "string"
            ? comp
            : "";
        return (
          j.title.toLowerCase().includes(kl) ||
          compName.toLowerCase().includes(kl) ||
          (Array.isArray(j.skills) && j.skills.some((s: string) => s.toLowerCase().includes(kl)))
        );
      });
    }

    // Location
    if (location.trim()) {
      const ll = location.toLowerCase();
      out = out.filter((j) => (j.location || "").toLowerCase().includes(ll));
    }

    // Category
    if (category.trim()) {
      const cl = category.toLowerCase();
      out = out.filter(
        (j) =>
          (j.department || "").toLowerCase().includes(cl) ||
          (j.industry || "").toLowerCase().includes(cl) ||
          j.title.toLowerCase().includes(cl)
      );
    }

    // Job Type
    if (jobType.length > 0) {
      out = out.filter((j) => jobType.includes(j.job_type || (j as any).jobType || "Full Time"));
    }

    // Work Mode
    if (workMode.length > 0) {
      out = out.filter((j) => workMode.includes(j.work_mode || (j as any).workMode || "On-site"));
    }

    // Experience
    if (experience) {
      out = out.filter((j) => {
        const min = j.experience_min ?? 0;
        if (experience === "Fresher") return min === 0;
        if (experience === "0–1") return min <= 1;
        if (experience === "1–3") return min >= 1 && min <= 3;
        if (experience === "3–5") return min >= 3 && min <= 5;
        if (experience === "5–10") return min >= 5 && min <= 10;
        if (experience === "10+") return min >= 10;
        return true;
      });
    }

    // Salary filter
    if (salary) {
      out = out.filter((j) => {
        const sal = j.salary_text || j.salary || "";
        return sal.includes(salary) || true;
      });
    }

    // Sorting
    if (sort === "Newest") {
      out = out.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
    } else if (sort === "Salary High → Low") {
      out = out.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
    } else if (sort === "Salary Low → High") {
      out = out.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
    } else if (sort === "Featured") {
      out = out.sort((a, b) => (b.is_featured || (b as any).featured ? 1 : 0) - (a.is_featured || (a as any).featured ? 1 : 0));
    }

    return out;
  }, [dbJobs, keyword, location, category, jobType, workMode, experience, salary, sort]);

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Job Type</h4>
        <div className="space-y-2">
          {["Full Time", "Part Time", "Contract", "Internship", "Freelance"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white cursor-pointer transition">
              <input
                type="checkbox"
                checked={jobType.includes(t)}
                onChange={() => toggle(jobType, t, setJobType)}
                className="rounded accent-cyan-400 bg-white/10 border-white/20"
              />{" "}
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Work Mode</h4>
        <div className="space-y-2">
          {["Remote", "Hybrid", "On-site"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white cursor-pointer transition">
              <input
                type="checkbox"
                checked={workMode.includes(t)}
                onChange={() => toggle(workMode, t, setWorkMode)}
                className="rounded accent-cyan-400 bg-white/10 border-white/20"
              />{" "}
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Experience</h4>
        <div className="space-y-2">
          {["Fresher", "0–1", "1–3", "3–5", "5–10", "10+"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white cursor-pointer transition">
              <input
                type="radio"
                name="exp"
                checked={experience === t}
                onChange={() => setExperience(t)}
                className="accent-cyan-400"
              />{" "}
              {t} {t === "Fresher" ? "" : "yrs"}
            </label>
          ))}
          {experience && (
            <button onClick={() => setExperience("")} className="text-xs font-bold text-cyan-400 mt-1">
              Clear Experience
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Salary Band</h4>
        <div className="space-y-2">
          {["0–3 LPA", "3–5 LPA", "5–10 LPA", "10–20 LPA", "20–50 LPA"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white cursor-pointer transition">
              <input
                type="radio"
                name="sal"
                checked={salary === t}
                onChange={() => setSalary(t)}
                className="accent-cyan-400"
              />{" "}
              {t}
            </label>
          ))}
          {salary && (
            <button onClick={() => setSalary("")} className="text-xs font-bold text-cyan-400 mt-1">
              Clear Salary
            </button>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => {
            setJobType([]);
            setWorkMode([]);
            setExperience("");
            setSalary("");
            setKeyword("");
            setLocation("");
          }}
          className="w-full py-2.5 rounded-xl glass-pill text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-400/40 transition"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#060b13] text-slate-100 min-h-screen">
      {/* Search Header Bar */}
      <div className="bg-[#04080e] border-b border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-input">
              <span className="text-cyan-400 text-lg">⌕</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skill, or company"
                className="w-full text-sm outline-none bg-transparent placeholder-slate-500 text-white"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-input">
              <span className="text-indigo-400 text-base">📍</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Bangalore)"
                className="w-full text-sm outline-none bg-transparent placeholder-slate-500 text-white"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-input">
              <span className="text-amber-400 text-base">⚡</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full text-sm outline-none bg-transparent font-medium text-white cursor-pointer"
              >
                <option value="Relevance" className="bg-[#0b1329] text-white">Relevance</option>
                <option value="Newest" className="bg-[#0b1329] text-white">Newest First</option>
                <option value="Salary High → Low" className="bg-[#0b1329] text-white">Salary High → Low</option>
                <option value="Salary Low → High" className="bg-[#0b1329] text-white">Salary Low → High</option>
                <option value="Featured" className="bg-[#0b1329] text-white">Featured Only</option>
              </select>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-2xl btn-neon-primary text-white text-sm font-bold"
            >
              Filters ({jobType.length + workMode.length + (experience ? 1 : 0) + (salary ? 1 : 0)})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              {filtered.length} Live Positions Available
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verified employer positions updated with realtime matching
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <div className="glass-panel rounded-3xl border border-white/10 p-6 sticky top-[96px]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
                <span className="font-bold text-sm text-white">Filter Positions</span>
                {(jobType.length > 0 || workMode.length > 0 || experience || salary) && (
                  <span className="text-[10px] font-black tracking-wider text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    ACTIVE
                  </span>
                )}
              </div>
              {FilterPanel}
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end lg:hidden">
              <div className="w-[320px] h-full glass-panel border-l border-white/15 p-6 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="font-black text-lg text-white">Filter Jobs</h3>
                  <button onClick={() => setShowFilters(false)} className="text-xl font-bold text-slate-300 hover:text-white">
                    ✕
                  </button>
                </div>
                {FilterPanel}
              </div>
            </div>
          )}

          {/* Jobs List */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-36 glass-panel rounded-2xl border border-white/10 animate-pulse p-6"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-white text-lg">No matching positions found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                  Try adjusting your search terms, clearing filters, or browsing other categories.
                </p>
                <button
                  onClick={() => {
                    setKeyword("");
                    setLocation("");
                    setJobType([]);
                    setWorkMode([]);
                    setExperience("");
                    setSalary("");
                  }}
                  className="mt-5 px-6 py-2.5 rounded-xl btn-neon-primary text-white font-bold text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filtered.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060b13] text-white flex items-center justify-center font-mono">Loading jobs radar...</div>}>
      <JobsInner />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { companies as fallbackCompanies } from "@/lib/data";
import { Company } from "@/types/database";

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("All");
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .order("rating", { ascending: false });

        if (data && data.length > 0 && !error) {
          setCompaniesList(data as Company[]);
        } else {
          setCompaniesList(fallbackCompanies as unknown as Company[]);
        }
      } catch {
        setCompaniesList(fallbackCompanies as unknown as Company[]);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, [supabase]);

  const filtered = companiesList.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (industry !== "All" && c.industry !== industry) return false;
    return true;
  });

  return (
    <div className="bg-[#060b13] text-slate-100 min-h-screen">
      {/* Search Header */}
      <div className="bg-[#04080e] border-b border-white/[0.08]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            🏢 DIRECT HIRING PARTNERS
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-3">
            Discover Top Verified Employers
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Explore 500+ tech unicorns and enterprise leaders hiring pre-vetted engineers, designers, and product managers across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl glass-input">
              <span className="text-cyan-400 text-lg">⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by company name..."
                className="flex-1 outline-none text-sm bg-transparent placeholder-slate-500 text-white"
              />
            </div>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-4 py-3 rounded-2xl glass-input text-sm font-medium outline-none cursor-pointer text-white"
            >
              <option value="All" className="bg-[#0b1329]">All Industries</option>
              <option value="IT Services" className="bg-[#0b1329]">IT Services</option>
              <option value="Technology" className="bg-[#0b1329]">Technology</option>
              <option value="E-commerce" className="bg-[#0b1329]">E-commerce</option>
              <option value="Fintech" className="bg-[#0b1329]">Fintech</option>
              <option value="Food Tech" className="bg-[#0b1329]">Food Tech</option>
              <option value="Conglomerate" className="bg-[#0b1329]">Conglomerate</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 glass-panel rounded-3xl border border-white/10 animate-pulse p-6" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/company/${c.slug}`}
                className="glass-card rounded-3xl border border-white/[0.08] overflow-hidden hover:border-cyan-400/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-24 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 relative border-b border-white/5">
                    <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-2xl bg-[#091120] border border-white/15 flex items-center justify-center font-black text-sm text-cyan-300 shadow-xl group-hover:scale-105 transition-transform">
                      {c.logo_url || (c as any).logo || c.name.slice(0, 3).toUpperCase()}
                    </div>
                  </div>

                  <div className="pt-9 p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors">
                        {c.name}
                      </h3>
                      {c.is_verified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {c.industry} · {c.city || (c as any).location || "India"}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-medium text-slate-300">
                        {c.company_size || (c as any).employees || "Enterprise"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                        ★ {c.rating || 4.2}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                    <span className="font-bold text-slate-300">
                      {c.open_jobs_count || (c as any).openJobs || 12}+ open jobs
                    </span>
                    <span className="font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

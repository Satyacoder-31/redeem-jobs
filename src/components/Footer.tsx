"use client";

import Link from "next/link";
import { useState } from "react";
import RedeemJobsLogo from "@/components/RedeemJobsLogo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-[#04080e] text-slate-300 border-t border-white/[0.08] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Top Newsletter Card Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[90px] pointer-events-none" />
          
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                ✨ AI JOB RADAR WEEKLY
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
                Get Curated ₹30L+ Roles Directly in Your Inbox
              </h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Join 120,000+ top software engineers and tech leaders getting confidential salary benchmarks and exclusive unlisted opportunities every Tuesday.
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2">
                  <span>✓</span>
                  <span>You&apos;re subscribed to HireKaro AI Job Radar!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="flex-1 px-4 py-3.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-neon-primary px-6 py-3.5 rounded-xl text-white font-bold text-sm shrink-0 whitespace-nowrap"
                  >
                    Subscribe Free
                  </button>
                </form>
              )}
              <div className="text-[11px] text-slate-500 mt-2">
                🔒 Zero spam. Unsubscribe anytime with 1-click.
              </div>
            </div>
          </div>
        </div>

        {/* Directory Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mt-16 pt-8 border-t border-white/[0.06]">
          {/* Brand info */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4 group hover:scale-[1.02] transition-transform">
              <div className="inline-flex px-4 py-2 rounded-2xl bg-white shadow-md border border-white/20">
                <RedeemJobsLogo variant="horizontal" height={36} />
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
              Premier Training &amp; Placement Solutions network connecting pre-skilled talent with verified enterprises, startups, and hypergrowth companies across India.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[
                { label: "𝕏", name: "Twitter" },
                { label: "in", name: "LinkedIn" },
                { label: "ig", name: "Instagram" },
                { label: "yt", name: "YouTube" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-amber-300 transition-all hover:scale-105"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Job Seekers
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/jobs" className="hover:text-cyan-300 transition">Explore 100K+ Jobs</Link></li>
              <li><Link href="/jobs?workMode=Remote" className="hover:text-cyan-300 transition">High-Paying Remote</Link></li>
              <li><Link href="/candidate/dashboard" className="hover:text-cyan-300 transition">AI Resume Scanner</Link></li>
              <li><Link href="/resources" className="hover:text-cyan-300 transition">Salary Benchmarks 2026</Link></li>
              <li><Link href="/jobs" className="hover:text-cyan-300 transition">Immediate Joining</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Employers
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/employers" className="hover:text-cyan-300 transition">Post a Job (Free)</Link></li>
              <li><Link href="/employers" className="hover:text-cyan-300 transition">Candidate Search</Link></li>
              <li><Link href="/employers" className="hover:text-cyan-300 transition">AI Screening ATS</Link></li>
              <li><Link href="/employers" className="hover:text-cyan-300 transition">Enterprise Plans</Link></li>
              <li><Link href="/companies" className="hover:text-cyan-300 transition">Employer Branding</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/about" className="hover:text-cyan-300 transition">About HireKaro</Link></li>
              <li><Link href="/companies" className="hover:text-cyan-300 transition">Verified Companies</Link></li>
              <li><Link href="/resources" className="hover:text-cyan-300 transition">Tech Career Guides</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-300 transition">Contact Support</Link></li>
              <li><Link href="/about" className="hover:text-cyan-300 transition">Press & Media</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#" className="hover:text-cyan-300 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">Security & Encryption</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">Report Fraud / Scam</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">Recruiter Verification</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & operational status */}
        <div className="border-t border-white/[0.08] mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© 2026 REDEEM JOBS — Training &amp; Placement Solutions. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">
              All systems operational · Realtime DB Connected · 99.99% uptime
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

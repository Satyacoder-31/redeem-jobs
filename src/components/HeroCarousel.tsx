"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { HeroSlide } from "@/types/database";
import RedeemJobsLogo from "@/components/RedeemJobsLogo";

const curatedSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Where India's Top 1% Tech Talent Gets Hired Faster",
    subtitle: "AI MATCHING · ZERO SPAM",
    desc_text: "Join 250,000+ engineers, product managers & designers getting direct recruiter interviews with instant salary transparency.",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80",
    cta_text: "Explore 100K+ Jobs",
    cta_url: "/jobs",
    display_order: 1,
    is_active: true,
  },
  {
    id: "2",
    title: "Direct Connect With Founders & Tech Unicorns",
    subtitle: "TOP 500+ VERIFIED HIRING PARTNERS",
    desc_text: "Skip black-hole application forms. Get your profile shortlisted directly by verified engineering leaders at Zomato, CRED, Razorpay & Google.",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
    cta_text: "Explore Top Companies",
    cta_url: "/companies",
    display_order: 2,
    is_active: true,
  },
  {
    id: "3",
    title: "AI-Powered Career Intelligence & Salary Benchmarks",
    subtitle: "REALTIME ATS SCORE & INSIGHTS",
    desc_text: "Instant ATS resume diagnostic, real-time CTC negotiation benchmarks, and automated skill-gap analysis built for high-growth tech careers.",
    image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
    cta_text: "Analyze Your Resume",
    cta_url: "/candidate/dashboard",
    display_order: 3,
    is_active: true,
  },
  {
    id: "4",
    title: "Work From Anywhere: High-Paying Remote Opportunities",
    subtitle: "GLOBAL & PAN-INDIA REMOTE ROLES",
    desc_text: "Find verified remote engineering and product jobs offering competitive global packages and flexible asynchronous culture.",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
    cta_text: "Browse Remote Jobs",
    cta_url: "/jobs?workMode=Remote",
    display_order: 4,
    is_active: true,
  },
  {
    id: "5",
    title: "Build & Scale Your Engineering Dream Team",
    subtitle: "NEXT-GEN ATS FOR FAST-PACED EMPLOYERS",
    desc_text: "Source pre-vetted candidates with 98% skill accuracy, AI-assisted screening, and transparent candidate pipelines in minutes.",
    image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80",
    cta_text: "Hire Top Talent",
    cta_url: "/employers",
    display_order: 5,
    is_active: true,
  },
];

const trendingTags = [
  { label: "✨ GenAI Engineers", query: "AI Engineer" },
  { label: "🚀 ₹35L+ Full Stack", query: "Full Stack" },
  { label: "🌐 Global Remote", query: "Remote" },
  { label: "💼 Lead Product Manager", query: "Product Manager" },
  { label: "⚡ DevOps & Platform", query: "DevOps" },
  { label: "🎨 Staff UI/UX", query: "Product Designer" },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>(curatedSlides);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [progress, setProgress] = useState(0);

  const router = useRouter();
  const supabase = createClient();
  const SLIDE_DURATION = 5500; // 5.5s per slide
  const stepInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadSlides() {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (data && data.length > 0 && !error) {
          setSlides(data as HeroSlide[]);
        }
      } catch {}
    }
    loadSlides();
  }, [supabase]);

  // Smooth slide progress timer
  useEffect(() => {
    if (paused) return;
    const tickTime = 50;
    const increment = (tickTime / SLIDE_DURATION) * 100;

    stepInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIndex((i) => (i + 1) % slides.length);
          return 0;
        }
        return prev + increment;
      });
    }, tickTime);

    return () => {
      if (stepInterval.current) clearInterval(stepInterval.current);
    };
  }, [paused, slides.length, index]);

  const goToSlide = (i: number) => {
    setIndex(i);
    setProgress(0);
  };

  const nextSlide = () => {
    setIndex((i) => (i + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const currentSlide = slides[index] || curatedSlides[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("loc", location.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div
      className="relative overflow-hidden min-h-[700px] lg:min-h-[780px] bg-[#060b13] flex flex-col justify-between"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Image Slideshow Layer */}
      {slides.map((s, i) => (
        <div
          key={s.id || i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
          }`}
        >
          <img
            src={s.image_url}
            alt={s.title}
            className={`w-full h-full object-cover object-center ${
              i === index ? "animate-kenburns scale-105" : ""
            }`}
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060b13] via-[#060b13]/85 to-[#060b13]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b13] via-transparent to-[#060b13]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/25 via-transparent to-transparent" />
        </div>
      ))}

      {/* Ambient glowing radial orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none animate-pulse-glow" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 pb-16 my-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Text & Search */}
          <div className="lg:col-span-8 max-w-3xl">
            {/* Brand Emblem & Live Placement Pulse Pill */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="px-3.5 py-1.5 rounded-full bg-white shadow-lg border border-white/20 flex items-center gap-2 hover:scale-105 transition-transform">
                <RedeemJobsLogo variant="mark-only" height={22} />
                <span className="text-[12px] font-black tracking-wider uppercase text-red-600">
                  REDEEM <span className="text-amber-500">JOBS</span>
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-200 border border-white/10 hover:border-amber-400/50 transition">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-amber-300 font-bold uppercase text-[10px] tracking-wider">
                  TRAINING &amp; PLACEMENT SOLUTIONS
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-300 text-[11px] hidden sm:inline">
                  4,820 Placement Drives Today
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[58px] font-black leading-[1.08] tracking-tight text-white">
              {currentSlide.title}
            </h1>

            {/* Subtitle / Description */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              {currentSlide.desc_text}
            </p>

            {/* High-Tech Glass Floating AI Search Console */}
            <div className="mt-8 p-2 rounded-2xl sm:rounded-3xl glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/15 max-w-3xl">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-2">
                {/* Role / Skill Input */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/[0.04] rounded-xl sm:rounded-2xl border border-white/5 focus-within:border-cyan-400/50 transition">
                  <span className="text-cyan-400 text-lg">⌕</span>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Role / Skill / Company
                    </label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. AI Engineer, React, CRED"
                      className="w-full text-sm text-white placeholder-slate-500 bg-transparent outline-none font-medium mt-0.5"
                    />
                  </div>
                </div>

                {/* Location Input */}
                <div className="sm:w-60 flex items-center gap-3 px-4 py-3 bg-white/[0.04] rounded-xl sm:rounded-2xl border border-white/5 focus-within:border-cyan-400/50 transition">
                  <span className="text-indigo-400 text-base">📍</span>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Bangalore, Remote..."
                      className="w-full text-sm text-white placeholder-slate-500 bg-transparent outline-none font-medium mt-0.5"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="btn-neon-primary px-8 py-3.5 rounded-xl sm:rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shrink-0 group transition"
                >
                  <span>Find Jobs</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </form>

              {/* Trending Quick Searches */}
              <div className="mt-3 px-2 pt-2 pb-1 border-t border-white/5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Trending:
                </span>
                {trendingTags.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setKeyword(tag.query);
                      router.push(`/jobs?q=${encodeURIComponent(tag.query)}`);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 transition font-medium"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Floating Live Platform Badges */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-4">
            {/* Holographic Card 1 */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-2xl animate-float">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                    AI
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Live AI Match Score
                    </h3>
                    <p className="text-sm font-black text-white">Staff Frontend Architect</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs">
                  98.6%
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Bangalore · Hybrid</span>
                <span className="font-bold text-cyan-300">₹38L – ₹48L CTC</span>
              </div>
            </div>

            {/* Holographic Card 2 */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-2xl animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  ⚡
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Offer Accepted Just Now</span>
                    <span className="text-[10px] text-emerald-400 font-bold">12m ago</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Product Designer at <span className="text-cyan-300">CRED</span>
                  </h4>
                </div>
              </div>
              <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[85%]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct Interview pipeline</span>
                <span className="text-slate-300 font-semibold">Response &lt; 2 hrs</span>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
              <div className="text-center flex-1 border-r border-white/10">
                <div className="text-lg font-black text-white">100K+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Jobs</div>
              </div>
              <div className="text-center flex-1 border-r border-white/10">
                <div className="text-lg font-black text-cyan-400">25K+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Companies</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-lg font-black text-emerald-400">4.9/5</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Candidate Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Slideshow Strip & Controls */}
      <div className="relative z-10 w-full bg-[#060b13]/80 backdrop-blur-xl border-t border-white/10 py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Slide Indicator Tabs with Dynamic Progress Bar */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            {slides.map((s, i) => (
              <button
                key={s.id || i}
                onClick={() => goToSlide(i)}
                className={`relative px-3.5 py-1.5 rounded-xl text-left transition-all text-xs font-semibold shrink-0 ${
                  index === i
                    ? "bg-white/15 text-white border border-cyan-400/40 shadow-lg"
                    : "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black ${index === i ? "text-cyan-400" : "text-slate-500"}`}>
                    0{i + 1}
                  </span>
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {s.title.split(" ").slice(0, 3).join(" ")}...
                  </span>
                </div>
                {/* Active Progress Strip */}
                {index === i && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 rounded-b-xl overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Navigation Controls: Counter, Pause Toggle, Next/Prev */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono font-bold text-slate-400">
              <span className="text-cyan-300">0{index + 1}</span> / 0{slides.length}
            </span>

            <button
              onClick={() => setPaused(!paused)}
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 transition"
              title={paused ? "Resume autoplay" : "Pause autoplay"}
            >
              {paused ? "▶ Play" : "❚❚ Pause"}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center text-sm font-bold transition hover:scale-105"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center text-sm font-bold transition hover:scale-105"
              >
                ›
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function ScrollEffects() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
      setShowBackToTop(totalScroll > 320);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <>
      {/* Top glowing progress bar */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[9999] bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Floating Back to Top Button with Circular Progress */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full glass-panel border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:border-cyan-400/60 group ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <svg className="w-12 h-12 absolute -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="18"
            className="stroke-white/10"
            strokeWidth="2.5"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            className="stroke-cyan-400 transition-all duration-100"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="text-sm font-bold transition-transform duration-200 group-hover:-translate-y-0.5">
          ↑
        </span>
      </button>
    </>
  );
}

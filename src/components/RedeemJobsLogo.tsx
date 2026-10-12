"use client";

import React from "react";
import Image from "next/image";

interface RedeemJobsLogoProps {
  variant?: "horizontal" | "stacked" | "mark-only" | "original";
  className?: string;
  height?: number;
  withBadge?: boolean;
}

export default function RedeemJobsLogo({
  variant = "horizontal",
  className = "",
  height = 42,
  withBadge = false,
}: RedeemJobsLogoProps) {
  // Mark-only: Just the authentic RTP emblem
  if (variant === "mark-only") {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/brand/redeem-jobs-mark-hd.png"
          alt="RTP Logo Mark"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain drop-shadow-[0_2px_8px_rgba(225,29,35,0.4)]"
          loading="eager"
        />
      </div>
    );
  }

  // Original uploaded logo as-is (with white background / card)
  if (variant === "original") {
    return (
      <div className={`inline-flex items-center justify-center rounded-xl overflow-hidden bg-white p-1 shadow-md border border-white/20 shrink-0 ${className}`}>
        <img
          src="/brand/redeem-jobs-original.jpg"
          alt="REDEEM JOBS Logo"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain"
          loading="eager"
        />
      </div>
    );
  }

  // Stacked variant: Exactly like the reference image (RTP on top, REDEEM JOBS in middle, Training & Placement Solutions on bottom)
  if (variant === "stacked") {
    const content = (
      <img
        src="/brand/redeem-jobs-hd.png"
        alt="REDEEM JOBS — Training & Placement Solutions"
        style={{ height: `${height}px`, width: "auto" }}
        className="object-contain drop-shadow-[0_2px_12px_rgba(225,29,35,0.3)] transition-transform hover:scale-[1.02]"
        loading="eager"
      />
    );

    if (withBadge) {
      return (
        <div className={`inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl border border-slate-200 shrink-0 ${className}`}>
          {content}
        </div>
      );
    }

    return (
      <div className={`inline-flex flex-col items-center justify-center shrink-0 ${className}`}>
        {content}
      </div>
    );
  }

  // Horizontal variant: Ideal for header navbar (RTP emblem on left + REDEEM JOBS & Tagline on right)
  const horizontalContent = (
    <img
      src="/brand/redeem-jobs-horizontal-hd.png"
      alt="REDEEM JOBS — Training & Placement Solutions"
      style={{ height: `${height}px`, width: "auto" }}
      className="object-contain drop-shadow-[0_2px_8px_rgba(225,29,35,0.35)] transition-transform hover:scale-[1.02]"
      loading="eager"
    />
  );

  if (withBadge) {
    return (
      <div className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-2xl bg-white shadow-md border border-slate-200 shrink-0 ${className}`}>
        {horizontalContent}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      {horizontalContent}
    </div>
  );
}

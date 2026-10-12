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
          className="object-contain drop-shadow-[0_2px_10px_rgba(239,68,68,0.45)]"
          loading="eager"
        />
      </div>
    );
  }

  // Original / Stacked variant: Authentic logo with 100% transparent background
  if (variant === "original" || variant === "stacked") {
    const content = (
      <img
        src="/brand/redeem-jobs-hd.png"
        alt="REDEEM JOBS — Training & Placement Solutions"
        style={{ height: `${height}px`, width: "auto" }}
        className="object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.02]"
        loading="eager"
      />
    );

    if (withBadge) {
      return (
        <div className={`inline-flex items-center justify-center p-3 rounded-2xl bg-white/[0.04] backdrop-blur-md shadow-xl border border-white/10 shrink-0 ${className}`}>
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
      className="object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.02]"
      loading="eager"
    />
  );

  if (withBadge) {
    return (
      <div className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-2xl bg-white/[0.04] backdrop-blur-md shadow-md border border-white/10 shrink-0 ${className}`}>
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

"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-black">Contact & Support</h1>
        <p className="text-sm text-slate-500 mt-1">We&apos;re here to help — average response time &lt; 2 hours.</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold">Send us a message</h3>
            {sent ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                ✓ Message sent! Our team will contact you at support@hirekaro.in within 24 hours.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-4 space-y-3">
                <input required placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none" />
                <input required type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none" />
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none">
                  <option>Job seeker support</option><option>Employer support</option><option>Report fraud</option><option>Other</option>
                </select>
                <textarea required placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm h-28 outline-none" />
                <button type="submit" className="w-full py-3 rounded-full bg-[#07111F] text-white font-bold text-sm">Send Message</button>
              </form>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-bold text-sm">Contact</h4>
              <div className="mt-2 text-sm text-slate-600 space-y-1">
                <div>📞 1800-123-4567 (9am–7pm IST)</div>
                <div>✉️ support@hirekaro.in</div>
                <div>📍 Bangalore · Mumbai · Delhi · Hyderabad</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-bold text-sm">Safety Center</h4>
              <p className="text-xs text-slate-500 mt-1">Report job, company or recruiter. Block unwanted contact. All reports reviewed within 24 hours.</p>
              <button className="mt-3 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-xs">Report Fraud</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

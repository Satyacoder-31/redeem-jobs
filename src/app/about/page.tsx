export default function AboutPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-widest">ABOUT HIREKARO</div>
          <h1 className="text-3xl font-black tracking-tight mt-3">Where India&apos;s Talent Meets Opportunity.</h1>
          <p className="text-slate-600 leading-relaxed mt-4">HireKaro is India&apos;s next-generation AI-powered job marketplace. We connect 10M+ professionals with 100K+ companies — from internships to leadership roles, freelance to full-time. Our mission: <b>Hiring Made Smarter. Careers Made Better.</b></p>
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { k: "Professionals", v: "10M+" },
              { k: "Companies", v: "100K+" },
              { k: "Successful Hires", v: "50K+" },
            ].map((x) => (
              <div key={x.k} className="bg-[#f8fafc] rounded-xl border border-slate-200 p-4 text-center">
                <div className="text-2xl font-black">{x.v}</div>
                <div className="text-xs font-bold tracking-widest text-slate-500">{x.k}</div>
              </div>
            ))}
          </div>
          <h2 className="font-black text-lg mt-8">Our Principles</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• <b>Trust & Safety</b> — Verified companies, fraud detection, report & block.</li>
            <li>• <b>AI with Human Review</b> — No automatic hiring decisions; recruiters always decide.</li>
            <li>• <b>India First</b> — INR/LPA, Indian cities, notice periods, education — with global architecture ready.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

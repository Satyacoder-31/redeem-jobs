import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Career Resources</h1>
        <p className="text-sm text-slate-500 mt-1">Resume guides, interview prep, salary insights & career advice — powered by HireKaro.</p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {[
            { t: "Resume Guides", d: "Build ATS-friendly resumes that pass every filter.", icon: "📄" },
            { t: "Interview Preparation", d: "HR + Technical modules for 12 functions.", icon: "🎯" },
            { t: "Salary Calculator", d: "Role · Location · Experience → Market range.", icon: "💰" },
          ].map((x) => (
            <div key={x.t} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="text-2xl">{x.icon}</div>
              <h3 className="font-bold mt-3">{x.t}</h3>
              <p className="text-sm text-slate-500 mt-1">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold">Salary Insights</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded-xl bg-[#f8fafc] border border-slate-200"><span>Software Engineer — Bangalore</span><b>₹12–22 LPA</b></div>
              <div className="flex justify-between p-2 rounded-xl bg-[#f8fafc] border border-slate-200"><span>Product Manager — Mumbai</span><b>₹25–40 LPA</b></div>
              <div className="flex justify-between p-2 rounded-xl bg-[#f8fafc] border border-slate-200"><span>Data Scientist — Remote</span><b>₹18–30 LPA</b></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold">Career Path</h3>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold">
              <span className="px-2 py-1 rounded-full bg-slate-900 text-white">Junior</span>
              <span>→</span>
              <span className="px-2 py-1 rounded-full bg-white border border-slate-200">Developer</span>
              <span>→</span>
              <span className="px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">Senior</span>
              <span>→</span>
              <span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">Lead</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">Skills required at each step + recommended learning.</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#07111F] to-[#1e3a8a] rounded-2xl p-6 text-white mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black">Try AI Resume Score — Free</h3>
            <p className="text-sm text-slate-300">Get 84/100 → improvement suggestions instantly.</p>
          </div>
          <Link href="/candidate/dashboard" className="px-6 py-3 rounded-full bg-white text-[#07111F] font-bold text-sm shrink-0">Build Resume →</Link>
        </div>
      </div>
    </div>
  );
}

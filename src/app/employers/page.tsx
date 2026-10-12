import Link from "next/link";

export default function EmployersPage() {
  return (
    <div className="bg-[#f8fafc]">
      <section className="bg-gradient-to-br from-[#07111F] via-[#0f2a6b] to-[#1e3a8a] text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest">FOR EMPLOYERS · ATS · AI MATCHING</div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none mt-4">Hire Better.<br />Hire Faster.</h1>
            <p className="text-slate-200 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">Everything you need to attract, discover, evaluate and hire exceptional talent. 10M+ professionals waiting.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/employer/dashboard" className="px-7 py-3 rounded-full bg-white text-[#07111F] font-bold hover:bg-slate-100 transition">Post a Job — Free</Link>
              <Link href="/employer/dashboard" className="px-7 py-3 rounded-full bg-white/10 border border-white/20 font-bold hover:bg-white/20 transition">Find Talent</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Job Posting", d: "Create professional job listings with AI description builder." },
            { t: "Resume Database", d: "Search 10M+ candidate profiles with boolean & natural language." },
            { t: "AI Candidate Matching", d: "92% match scoring with explainable reasons — no bias." },
            { t: "ATS Pipeline", d: "Drag-and-drop from New → Hired with notes, tags & history." },
            { t: "Employer Branding", d: "Custom cover, video, culture, benefits & reviews page." },
            { t: "Recruitment Analytics", d: "Views, conversions, funnel, time-to-hire & cost-per-hire." },
          ].map((x) => (
            <div key={x.t} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900">{x.t}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-2xl font-black text-center">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-4 gap-4 mt-8 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "₹0", features: ["1 active job", "50 resume views", "Basic support"] },
              { name: "Starter", price: "₹4,999/mo", features: ["5 jobs", "500 resume views", "Featured jobs", "Email support"], popular: false },
              { name: "Professional", price: "₹14,999/mo", features: ["20 jobs", "Unlimited search", "ATS + Analytics", "5 recruiter seats", "Priority support"], popular: true },
              { name: "Enterprise", price: "Custom", features: ["Unlimited jobs", "Dedicated CSM", "API access", "Employer branding", "SLA"], popular: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl border p-6 flex flex-col ${p.popular ? "bg-[#07111F] text-white border-slate-900 shadow-xl scale-[1.02]" : "bg-white border-slate-200"}`}>
                {p.popular && <span className="text-xs font-bold tracking-widest px-2 py-1 rounded-full bg-white text-[#07111F] w-fit">MOST POPULAR</span>}
                <h3 className={`font-black text-lg mt-2 ${p.popular ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                <div className={`text-2xl font-black mt-1 ${p.popular ? "text-white" : "text-slate-900"}`}>{p.price}</div>
                <ul className={`mt-4 space-y-2 text-sm flex-1 ${p.popular ? "text-slate-300" : "text-slate-600"}`}>
                  {p.features.map((f) => <li key={f} className="flex gap-2"><span>✓</span>{f}</li>)}
                </ul>
                <Link href="/employer/dashboard" className={`mt-6 text-center py-2.5 rounded-full font-bold text-sm ${p.popular ? "bg-white text-[#07111F]" : "bg-slate-900 text-white"}`}>Choose {p.name}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-br from-[#07111F] to-[#1e3a8a] rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-black">Start hiring in 60 seconds</h3>
          <p className="text-sm text-slate-300 mt-1">Post your first job free — no credit card required.</p>
          <Link href="/employer/dashboard" className="inline-flex mt-4 px-6 py-3 rounded-full bg-white text-[#07111F] font-bold">Post a Job Now →</Link>
        </div>
      </section>
    </div>
  );
}

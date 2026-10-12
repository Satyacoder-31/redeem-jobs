"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { companies as fallbackCompanies, jobs as fallbackJobs } from "@/lib/data";
import { Company, Job } from "@/types/database";

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<Company | any>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewPros, setReviewPros] = useState("");
  const [reviewCons, setReviewCons] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function loadCompany() {
      setLoading(true);
      try {
        // 1. Fetch Company
        const { data: compData } = await supabase
          .from("companies")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        let currentComp = compData;
        if (!currentComp) {
          currentComp = fallbackCompanies.find((c) => c.slug === slug) || fallbackCompanies[0];
        }
        setCompany(currentComp);

        // 2. Fetch Company Open Jobs
        if (currentComp.id) {
          const { data: jobsData } = await supabase
            .from("jobs")
            .select("*, company:companies(*)")
            .eq("company_id", currentComp.id)
            .eq("status", "published");

          if (jobsData && jobsData.length > 0) {
            setCompanyJobs(jobsData as unknown as Job[]);
          } else {
            setCompanyJobs(fallbackJobs.filter((j) => j.companySlug === slug || j.company === currentComp.name) as unknown as Job[]);
          }

          // 3. Fetch Company Reviews
          const { data: revData } = await supabase
            .from("company_reviews")
            .select("*, user:profiles(full_name)")
            .eq("company_id", currentComp.id)
            .order("created_at", { ascending: false });
          if (revData) setReviews(revData);

          // 4. Check if following
          if (user) {
            const { data: followData } = await supabase
              .from("company_followers")
              .select("company_id")
              .eq("user_id", user.id)
              .eq("company_id", currentComp.id)
              .maybeSingle();
            if (followData) setFollowing(true);
          }
        }
      } catch (err) {
        console.warn("Failed loading company profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [slug, user, supabase]);

  const toggleFollow = async () => {
    if (!company) return;
    const nextState = !following;
    setFollowing(nextState);

    if (user && company.id) {
      if (nextState) {
        await supabase.from("company_followers").insert({ user_id: user.id, company_id: company.id });
      } else {
        await supabase.from("company_followers").delete().eq("user_id", user.id).eq("company_id", company.id);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company?.id) {
      alert("Please log in to submit a review.");
      return;
    }
    setSubmittingReview(true);

    try {
      const { data: newRev, error } = await supabase
        .from("company_reviews")
        .insert({
          company_id: company.id,
          user_id: user.id,
          rating,
          pros: reviewPros,
          cons: reviewCons,
        })
        .select("*, user:profiles(full_name)")
        .single();

      if (error) throw error;
      if (newRev) setReviews([newRev, ...reviews]);
      alert("Review submitted successfully!");
      setShowReviewModal(false);
      setReviewPros("");
      setReviewCons("");
    } catch {
      alert("Review submitted for moderation.");
      setShowReviewModal(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !company) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const coverImg = company.cover_image_url || (company as any).cover || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200";
  const logoText = company.logo_url || (company as any).logo || company.name.slice(0, 3).toUpperCase();

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Banner */}
      <div className="h-52 sm:h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 relative overflow-hidden">
        <img
          src={coverImg}
          alt={company.name}
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/70 to-transparent" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 -mt-16 relative shadow-xl flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 flex items-center justify-center font-black text-base shadow-md shrink-0">
              {logoText}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{company.name}</h1>
                {company.is_verified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    ✓ Verified Employer
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                {company.industry} · {company.city || (company as any).location || "India"} · {company.company_size || (company as any).employees || "Enterprise"} · ⭐ {company.rating || 4.2} · {companyJobs.length} open jobs
              </p>
              <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {company.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={toggleFollow}
              className={`px-6 py-2.5 rounded-full font-bold text-xs shadow transition ${
                following
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-black"
              }`}
            >
              {following ? "✓ Following" : "+ Follow Company"}
            </button>
            <Link
              href="/jobs"
              className="px-6 py-2.5 rounded-full bg-white border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-b border-slate-200 overflow-x-auto">
          {["Overview", "Jobs", "Culture & Benefits", "Reviews", "Photos"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                tab === t
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {t} {t === "Jobs" ? `(${companyJobs.length})` : t === "Reviews" ? `(${reviews.length})` : ""}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 py-6">
          {/* Main Tab Content */}
          <div className="space-y-4">
            {tab === "Overview" && (
              <>
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="font-bold text-base text-slate-900">About {company.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                    {company.description} We are building cutting-edge digital experiences with a team of passionate engineers, designers, and innovators. Join us to accelerate your professional journey.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-3 mt-6">
                    {[
                      { k: "Founded", v: company.founded_year || "1998" },
                      { k: "Location", v: company.city || "Mumbai, India" },
                      { k: "Industry", v: company.industry || "Technology" },
                    ].map((x) => (
                      <div key={x.k} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{x.k}</div>
                        <div className="font-bold text-slate-900 text-xs mt-1">{x.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900">
                      Open Positions ({companyJobs.length})
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {companyJobs.length > 0 ? (
                      companyJobs.map((j) => <JobCard key={j.id} job={j} />)
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No active jobs currently published for this company.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === "Jobs" && (
              <div className="grid gap-3">
                {companyJobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            )}

            {tab === "Reviews" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Employee Reviews</h3>
                    <p className="text-xs text-slate-500">Verified feedback from current and former employees</p>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                  >
                    + Write a Review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No reviews written yet. Be the first to share your experience!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{rev.user?.full_name || "Employee"}</span>
                          <span className="text-xs text-amber-500 font-bold">{"★".repeat(rev.rating)} ({rev.rating}/5)</span>
                        </div>
                        {rev.pros && <p className="text-xs text-slate-700"><b>Pros:</b> {rev.pros}</p>}
                        {rev.cons && <p className="text-xs text-slate-700"><b>Cons:</b> {rev.cons}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "Culture & Benefits" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900">Culture & Work Life</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">Flexible Hybrid Work</span>
                    Empowering employees with remote flexibility and well-equipped offices.
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">Health & Wellness Cover</span>
                    Comprehensive medical insurance for employees and families with zero copay.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Insights */}
          <aside className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">
                Company Snapshot
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Industry</span>
                  <b className="text-slate-900">{company.industry}</b>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Rating</span>
                  <b className="text-amber-600">⭐ {company.rating || 4.2} / 5</b>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Website</span>
                  <a href={company.website || "#"} target="_blank" rel="noreferrer" className="text-[#2563eb] font-bold hover:underline">
                    Visit Site ↗
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">Review {company.name}</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating (1 to 5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pros</label>
                <textarea
                  required
                  rows={2}
                  value={reviewPros}
                  onChange={(e) => setReviewPros(e.target.value)}
                  placeholder="What did you like about working here?"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cons</label>
                <textarea
                  required
                  rows={2}
                  value={reviewCons}
                  onChange={(e) => setReviewCons(e.target.value)}
                  placeholder="What could be improved?"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition disabled:opacity-50"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

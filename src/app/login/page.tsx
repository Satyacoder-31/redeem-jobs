"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import RedeemJobsLogo from "@/components/RedeemJobsLogo";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const redirectPath = searchParams.get("redirect") || "";

  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { signIn, signUp } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        router.push(redirectPath || "/candidate/dashboard");
      } else if (mode === "register") {
        if (!fullName.trim()) throw new Error("Please enter your full name.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const { error } = await signUp(email, password, {
          fullName: fullName.trim(),
          role: role,
          companyName: role === "employer" ? companyName.trim() : undefined,
        });
        if (error) throw error;

        if (role === "employer" && companyName.trim()) {
          const { data: userResp } = await supabase.auth.getUser();
          if (userResp?.user) {
            const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            await supabase.from("companies").insert({
              owner_id: userResp.user.id,
              name: companyName.trim(),
              slug: slug || `comp-${Date.now()}`,
              is_verified: false,
            });
          }
        }

        router.push(redirectPath || (role === "employer" ? "/employer/dashboard" : "/candidate/dashboard"));
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?mode=reset`,
        });
        if (error) throw error;
        setSuccessMsg("Password reset link sent! Check your inbox.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#060b13] min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient glowing radial lights */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-2 inline-block hover:scale-[1.03] transition-transform">
              <RedeemJobsLogo variant="stacked" height={60} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-2">
            {mode === "login"
              ? "Sign in to Portal"
              : mode === "register"
              ? "Create Your Account"
              : "Reset Password"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "login"
              ? "Enter your credentials to access your candidate or employer portal"
              : mode === "register"
              ? "Join India's premier training & placement network"
              : "We'll send password recovery instructions"}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-medium mb-4">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-medium mb-4">
            ✓ {successMsg}
          </div>
        )}

        {/* Role Selector (Register only) */}
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl mb-4 border border-white/10">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                role === "candidate" ? "btn-neon-primary text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              💼 Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole("employer")}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                role === "employer" ? "btn-neon-primary text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              🏢 Employer / ATS
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm outline-none"
              />
            </div>
          )}

          {mode === "register" && role === "employer" && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Company Name</label>
              <input
                required
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Reliance Tech Ltd"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm outline-none"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] font-bold text-cyan-400 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-neon-primary text-white text-sm font-bold shadow-lg transition disabled:opacity-50 mt-2"
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : mode === "register"
              ? "Create Account"
              : "Send Recovery Link"}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
          {mode === "login" ? (
            <span>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060b13] text-white flex items-center justify-center font-mono">Loading authentication...</div>}>
      <LoginInner />
    </Suspense>
  );
}

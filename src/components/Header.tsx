"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { Notification } from "@/types/database";
import RedeemJobsLogo from "@/components/RedeemJobsLogo";

const navLinks = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/employers", label: "For Employers" },
  { href: "/resources", label: "Resources" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readAllClicked, setReadAllClicked] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, signOut, unreadCount } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayUnread = readAllClicked ? 0 : unreadCount;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);
    if (data) setNotifications(data);
  };

  const markAllRead = async () => {
    if (!user) return;
    setReadAllClicked(true);
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleLogout = async () => {
    await signOut();
    setUserDropdown(false);
    router.push("/");
  };

  const dashboardUrl =
    role === "admin" || role === "super_admin"
      ? "/admin"
      : role === "employer" || role === "employer_admin" || role === "recruiter"
      ? "/employer/dashboard"
      : "/candidate/dashboard";

  return (
    <header className="sticky top-0 z-50 bg-[#060b13]/85 backdrop-blur-2xl border-b border-white/[0.08] transition-colors">
      {/* Top status bar */}
      <div className="bg-[#04080e] border-b border-white/[0.04] text-xs py-1">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              India&apos;s Next-Gen AI Job Engine · <span className="text-cyan-400 font-bold">100K+ Active Jobs</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
            <span>Direct Recruiter Chat Available</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-mono">support@hirekaro.in</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[66px] gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group hover:scale-[1.03] transition-transform py-1">
            <RedeemJobsLogo variant="horizontal" height={36} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all ${
                    isActive
                      ? "bg-white/10 text-cyan-300 border border-cyan-400/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifDropdown(!notifDropdown);
                      if (!notifDropdown) loadNotifications();
                    }}
                    className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
                    aria-label="Notifications"
                  >
                    🔔
                    {displayUnread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {displayUnread > 9 ? "9+" : displayUnread}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-white/15 shadow-2xl p-4 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                        <span className="font-bold text-sm text-white">Notifications</span>
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-bold text-cyan-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              href={n.link || dashboardUrl}
                              onClick={() => setNotifDropdown(false)}
                              className={`block p-2.5 rounded-xl text-xs transition border ${
                                !n.is_read
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                                  : "border-transparent hover:bg-white/5 text-slate-300"
                              }`}
                            >
                              <div className="font-bold text-white">{n.title}</div>
                              <div className="text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      {profile?.full_name
                        ? profile.full_name[0].toUpperCase()
                        : user.email?.[0].toUpperCase() || "U"}
                    </div>
                    <span className="text-xs font-bold text-white max-w-[100px] truncate">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl border border-white/15 shadow-2xl p-2 z-50">
                      <div className="px-3 py-2 border-b border-white/10">
                        <div className="font-bold text-xs text-white truncate">
                          {profile?.full_name || "User"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {role.replace("_", " ")}
                        </span>
                      </div>

                      <div className="py-1 space-y-0.5 text-xs font-semibold text-slate-300">
                        <Link
                          href={dashboardUrl}
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition"
                        >
                          📊 Dashboard
                        </Link>
                        {role === "candidate" && (
                          <>
                            <Link
                              href="/candidate/dashboard?tab=My+Profile"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition"
                            >
                              👤 My Profile
                            </Link>
                            <Link
                              href="/candidate/dashboard?tab=Applications"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition"
                            >
                              📁 My Applications
                            </Link>
                            <Link
                              href="/candidate/dashboard?tab=Saved+Jobs"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition"
                            >
                              ♥ Saved Jobs
                            </Link>
                          </>
                        )}
                        {(role === "employer" ||
                          role === "employer_admin" ||
                          role === "recruiter") && (
                          <>
                            <Link
                              href="/employer/dashboard?action=post"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition"
                            >
                              ➕ Post a Job
                            </Link>
                            <Link
                              href="/employer/dashboard?tab=Applications"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition"
                            >
                              👥 ATS Pipeline
                            </Link>
                          </>
                        )}
                        {(role === "admin" || role === "super_admin") && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition"
                          >
                            🛡️ Control Center
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-white/10">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/login?mode=register"
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-bold text-white hover:border-cyan-400/50 hover:bg-white/10 transition"
                >
                  Register
                </Link>
                <Link
                  href="/employers"
                  className="btn-neon-primary px-5 py-2 rounded-xl text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition"
                >
                  <span>Post a Job</span>
                  <span>✨</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
            aria-label="Toggle menu"
          >
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-white/10 glass-panel px-4 py-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <Link
                  href={dashboardUrl}
                  onClick={() => setOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl btn-neon-primary text-white text-sm font-bold"
                >
                  Dashboard ({role})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="block w-full text-center py-2 text-sm font-bold text-rose-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-xl glass-pill text-sm font-bold text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/employers"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-xl btn-neon-primary text-white text-sm font-bold"
                >
                  Post a Job
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

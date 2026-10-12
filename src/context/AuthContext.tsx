"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { Profile, CandidateProfile, Company, Role } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  candidateProfile: CandidateProfile | null;
  company: Company | null;
  role: Role;
  loading: boolean;
  unreadCount: number;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: string }>;
  signUp: (
    email: string,
    password: string,
    metadata: { fullName: string; role: string; companyName?: string }
  ) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<Role>("candidate");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = createClient();

  const fetchUserData = useCallback(async (currentUser: User) => {
    try {
      // 1. Fetch Profile
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (prof && !profErr) {
        setProfile(prof as Profile);
        const resolvedRole = prof.role || "candidate";
        setRole(resolvedRole as Role);

        // 2. Fetch candidate profile if candidate
        if (resolvedRole === "candidate") {
          const { data: cProf } = await supabase
            .from("candidate_profiles")
            .select("*")
            .eq("user_id", currentUser.id)
            .single();
          if (cProf) setCandidateProfile(cProf as CandidateProfile);
        }

        // 3. Fetch company if employer/recruiter
        if (resolvedRole === "employer" || resolvedRole === "employer_admin" || resolvedRole === "recruiter") {
          const { data: compUser } = await supabase
            .from("company_users")
            .select("company:companies(*)")
            .eq("user_id", currentUser.id)
            .single();
          if (compUser && compUser.company) {
            setCompany(compUser.company as unknown as Company);
          } else {
            // Check if owner directly
            const { data: ownedComp } = await supabase
              .from("companies")
              .select("*")
              .eq("owner_id", currentUser.id)
              .single();
            if (ownedComp) setCompany(ownedComp as Company);
          }
        }
      } else {
        const metaRole = (currentUser.user_metadata?.role as Role) || "candidate";
        setRole(metaRole);
      }

      // 4. Fetch unread notifications
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", currentUser.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    } catch (err) {
      console.warn("Error fetching Supabase user profile:", err);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserData(user);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    let mounted = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        const savedUserStr = localStorage.getItem("hk_user");
        if (savedUserStr) {
          try {
            const saved = JSON.parse(savedUserStr);
            if (saved?.role) setRole(saved.role as Role);
          } catch {}
        }
        setLoading(false);
      }
    });

    // Listen to Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setCandidateProfile(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchUserData(data.user);
        const resolvedRole = (data.user.user_metadata?.role as string) || "candidate";
        localStorage.setItem("hk_role", resolvedRole);
        localStorage.setItem("hk_user", JSON.stringify({ role: resolvedRole, email: data.user.email }));
        return { error: null, role: resolvedRole };
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { fullName: string; role: string; companyName?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
            role: metadata.role,
            company_name: metadata.companyName,
          },
        },
      });
      if (error) throw error;

      if (data.user && metadata.role === "employer" && metadata.companyName) {
        try {
          const slug = metadata.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          await supabase.from("companies").insert({
            name: metadata.companyName,
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            owner_id: data.user.id,
            email: email,
          });
        } catch (e) {
          console.warn("Company auto-create notice:", e);
        }
      }

      if (data.user) {
        setUser(data.user);
        setRole(metadata.role as Role);
        localStorage.setItem("hk_role", metadata.role);
        localStorage.setItem("hk_user", JSON.stringify({ role: metadata.role, email }));
      }

      return { error: null, user: data.user };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("hk_role");
    localStorage.removeItem("hk_user");
    setUser(null);
    setProfile(null);
    setCandidateProfile(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        candidateProfile,
        company,
        role,
        loading,
        unreadCount,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

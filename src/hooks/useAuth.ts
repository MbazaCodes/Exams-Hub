// ── useAuth hook ──────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  role: "student" | "teacher" | "school_admin" | "super_admin" | "parent";
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  school_id: string | null;
  region: string | null;
}

interface AuthState {
  user:      User | null;
  profile:   Profile | null;
  loading:   boolean;
  signOut:   () => Promise<void>;
  isStudent:    boolean;
  isTeacher:    boolean;
  isSchoolAdmin: boolean;
  isSuperAdmin:  boolean;
}

export function useAuth(): AuthState {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user, profile, loading, signOut,
    isStudent:     profile?.role === "student",
    isTeacher:     profile?.role === "teacher",
    isSchoolAdmin: profile?.role === "school_admin",
    isSuperAdmin:  profile?.role === "super_admin",
  };
}

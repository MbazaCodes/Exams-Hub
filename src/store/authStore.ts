<<<<<<< HEAD
﻿import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, type StudentRow } from "@/lib/supabase";

interface AuthState {
  student: StudentRow | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login:   (email: string, password: string) => Promise<{ error?: string }>;
  logout:  () => Promise<void>;
  refresh: () => Promise<void>;
=======
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

interface AuthState {
  student: Record<string, unknown> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
}

export const useAuthStore = create<AuthState>()(
  persist(
<<<<<<< HEAD
    (set, get) => ({
      student: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ isLoading: false });
          return { error: error.message };
        }
        // Fetch student profile
        const { data: profile } = await supabase
          .from("students")
          .select("*")
          .eq("id", data.user.id)
          .single();
        set({ student: profile, isAuthenticated: true, isLoading: false });
        return {};
      },

=======
    (set) => ({
      student: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { set({ isLoading: false }); return { error: error.message }; }
        const { data: profile } = await supabase.from("students").select("*").eq("id", data.user.id).single();
        set({ student: profile, isAuthenticated: true, isLoading: false });
        return {};
      },
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
      logout: async () => {
        await supabase.auth.signOut();
        set({ student: null, isAuthenticated: false });
      },
<<<<<<< HEAD

      refresh: async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) { set({ student: null, isAuthenticated: false }); return; }
        const { data: profile } = await supabase
          .from("students")
          .select("*")
          .eq("id", data.user.id)
          .single();
        set({ student: profile, isAuthenticated: !!profile });
      },
=======
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
    }),
    { name: "examhub-auth", partialize: (s) => ({ student: s.student, isAuthenticated: s.isAuthenticated }) }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, type StudentRow } from "@/lib/supabase";

interface AuthState {
  student: StudentRow | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login:   (email: string, password: string) => Promise<{ error?: string }>;
  logout:  () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
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

      logout: async () => {
        await supabase.auth.signOut();
        set({ student: null, isAuthenticated: false });
      },

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
    }),
    { name: "examhub-auth", partialize: (s) => ({ student: s.student, isAuthenticated: s.isAuthenticated }) }
  )
);

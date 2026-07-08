import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

interface AuthState {
  student: Record<string, unknown> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
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
      logout: async () => {
        await supabase.auth.signOut();
        set({ student: null, isAuthenticated: false });
      },
    }),
    { name: "examhub-auth", partialize: (s) => ({ student: s.student, isAuthenticated: s.isAuthenticated }) }
  )
);

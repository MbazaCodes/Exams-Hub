import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface AuthStore {
  user:            User | null;
  profile:         Profile | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
  initialize:      () => Promise<void>;
  login:           (identifier: string, password: string) => Promise<{ error?: string }>;
  logout:          () => Promise<void>;
  clearError:      () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:            null,
      profile:         null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { set({ isLoading: false }); return; }
        const { data: profile } = await supabase
          .from("profiles").select("*").eq("id", session.user.id).single();
        set({ user: session.user, profile: profile as Profile, isAuthenticated: true, isLoading: false });

        supabase.auth.onAuthStateChange(async (_event, s) => {
          if (!s) { set({ user: null, profile: null, isAuthenticated: false }); return; }
          const { data: p } = await supabase.from("profiles").select("*").eq("id", s.user.id).single();
          set({ user: s.user, profile: p as Profile, isAuthenticated: true });
        });
      },

      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        // Support phone or email login
        const isPhone = /^[\d+]/.test(identifier) && !identifier.includes("@");
        const creds = isPhone
          ? { phone: identifier, password }
          : { email: identifier, password };

        const { data, error: authErr } = await supabase.auth.signInWithPassword(creds as any);
        if (authErr) { set({ isLoading: false, error: authErr.message }); return { error: authErr.message }; }

        const { data: profile } = await supabase
          .from("profiles").select("*").eq("id", data.user.id).single();
        set({ user: data.user, profile: profile as Profile, isAuthenticated: true, isLoading: false });
        return {};
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name:    "examhub-auth",
      storage: createJSONStorage(() => sessionStorage), // sessionStorage: cleared on tab close
      partialize: (s) => ({ profile: s.profile, isAuthenticated: s.isAuthenticated }),
    }
  )
);

import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const C = { navy:"#0A1628", indigo:"#4F46E5", gold:"#F59E0B", muted:"#94A3B8" };

// Role hierarchy — higher index = more access
const ROLE_HIERARCHY = ["student", "teacher", "school_admin", "super_admin"];

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: "student" | "teacher" | "school_admin" | "super_admin";
  fallback?: string;
}

export function AuthGuard({ children, requiredRole, fallback = "/" }: AuthGuardProps) {
  const [session, setSession]   = useState<Session | null | undefined>(undefined);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!mounted) return;

      // Not logged in → redirect to login
      if (!s) {
        navigate(fallback, { replace: true });
        return;
      }

      setSession(s);

      if (requiredRole) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", s.user.id)
          .single();

        const userRole    = profileData?.role ?? "student";
        const userLevel   = ROLE_HIERARCHY.indexOf(userRole);
        const neededLevel = ROLE_HIERARCHY.indexOf(requiredRole);

        if (userLevel < 0 || neededLevel < 0 || userLevel < neededLevel) {
          // Redirect to the correct portal for their role instead of generic /dashboard
          const roleRoutes: Record<string, string> = {
            student:      "/dashboard",
            teacher:      "/teacher",
            school_admin: "/school",
            super_admin:  "/superadmin",
          };
          navigate(roleRoutes[userRole] ?? "/dashboard", { replace: true });
          return;
        }
      }

      // All checks passed — show the page
      if (mounted) setChecking(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      if (!s) navigate(fallback, { replace: true });
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  if (checking) return (
    <div style={{ minHeight:"100vh", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,${C.indigo},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"#fff" }}>E</div>
      <div style={{ width:28, height:28, border:`3px solid rgba(99,102,241,0.3)`, borderTopColor:C.indigo, borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!session) return null;
  return <>{children}</>;
}

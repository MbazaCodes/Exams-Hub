import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const C = { navy:"#0A1628", indigo:"#4F46E5", gold:"#F59E0B", muted:"#94A3B8" };

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
      if (!s) { navigate(fallback, { replace: true }); return; }
      setSession(s);

      if (requiredRole) {
        const { data } = await supabase.from("profiles").select("role").eq("id", s.user.id).single();
        const hierarchy = ["student","teacher","school_admin","super_admin"];
        if (hierarchy.indexOf(data?.role) < hierarchy.indexOf(requiredRole)) {
          navigate("/dashboard", { replace: true }); return;
        }
      }
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

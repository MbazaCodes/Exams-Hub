import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const ROLE_ROUTES: Record<string, string> = {
  student:      "/dashboard",
  teacher:      "/teacher",
  school_admin: "/school",
  super_admin:  "/superadmin",
  parent:       "/dashboard",
};

export function RoleRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate("/"); return; }
      const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      navigate(ROLE_ROUTES[data?.role ?? "student"] ?? "/dashboard", { replace: true });
    });
  }, []);
  return null;
}

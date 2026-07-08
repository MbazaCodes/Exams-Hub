import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ok  = (data: unknown)        => new Response(JSON.stringify(data),           { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const err = (msg: string, s = 400) => new Response(JSON.stringify({ error: msg }), { status: s,   headers: { ...corsHeaders, "Content-Type": "application/json" } });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { full_name, email, phone, password, school_id, subjects, classes, qualification, employee_id } = await req.json();

    if (!full_name || !email || !password || !school_id)
      return err("full_name, email, password and school_id are required");

    // Verify caller role
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return err("Unauthorized", 401);

    const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!["school_admin", "super_admin"].includes(caller?.role ?? ""))
      return err("Forbidden — school_admin or super_admin required", 403);

    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role: "teacher" },
    });
    if (authErr) return err(authErr.message);
    const userId = authData.user.id;

    // Update profile
    await supabase.from("profiles").update({
      full_name, phone: phone || null, school_id, role: "teacher",
    }).eq("id", userId);

    // Create teacher record
    const { error: tErr } = await supabase.from("teachers").insert({
      id: userId,
      subjects:       subjects      || [],
      classes:        classes       || [],
      qualification:  qualification || null,
      employee_id:    employee_id   || null,
      joined_date:    new Date().toISOString().split("T")[0],
    });
    if (tErr) return err(tErr.message);

    // Welcome notification
    await supabase.from("notifications").insert({
      user_id: userId, type: "system",
      title: `Welcome, ${full_name.split(" ")[0]}! 👋`,
      body:  "Your ExamHub teacher account is ready. Create exams and track student progress.",
    });

    return ok({ success: true, user_id: userId });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : "Unexpected error", 500);
  }
});

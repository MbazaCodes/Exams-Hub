// ── Edge Function: create-teacher ─────────────────────────────
import { supabaseAdmin, corsHeaders, respond, error } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { full_name, email, phone, password, school_id, subjects, classes, qualification, employee_id } = body;

    if (!full_name || !email || !password || !school_id) return error("full_name, email, password and school_id are required");

    // Verify caller is school_admin or super_admin
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return error("Unauthorized", 401);
    const { data: caller } = await supabaseAdmin.from("profiles").select("role,school_id").eq("id", user.id).single();
    if (!["school_admin","super_admin"].includes(caller?.role)) return error("Forbidden", 403);

    // Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role: "teacher" },
    });
    if (authErr) return error(authErr.message);

    const userId = authData.user.id;

    await supabaseAdmin.from("profiles").update({
      full_name, phone: phone || null, school_id, role: "teacher",
    }).eq("id", userId);

    await supabaseAdmin.from("teachers").insert({
      id: userId,
      subjects: subjects || [],
      classes:  classes  || [],
      qualification: qualification || null,
      employee_id:   employee_id   || null,
      joined_date:   new Date().toISOString().split("T")[0],
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: userId, type: "system",
      title: `Welcome, ${full_name.split(" ")[0]}! 👋`,
      body: "Your ExamHub teacher account is ready. You can now create exams and track student progress.",
    });

    return respond({ success: true, user_id: userId });
  } catch (e) {
    return error(e.message, 500);
  }
});

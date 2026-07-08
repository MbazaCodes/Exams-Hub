// ExamHub Tanzania — Edge Function: create-teacher
// Only school_admin or super_admin may call this.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function ok(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
}
function fail(msg: string, status = 400): Response {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseService) return fail("Supabase env vars not set", 503);

  const admin = createClient(supabaseUrl, supabaseService, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Verify caller is authorised
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    if (!token) return fail("Missing Authorization header", 401);

    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return fail("Invalid or expired token", 401);

    const { data: caller } = await admin
      .from("profiles").select("role").eq("id", user.id).single();

    if (!["school_admin", "super_admin"].includes(caller?.role ?? "")) {
      return fail("Forbidden — school_admin or super_admin required", 403);
    }

    const body = await req.json();
    const { full_name, email, phone, password, school_id, subjects, classes, qualification, employee_id } = body;

    if (!full_name || !email || !password || !school_id) {
      return fail("full_name, email, password and school_id are required");
    }

    // Create auth user
    const { data: authData, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "teacher" },
    });
    if (createErr) return fail(createErr.message);
    const userId = authData.user.id;

    // Update profile
    await admin.from("profiles").update({
      full_name,
      phone:    phone || null,
      school_id,
      role: "teacher",
    }).eq("id", userId);

    // Insert teacher record
    const { error: tErr } = await admin.from("teachers").insert({
      id:            userId,
      subjects:      Array.isArray(subjects) ? subjects : [],
      classes:       Array.isArray(classes)  ? classes  : [],
      qualification: qualification || null,
      employee_id:   employee_id   || null,
      joined_date:   new Date().toISOString().split("T")[0],
    });
    if (tErr) return fail(tErr.message);

    // Welcome notification
    await admin.from("notifications").insert({
      user_id: userId,
      type:    "system",
      title:   `Welcome, ${full_name.split(" ")[0]}! 👋`,
      body:    "Your ExamHub teacher account is ready.",
    });

    return ok({ success: true, user_id: userId });
  } catch (e: unknown) {
    return fail(`Server error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});

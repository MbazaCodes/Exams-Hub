// ExamHub Tanzania — Edge Function: create-student
// Creates a new student account (auth user + profile + student row).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function ok(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function fail(msg: string, status = 400): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseService) {
    return fail("Supabase env vars not set", 503);
  }

  const admin = createClient(supabaseUrl, supabaseService, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await req.json();
    const {
      full_name, phone, email, password, gender, dob,
      school_id, region, level, combination, class_name, admission_number,
    } = body;

    if (!full_name || !password || !level) {
      return fail("full_name, password and level are required");
    }
    if (!phone && !email) {
      return fail("phone or email is required");
    }

    // 1 — Create auth user
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email:         email || `${phone}@examhub.tz`,
      phone:         phone || undefined,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "student" },
    });

    if (authErr) return fail(authErr.message);
    const userId = authData.user.id;

    // 2 — Fill profile (trigger already inserted it)
    await admin.from("profiles").update({
      full_name,
      phone:         phone      || null,
      gender:        gender     || null,
      date_of_birth: dob        || null,
      region:        region     || null,
      school_id:     school_id  || null,
    }).eq("id", userId);

    // 3 — Insert student record
    const { error: stuErr } = await admin.from("students").insert({
      id:               userId,
      level,
      combination:      combination     || null,
      class_name:       class_name      || null,
      admission_number: admission_number || null,
    });
    if (stuErr) return fail(stuErr.message);

    // 4 — Welcome notification
    await admin.from("notifications").insert({
      user_id: userId,
      type:    "system",
      title:   `Welcome to ExamHub, ${full_name.split(" ")[0]}! 🎉`,
      body:    "Your account is ready. Start with a past paper to see how you're doing.",
    });

    return ok({ success: true, user_id: userId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return fail(`Server error: ${msg}`, 500);
  }
});

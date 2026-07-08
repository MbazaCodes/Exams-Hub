// ── Edge Function: create-student ─────────────────────────────
// POST /functions/v1/create-student
// Body: { full_name, phone, email, password, gender, dob,
//         school_id, region, level, combination, class_name }
import { supabaseAdmin, corsHeaders, respond, error } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { full_name, phone, email, password, gender, dob, school_id, region, level, combination, class_name, admission_number } = body;

    if (!full_name || !password || !level) return error("full_name, password and level are required");
    if (!phone && !email) return error("phone or email is required");

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: email || `${phone}@examhub.tz`,
      phone: phone || undefined,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "student" },
    });
    if (authErr) return error(authErr.message);

    const userId = authData.user.id;

    // 2. Update profile (trigger created it)
    await supabaseAdmin.from("profiles").update({
      full_name, phone, gender, date_of_birth: dob, region, school_id,
    }).eq("id", userId);

    // 3. Create student record
    const { error: stuErr } = await supabaseAdmin.from("students").insert({
      id: userId, level, combination: combination || null,
      class_name: class_name || null, admission_number: admission_number || null,
    });
    if (stuErr) return error(stuErr.message);

    // 4. Send welcome notification
    await supabaseAdmin.from("notifications").insert({
      user_id: userId, type: "system",
      title: `Welcome to ExamHub, ${full_name.split(" ")[0]}! 🎉`,
      body: `Your account is ready. Start with a past paper to see how you're doing.`,
    });

    return respond({ success: true, user_id: userId, message: "Student created successfully" });
  } catch (e) {
    return error(e.message, 500);
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ok  = (data: unknown)        => new Response(JSON.stringify(data),       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const err = (msg: string, s = 400) => new Response(JSON.stringify({ error: msg }), { status: s,   headers: { ...corsHeaders, "Content-Type": "application/json" } });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      full_name, phone, email, password, gender, dob,
      school_id, region, level, combination, class_name, admission_number,
    } = await req.json();

    if (!full_name || !password || !level)      return err("full_name, password and level are required");
    if (!phone && !email)                        return err("phone or email is required");

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: email || `${phone}@examhub.tz`,
      phone: phone || undefined,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "student" },
    });
    if (authErr) return err(authErr.message);
    const userId = authData.user.id;

    // 2. Update profile (auto-created by trigger)
    await supabase.from("profiles").update({
      full_name, phone: phone || null, gender: gender || null,
      date_of_birth: dob || null, region: region || null,
      school_id: school_id || null,
    }).eq("id", userId);

    // 3. Create student record
    const { error: stuErr } = await supabase.from("students").insert({
      id: userId, level,
      combination:       combination || null,
      class_name:        class_name  || null,
      admission_number:  admission_number || null,
    });
    if (stuErr) return err(stuErr.message);

    // 4. Welcome notification
    await supabase.from("notifications").insert({
      user_id: userId, type: "system",
      title: `Welcome to ExamHub, ${full_name.split(" ")[0]}! 🎉`,
      body:  "Your account is ready. Start with a past paper to see how you're doing.",
    });

    return ok({ success: true, user_id: userId });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : "Unexpected error", 500);
  }
});

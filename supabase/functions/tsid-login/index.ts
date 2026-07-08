// ExamHub Tanzania — Edge Function: tsid-login
// Looks up auth email by TSID number so frontend can call signInWithPassword

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function ok(d: unknown): Response { return new Response(JSON.stringify(d), { status:200, headers:{...CORS,"Content-Type":"application/json"} }); }
function fail(m: string, s=400): Response { return new Response(JSON.stringify({error:m}), { status:s, headers:{...CORS,"Content-Type":"application/json"} }); }

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return fail("Supabase env not set", 503);

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const body = await req.json();
    const tsid = String(body.tsid ?? "").toUpperCase().trim();

    if (!tsid)                        return fail("tsid is required");
    if (!/^TSID\d{8}$/.test(tsid))   return fail("Invalid TSID format. Must be TSID + 8 digits e.g. TSID00010234");

    // Find ExamHub profile linked to this TSID
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("tsid", tsid)
      .single();

    if (profErr || !profile) return fail("No ExamHub account is linked to this TSID number. Please register first or link your TSID from your account settings.");
    if (!profile.is_active)  return fail("Your account has been deactivated. Please contact support.");

    // Fetch email via service role (safe — still requires correct password)
    const { data: { user }, error: uErr } = await admin.auth.admin.getUserById(profile.id);
    if (uErr || !user?.email) return fail("Account error — contact support.");

    return ok({ success: true, email: user.email, role: profile.role, full_name: profile.full_name });
  } catch (e: unknown) {
    return fail(`Server error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
